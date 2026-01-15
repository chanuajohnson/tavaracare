-- Complete RLS policy cleanup to fix infinite recursion issues

-- First, drop ALL problematic policies on profiles table that might cause recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Professionals can view family profiles via assignments" ON public.profiles;

-- Recreate safe profiles policies using only auth.uid() and helper functions
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles  
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin policy using the safe function
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.get_current_user_role() = 'admin');

-- Professional access policy - avoid recursion by using direct auth checks
CREATE POLICY "Professionals can view family profiles via assignments" ON public.profiles
FOR SELECT USING (
  public.get_current_user_role() = 'professional' AND
  role = 'family' AND
  (
    -- Manual assignments
    EXISTS (
      SELECT 1 FROM admin_match_interventions ami
      WHERE ami.family_user_id = profiles.id 
      AND ami.caregiver_id = auth.uid()
      AND ami.status = 'active'
    )
    OR
    -- Care team assignments  
    EXISTS (
      SELECT 1 FROM care_team_members ctm
      WHERE ctm.family_id = profiles.id
      AND ctm.caregiver_id = auth.uid()
      AND ctm.status = 'active'
    )
    OR
    -- Automatic assignments
    EXISTS (
      SELECT 1 FROM automatic_assignments aa
      WHERE aa.family_user_id = profiles.id
      AND aa.caregiver_id = auth.uid()
      AND aa.is_active = true
    )
  )
);

-- Remove any duplicate care plans policies
DROP POLICY IF EXISTS "Care plans are viewable by involved users" ON public.care_plans;

-- Ensure the care plans policy is clean (this should already exist from previous migration)
DROP POLICY IF EXISTS "Care plans viewable by family and caregivers" ON public.care_plans;
CREATE POLICY "Care plans viewable by family and caregivers" ON public.care_plans
FOR SELECT USING (
  family_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM care_team_members 
    WHERE care_team_members.care_plan_id = care_plans.id 
    AND care_team_members.caregiver_id = auth.uid()
    AND care_team_members.status = 'active'
  )
);