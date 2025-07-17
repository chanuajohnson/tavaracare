-- Fix infinite recursion in RLS policies by removing problematic policies on profiles table
-- and replacing with direct auth.uid() checks

-- Drop the problematic RLS policy that causes infinite recursion on profiles table
DROP POLICY IF EXISTS "Admins can update matching availability" ON profiles;

-- Create a new admin policy that doesn't use get_current_user_role() to avoid recursion
CREATE POLICY "Admins can update profiles" ON profiles
FOR UPDATE 
USING (
  -- Check if user is admin by looking at their role directly without function
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  )
);

-- Also fix the care_team_members policy to avoid potential recursion
DROP POLICY IF EXISTS "Care team members are viewable by involved users and admins" ON care_team_members;

CREATE POLICY "Care team members are viewable by involved users and admins" ON care_team_members
FOR SELECT 
USING (
  family_id = auth.uid() 
  OR caregiver_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  )
);

-- Add a better policy for profile viewing that doesn't cause recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can view their own profile" ON profiles
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE 
USING (id = auth.uid());

-- Add policy for profile creation
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
CREATE POLICY "Users can create their own profile" ON profiles
FOR INSERT 
WITH CHECK (id = auth.uid());