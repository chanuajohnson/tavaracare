-- EMERGENCY FIX: Fix profiles table RLS policies causing infinite recursion
-- First drop ALL existing policies, then recreate with proper non-recursive ones

-- Step 1: Drop ALL possible existing policies on profiles table
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Get all policies on profiles table and drop them
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
    END LOOP;
END $$;

-- Step 2: Create simple, non-recursive policies using ONLY auth.uid()
-- Users can view their own profile
CREATE POLICY "users_own_profile_select" ON public.profiles
FOR SELECT USING (id = auth.uid());

-- Users can update their own profile  
CREATE POLICY "users_own_profile_update" ON public.profiles
FOR UPDATE USING (id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "users_own_profile_insert" ON public.profiles
FOR INSERT WITH CHECK (id = auth.uid());

-- Admins can view all profiles (using JWT metadata to avoid recursion)
CREATE POLICY "admins_view_all_profiles" ON public.profiles
FOR SELECT USING (
  COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
    'family'
  ) = 'admin'
);

-- Step 3: Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;