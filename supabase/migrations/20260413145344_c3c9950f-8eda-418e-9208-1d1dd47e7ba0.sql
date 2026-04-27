-- Add tracking columns to work_logs
ALTER TABLE public.work_logs ADD COLUMN IF NOT EXISTS submitted_by_user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.work_logs ADD COLUMN IF NOT EXISTS submitted_by_role TEXT;

-- Family can insert work logs for their care plans
CREATE POLICY "Family can insert work logs for their care plans"
  ON public.work_logs FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM care_plans
      WHERE care_plans.id = care_plan_id
        AND care_plans.family_id = auth.uid()
    )
  );

-- Professionals can insert work logs for their assigned shifts
CREATE POLICY "Professionals can insert their own work logs"
  ON public.work_logs FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM care_team_members
      WHERE care_team_members.id = care_team_member_id
        AND care_team_members.caregiver_id = auth.uid()
    )
  );

-- Family can update pending work logs on their care plans
CREATE POLICY "Family can update pending work logs"
  ON public.work_logs FOR UPDATE TO authenticated
  USING (
    status = 'pending'
    AND EXISTS (
      SELECT 1 FROM care_plans
      WHERE care_plans.id = care_plan_id
        AND care_plans.family_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM care_plans
      WHERE care_plans.id = care_plan_id
        AND care_plans.family_id = auth.uid()
    )
  );

-- Professionals can update their own pending work logs
CREATE POLICY "Professionals can update their own pending work logs"
  ON public.work_logs FOR UPDATE TO authenticated
  USING (
    status = 'pending'
    AND EXISTS (
      SELECT 1 FROM care_team_members
      WHERE care_team_members.id = care_team_member_id
        AND care_team_members.caregiver_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM care_team_members
      WHERE care_team_members.id = care_team_member_id
        AND care_team_members.caregiver_id = auth.uid()
    )
  );

-- Admin ALL on payroll_entries
CREATE POLICY "Admins can manage all payroll entries"
  ON public.payroll_entries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));