-- Drop existing admin_delete_user function and recreate it properly
DROP FUNCTION IF EXISTS public.admin_delete_user(uuid);

-- Create admin_delete_user function to safely delete users
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  executing_admin_id UUID;
  target_user_exists BOOLEAN := FALSE;
  target_user_role TEXT;
  deleted_profile_data JSONB;
BEGIN
  -- Get executing admin ID
  executing_admin_id := auth.uid();
  
  -- Verify executing user is admin using auth metadata first
  IF NOT (
    COALESCE((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role', 'family') = 'admin'
  ) THEN
    -- Fallback: check profiles table
    IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = executing_admin_id AND role = 'admin'
    ) THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Only administrators can delete other users',
        'error_code', 'INSUFFICIENT_PERMISSIONS'
      );
    END IF;
  END IF;
  
  -- Prevent self-deletion for safety
  IF executing_admin_id = target_user_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Administrators cannot delete their own account',
      'error_code', 'SELF_DELETION_PREVENTED'
    );
  END IF;
  
  -- Check if target user exists in auth.users
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE id = target_user_id
  ) INTO target_user_exists;
  
  IF NOT target_user_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found: ' || target_user_id,
      'error_code', 'USER_NOT_FOUND'
    );
  END IF;
  
  -- Get target user profile data before deletion for logging
  SELECT 
    jsonb_build_object(
      'id', id,
      'role', role,
      'full_name', full_name,
      'email', (SELECT email FROM auth.users WHERE id = target_user_id)
    )
  INTO deleted_profile_data
  FROM profiles 
  WHERE id = target_user_id;
  
  -- Store target user role
  SELECT role INTO target_user_role FROM profiles WHERE id = target_user_id;
  
  BEGIN
    -- Delete from profiles first (this will cascade to related tables due to foreign keys)
    DELETE FROM profiles WHERE id = target_user_id;
    
    -- Delete from auth.users (this should cascade to auth-related tables)
    DELETE FROM auth.users WHERE id = target_user_id;
    
    -- Log the deletion in admin communications
    INSERT INTO admin_communications (
      admin_id,
      target_user_id,
      message_type,
      custom_message,
      sent_at
    ) VALUES (
      executing_admin_id,
      target_user_id,
      'user_deleted',
      format('User %s (%s) with role %s was deleted by admin', 
             COALESCE(deleted_profile_data->>'full_name', 'Unknown'),
             COALESCE(deleted_profile_data->>'email', 'Unknown'),
             COALESCE(target_user_role, 'Unknown')),
      NOW()
    );
    
    RETURN jsonb_build_object(
      'success', true,
      'message', 'User successfully deleted',
      'deleted_user', deleted_profile_data
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Handle any deletion errors
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Failed to delete user: ' || SQLERRM,
      'error_code', 'DELETION_FAILED'
    );
  END;
END;
$$;