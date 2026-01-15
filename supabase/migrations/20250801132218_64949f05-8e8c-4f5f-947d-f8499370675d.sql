-- Fix infinite recursion by updating the problematic RLS policies
-- First, let's drop the duplicate care plans policy that might be causing issues
DROP POLICY IF EXISTS "Care plans are viewable by family and authorized caregivers" ON public.care_plans;

-- Ensure we have a clean, non-recursive care plans policy
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

-- Update the get_current_user_role function to be completely safe from recursion
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