-- Create or replace admin_delete_user function to handle orphaned profiles
CREATE OR REPLACE FUNCTION admin_delete_user(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  profile_exists boolean := false;
  auth_user_exists boolean := false;
  result_message text;
BEGIN
  -- Check if current user is admin
  IF NOT (auth.jwt() ->> 'user_metadata')::jsonb ? 'role' OR 
     (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' != 'admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Access denied: Admin privileges required',
      'error_code', 'ACCESS_DENIED'
    );
  END IF;

  -- Check if profile exists
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = target_user_id
  ) INTO profile_exists;

  -- Check if auth user exists
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE id = target_user_id
  ) INTO auth_user_exists;

  -- If neither exists, return error
  IF NOT profile_exists AND NOT auth_user_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found in any table',
      'error_code', 'USER_NOT_FOUND'
    );
  END IF;

  -- Delete from profiles table if exists
  IF profile_exists THEN
    DELETE FROM profiles WHERE id = target_user_id;
    result_message := 'Successfully deleted user profile';
  END IF;

  -- If auth user exists, we would need to use the admin API to delete it
  -- For now, we'll handle orphaned profiles which is the main issue
  IF auth_user_exists AND NOT profile_exists THEN
    result_message := 'Auth user exists but no profile found';
  ELSIF profile_exists AND auth_user_exists THEN
    result_message := 'Successfully deleted user profile (auth user still exists - use admin API for complete deletion)';
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', result_message,
    'profile_deleted', profile_exists,
    'auth_user_exists', auth_user_exists
  );
END;
$$;