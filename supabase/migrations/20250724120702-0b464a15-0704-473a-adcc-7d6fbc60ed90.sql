-- Phase 2: Fix security vulnerability - replace insecure JWT metadata access
-- Replace the admin policy that uses auth.jwt() with secure approach

-- Drop the insecure admin policy
DROP POLICY IF EXISTS "Admins can manage all journey progress" ON user_journey_progress;

-- Create secure admin policy using existing profiles table lookup
-- This avoids both recursion and insecure JWT metadata access
CREATE POLICY "Admins can manage all journey progress" 
ON user_journey_progress 
FOR ALL 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Also ensure RLS is enabled on user_journey_progress table
ALTER TABLE user_journey_progress ENABLE ROW LEVEL SECURITY;