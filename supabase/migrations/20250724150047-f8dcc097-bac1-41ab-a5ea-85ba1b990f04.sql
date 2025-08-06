-- Phase 2B: Fix Admin Function to Match Successful RLS Implementation
-- Replace recursive get_current_user_role() with JWT metadata (same approach that fixed RLS)

CREATE OR REPLACE FUNCTION public.admin_get_user_journey_progress(target_user_id uuid)
RETURNS TABLE(user_id uuid, role text, current_step integer, total_steps integer, completion_percentage numeric, last_activity_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Use JWT metadata check (matching successful RLS approach)
  IF COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
    'family'
  ) != 'admin' THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
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
END;
$$;