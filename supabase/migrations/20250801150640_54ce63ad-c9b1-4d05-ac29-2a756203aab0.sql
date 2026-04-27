-- EMERGENCY RLS FIX: Complete cleanup to restore care management system
-- This migration will fix infinite recursion and restore access to care plans

-- Step 1: Temporarily disable RLS on profiles to stop all recursion
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies on profiles table (complete nuclear cleanup)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Professionals can view family profiles via assignments" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by users who have access" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Professional access to family profiles" ON public.profiles;
DROP POLICY IF EXISTS "Family profiles accessible by professionals" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access" ON public.profiles;
DROP POLICY IF EXISTS "Users manage own data" ON public.profiles;

-- Step 3: Create minimal, safe policies using ONLY auth.uid() and JWT metadata
CREATE POLICY "users_own_profile_select" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_own_profile_update" ON public.profiles  
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_own_profile_insert" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin policy using JWT metadata directly to avoid recursion
CREATE POLICY "admin_full_access" ON public.profiles
FOR ALL USING (
  COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
    'family'
  ) = 'admin'
);

-- Step 4: Re-enable RLS with clean policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Ensure care_plans policies are also clean
DROP POLICY IF EXISTS "Care plans are viewable by involved users" ON public.care_plans;
DROP POLICY IF EXISTS "Care plans viewable by family and caregivers" ON public.care_plans;

-- Create single, clean care plans policy
CREATE POLICY "care_plans_access" ON public.care_plans
FOR SELECT USING (
  family_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM care_team_members 
    WHERE care_team_members.care_plan_id = care_plans.id 
    AND care_team_members.caregiver_id = auth.uid()
    AND care_team_members.status = 'active'
  )
);

-- Verify policies are working by testing the get_current_user_role function
-- Update it to use only JWT metadata to prevent any recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  -- Only use auth.jwt() metadata to avoid infinite recursion
  -- Never query the profiles table from this function
  RETURN COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
    'family'  -- Default role if no metadata found
  );
END;
$$;