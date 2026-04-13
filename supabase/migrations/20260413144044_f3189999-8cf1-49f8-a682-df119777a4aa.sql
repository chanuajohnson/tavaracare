CREATE POLICY "professionals_can_view_assigned_families"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    role = 'family'
    AND EXISTS (
      SELECT 1 FROM care_team_members ctm
      JOIN care_plans cp ON cp.id = ctm.care_plan_id
      WHERE ctm.caregiver_id = auth.uid()
        AND ctm.status = 'active'
        AND cp.family_id = profiles.id
    )
  );