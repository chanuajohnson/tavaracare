-- Add RLS policy to allow family users to view their assigned professional profiles
-- This fixes the "Unknown Professional" issue where profiles: null in JOIN queries

CREATE POLICY "family_can_view_assigned_professionals" ON public.profiles
FOR SELECT USING (
  -- Allow family users to view professional profiles if:
  -- 1. The profile is a professional role
  -- 2. That professional is an active care team member on family's care plans
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