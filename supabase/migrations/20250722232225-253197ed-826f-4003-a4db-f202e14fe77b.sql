-- Fix RLS circular dependency and streamline journey progress access

-- First, drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view their own journey progress" ON user_journey_progress;
DROP POLICY IF EXISTS "Admins can view all journey progress" ON user_journey_progress;
DROP POLICY IF EXISTS "Users can update their own journey progress" ON user_journey_progress;
DROP POLICY IF EXISTS "Admins can update all journey progress" ON user_journey_progress;

-- Create or update the security definer function for role checking (already exists but ensuring it's correct)
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role text;
BEGIN
  -- First try to get role from auth metadata
  BEGIN
    user_role := (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role';
    IF user_role IS NOT NULL THEN
      RETURN user_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Continue to fallback
  END;
  
  -- Fallback: direct query without RLS
  SELECT role INTO user_role 
  FROM profiles 
  WHERE id = auth.uid();
  
  RETURN user_role;
END;
$$;

-- Create simplified, non-recursive policies for user_journey_progress
CREATE POLICY "Users access own progress"
ON user_journey_progress
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Admins access all progress"
ON user_journey_progress
FOR ALL
USING (get_current_user_role() = 'admin');

-- Update the admin function to use better error handling and logging
CREATE OR REPLACE FUNCTION admin_get_user_journey_progress(target_user_id uuid)
RETURNS TABLE(user_id uuid, role text, current_step integer, total_steps integer, completion_percentage numeric, last_activity_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_role text;
BEGIN
  -- Get current user role using the security definer function
  current_user_role := get_current_user_role();
  
  -- Check if current user is admin
  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required. Current role: %', current_user_role;
  END IF;
  
  -- Log the access attempt for debugging
  RAISE LOG 'Admin % accessing journey progress for user %', auth.uid(), target_user_id;
  
  -- Return journey progress for the specified user
  RETURN QUERY
  SELECT 
    ujp.user_id,
    ujp.role,
    ujp.current_step,
    ujp.total_steps,
    ujp.completion_percentage,
    ujp.last_activity_at
  FROM user_journey_progress ujp
  WHERE ujp.user_id = target_user_id;
  
  -- Log if no data found
  IF NOT FOUND THEN
    RAISE LOG 'No journey progress found for user %', target_user_id;
  END IF;
END;
$$;