-- EMERGENCY FIX: Complete profiles table RLS cleanup and care_plans policy cleanup
-- This fixes infinite recursion issues and restores data access

-- Phase 1: Drop ALL existing policies on profiles table to eliminate recursion
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

-- Phase 2: Create clean, non-recursive profiles policies using ONLY auth.uid()
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

-- Family users can view their assigned professional profiles (fixes "Unknown Professional")
CREATE POLICY "family_can_view_assigned_professionals" ON public.profiles
FOR SELECT USING (
  role = 'professional' 
  AND EXISTS (
    SELECT 1 
    FROM care_team_members ctm
    JOIN care_plans cp ON cp.id = ctm.care_plan_id
    WHERE ctm.caregiver_id = profiles.id
    AND ctm.status = 'active'
    AND cp.family_id = auth.uid()
  )
);

-- Phase 3: Clean up redundant care_plans policies (keep only the main one)
DROP POLICY IF EXISTS "Only families can create care plans" ON public.care_plans;
DROP POLICY IF EXISTS "Only families can update their care plans" ON public.care_plans;
DROP POLICY IF EXISTS "Only families can delete their care plans" ON public.care_plans;
-- Note: "family_owns_care_plans" policy already exists and covers all operations

-- Phase 4: Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;