
-- Create security definer function to get user journey progress without RLS recursion
CREATE OR REPLACE FUNCTION get_user_journey_progress_secure(target_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  role text,
  current_step integer,
  total_steps integer,
  completion_percentage numeric,
  last_activity_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Return journey progress for the specified user without RLS checks
  RETURN QUERY
  SELECT 
    ujp.user_id,
    ujp.role,
    ujp.current_step,
    ujp.total_steps,
    ujp.completion_percentage,
    ujp.last_activity_at,
    ujp.created_at,
    ujp.updated_at
  FROM user_journey_progress ujp
  WHERE ujp.user_id = target_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_journey_progress_secure(uuid) TO authenticated;

-- Create security definer function to get journey progress for current user
CREATE OR REPLACE FUNCTION get_current_user_journey_progress()
RETURNS TABLE(
  user_id uuid,
  role text,
  current_step integer,
  total_steps integer,
  completion_percentage numeric,
  last_activity_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Return journey progress for the current authenticated user
  RETURN QUERY
  SELECT 
    ujp.user_id,
    ujp.role,
    ujp.current_step,
    ujp.total_steps,
    ujp.completion_percentage,
    ujp.last_activity_at,
    ujp.created_at,
    ujp.updated_at
  FROM user_journey_progress ujp
  WHERE ujp.user_id = auth.uid();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_current_user_journey_progress() TO authenticated;
