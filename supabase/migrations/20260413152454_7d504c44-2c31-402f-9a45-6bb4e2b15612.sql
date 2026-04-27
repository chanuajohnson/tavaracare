CREATE POLICY "professionals_can_view_care_plan_teammates"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM care_team_members ctm1
      JOIN care_team_members ctm2 ON ctm2.care_plan_id = ctm1.care_plan_id
      WHERE ctm1.caregiver_id = auth.uid()
        AND ctm1.status = 'active'
        AND ctm2.caregiver_id = profiles.id
        AND ctm2.status = 'active'
    )
  );