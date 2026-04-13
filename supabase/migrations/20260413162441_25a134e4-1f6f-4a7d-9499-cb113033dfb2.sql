-- Professionals can view their own work logs (via care_team_members link)
CREATE POLICY "Professionals can view their own work logs"
  ON public.work_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM care_team_members
      WHERE care_team_members.id = work_logs.care_team_member_id
        AND care_team_members.caregiver_id = auth.uid()
    )
  );

-- Family can view work logs on their care plans
CREATE POLICY "Family can view work logs for their care plans"
  ON public.work_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM care_plans
      WHERE care_plans.id = work_logs.care_plan_id
        AND care_plans.family_id = auth.uid()
    )
  );

-- Professionals can delete their own pending work logs only
CREATE POLICY "Professionals can delete their own pending work logs"
  ON public.work_logs FOR DELETE TO authenticated
  USING (
    status = 'pending'
    AND EXISTS (
      SELECT 1 FROM care_team_members
      WHERE care_team_members.id = work_logs.care_team_member_id
        AND care_team_members.caregiver_id = auth.uid()
    )
  );