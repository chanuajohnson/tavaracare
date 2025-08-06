-- Phase 1: Remove ALL function-based RLS policies that could cause recursion

-- Drop problematic policies on user_journey_progress table
DROP POLICY IF EXISTS "Admins can manage journey progress" ON user_journey_progress;
DROP POLICY IF EXISTS "Admins access all progress" ON user_journey_progress;
DROP POLICY IF EXISTS "Users can view their own journey progress" ON user_journey_progress;
DROP POLICY IF EXISTS "Users can update their own journey progress" ON user_journey_progress;

-- Create new JWT-based policies without recursion
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