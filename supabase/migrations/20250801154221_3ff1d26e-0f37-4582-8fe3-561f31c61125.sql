-- Add RLS policy to allow family users to view professional profiles 
-- of caregivers assigned to their care plans

CREATE POLICY "family_can_view_assigned_professionals" ON public.profiles
FOR SELECT USING (
  -- Allow family users to view professional profiles when:
  -- 1. The current user is a family member
  -- 2. The profile being viewed is a professional 
  -- 3. That professional is a care team member on one of the family's care plans
  public.get_current_user_role() = 'family' 
  AND profiles.role = 'professional'
  AND EXISTS (
    SELECT 1 
    FROM care_team_members ctm
    INNER JOIN care_plans cp ON cp.id = ctm.care_plan_id
    WHERE ctm.caregiver_id = profiles.id
    AND cp.family_id = auth.uid()
    AND ctm.status = 'active'
  )
);