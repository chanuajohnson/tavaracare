-- Fix infinite recursion in RLS policies by updating problematic policies
-- Drop and recreate policies that cause infinite recursion on profiles table

-- First, let's fix any policies on profiles table that reference itself
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create safe RLS policies for profiles table using JWT metadata
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles  
FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (id = auth.uid());

-- Allow admins to view all profiles using the safe get_current_user_role function
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.get_current_user_role() = 'admin');

-- Fix care plans policies to ensure they work correctly
DROP POLICY IF EXISTS "Care plans are viewable by family and authorized caregivers" ON public.care_plans;

-- Recreate care plans policy to avoid any potential recursion
CREATE POLICY "Care plans are viewable by involved users" ON public.care_plans
FOR SELECT USING (
  family_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM care_team_members 
    WHERE care_team_members.care_plan_id = care_plans.id 
    AND care_team_members.caregiver_id = auth.uid()
    AND care_team_members.status = 'active'
  )
);

-- Update get_current_user_role function to be more robust
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
BEGIN
  -- Only use auth.jwt() metadata to avoid infinite recursion
  -- Never query the profiles table from this function
  RETURN COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
    'family'  -- Default role if no metadata found
  );
END;
$function$;