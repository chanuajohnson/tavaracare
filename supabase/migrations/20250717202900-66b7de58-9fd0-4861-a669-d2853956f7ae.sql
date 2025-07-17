-- Fix infinite recursion in RLS policies by removing get_current_user_role() usage
-- Drop the problematic admin policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a new admin policy that checks role directly without using get_current_user_role()
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT 
USING (
  -- Check if user is admin by looking at their role directly
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  )
  OR 
  -- Allow users to view their own profiles
  id = auth.uid()
);

-- Ensure all basic user policies exist
DO $$
BEGIN
    -- Check if the policy exists before creating it
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can view their own profile'
    ) THEN
        CREATE POLICY "Users can view their own profile" ON profiles
        FOR SELECT 
        USING (id = auth.uid());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile" ON profiles
        FOR UPDATE 
        USING (id = auth.uid());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can create their own profile'
    ) THEN
        CREATE POLICY "Users can create their own profile" ON profiles
        FOR INSERT 
        WITH CHECK (id = auth.uid());
    END IF;
END $$;