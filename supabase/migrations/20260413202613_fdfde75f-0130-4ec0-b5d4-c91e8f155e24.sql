
-- Allow families to delete pending work logs for their care plans
CREATE POLICY "Families can delete pending work logs"
ON public.work_logs
FOR DELETE
TO authenticated
USING (
  status = 'pending'
  AND EXISTS (
    SELECT 1 FROM care_plans cp
    WHERE cp.id = work_logs.care_plan_id
      AND cp.family_id = auth.uid()
  )
);

-- Allow professionals to delete their own pending work logs
CREATE POLICY "Professionals can delete own pending work logs"
ON public.work_logs
FOR DELETE
TO authenticated
USING (
  status = 'pending'
  AND EXISTS (
    SELECT 1 FROM care_team_members ctm
    WHERE ctm.id = work_logs.care_team_member_id
      AND ctm.caregiver_id = auth.uid()
  )
);

-- Allow families to update payroll entries (for undo payment) on their care plans
CREATE POLICY "Families can update payroll entries for their care plans"
ON public.payroll_entries
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM care_plans cp
    WHERE cp.id = payroll_entries.care_plan_id
      AND cp.family_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM care_plans cp
    WHERE cp.id = payroll_entries.care_plan_id
      AND cp.family_id = auth.uid()
  )
);
