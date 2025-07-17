-- Check and fix only the missing policies
-- First, ensure the problematic policy that causes infinite recursion is dropped
DROP POLICY IF EXISTS "Admins can update matching availability" ON profiles;

-- Only create missing policies for profiles table
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