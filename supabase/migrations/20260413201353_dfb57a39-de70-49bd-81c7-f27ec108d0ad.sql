-- Allow family users to DELETE pending payroll entries on their own care plans
CREATE POLICY "Family can delete pending payroll entries"
ON public.payroll_entries
FOR DELETE
USING (
  payment_status = 'pending'
  AND EXISTS (
    SELECT 1 FROM public.care_plans cp
    WHERE cp.id = payroll_entries.care_plan_id
    AND cp.family_id = auth.uid()
  )
);

-- Allow family users to UPDATE work_logs status (for resetting to pending after payroll delete)
CREATE POLICY "Family can reset work log status on their care plans"
ON public.work_logs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.care_plans cp
    WHERE cp.id = work_logs.care_plan_id
    AND cp.family_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.care_plans cp
    WHERE cp.id = work_logs.care_plan_id
    AND cp.family_id = auth.uid()
  )
);