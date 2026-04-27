-- Drop the problematic RLS policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can update matching availability" ON profiles;

-- Create a new policy using the existing get_current_user_role() function
-- This avoids infinite recursion by using a SECURITY DEFINER function
CREATE POLICY "Admins can update matching availability" ON profiles
FOR UPDATE 
USING (get_current_user_role() = 'admin');