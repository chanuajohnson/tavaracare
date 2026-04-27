-- Phase 1: RLS Policy Cleanup - Fix Infinite Recursion
-- Remove ALL existing policies on user_journey_progress that could cause recursion

DROP POLICY IF EXISTS "Admins can manage all journey progress" ON user_journey_progress;
DROP POLICY IF EXISTS "Users access own progress" ON user_journey_progress; 
DROP POLICY IF EXISTS "Users can insert their own journey progress" ON user_journey_progress;
DROP POLICY IF EXISTS "Users can view their journey progress" ON user_journey_progress;
DROP POLICY IF EXISTS "Users can manage their own journey progress" ON user_journey_progress;

-- Create clean, non-recursive JWT-based policies
CREATE POLICY "Users can manage their own journey progress" 
ON user_journey_progress 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all journey progress" 
ON user_journey_progress 
FOR ALL 
TO authenticated
USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin')
WITH CHECK ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin');