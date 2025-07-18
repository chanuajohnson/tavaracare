-- Final fix for infinite recursion - complete cleanup and recreation
-- First, find and drop all policies that use get_current_user_role()
DO $$
DECLARE
    policy_rec RECORD;
BEGIN
    -- Get all policies that use get_current_user_role()
    FOR policy_rec IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE (qual LIKE '%get_current_user_role%' OR with_check LIKE '%get_current_user_role%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_rec.policyname, 
                      policy_rec.schemaname, 
                      policy_rec.tablename);
        RAISE NOTICE 'Dropped policy: % on table: %.%', 
                     policy_rec.policyname, 
                     policy_rec.schemaname, 
                     policy_rec.tablename;
    END LOOP;
END $$;

-- Drop all existing policies on profiles table to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles; 
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Professionals are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Family users can view professional profiles" ON profiles;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Recreate essential policies without recursion
CREATE POLICY "Users can view their own profile" ON profiles
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE 
USING (id = auth.uid());

CREATE POLICY "Users can create their own profile" ON profiles
FOR INSERT 
WITH CHECK (id = auth.uid());

-- Add a simple policy for professionals to be viewable by authenticated users
-- This allows the caregiver matching to work without recursion
CREATE POLICY "Professionals are viewable by authenticated users" ON profiles
FOR SELECT 
USING (role = 'professional' AND auth.uid() IS NOT NULL);

-- Allow family users to view professional profiles for matching
CREATE POLICY "Family users can view professional profiles" ON profiles
FOR SELECT 
USING (role = 'professional' AND auth.uid() IS NOT NULL);