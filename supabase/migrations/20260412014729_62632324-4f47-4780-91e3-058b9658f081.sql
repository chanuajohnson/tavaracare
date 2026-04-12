CREATE POLICY "Assigned professionals can view their care plans"
  ON public.care_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.care_team_members ctm
      WHERE ctm.care_plan_id = care_plans.id
        AND ctm.caregiver_id = auth.uid()
        AND ctm.status = 'active'
    )
  );