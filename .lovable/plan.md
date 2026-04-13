

## Plan: Enable Professional Work Hour Logging from Schedule + Fix Missing RLS

### What's Wrong

1. **No "Log Hours" button on inline shift cards** — The professional's Schedule tab shows shift cards inline, but the "Log Hours" button only appears inside the detail dialog (when clicking a shift date). Professionals don't realize they need to click into the dialog first.

2. **No SELECT policy on `work_logs` for professionals** — Even if a professional logs hours, they can't see their own work logs in the Payroll tab because there's no RLS SELECT policy allowing it. Only admins have ALL access.

3. **No DELETE policy on `work_logs` for professionals** — You mentioned professionals should be able to edit and delete (but not approve) their own pending work logs. There's no DELETE policy.

### Changes

#### 1. Add "Log Hours" button to inline shift cards (ProfessionalCalendar.tsx)

Currently the inline shift list (lines 342-397) only shows shift info with no action buttons. Add a "Log Hours" button on each shift where `isUserShift === true`, matching the existing button in the dialog (lines 481-510). This lets professionals click directly on their shift card to log hours without opening the dialog first.

#### 2. Add SELECT and DELETE RLS policies for professionals on `work_logs` (new migration)

```sql
-- Professionals can view their own work logs
CREATE POLICY "Professionals can view their own work logs"
  ON public.work_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM care_team_members
      WHERE care_team_members.id = care_team_member_id
        AND care_team_members.caregiver_id = auth.uid()
    )
  );

-- Family can view work logs on their care plans
CREATE POLICY "Family can view work logs for their care plans"
  ON public.work_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM care_plans
      WHERE care_plans.id = care_plan_id
        AND care_plans.family_id = auth.uid()
    )
  );

-- Professionals can delete their own pending work logs
CREATE POLICY "Professionals can delete their own pending work logs"
  ON public.work_logs FOR DELETE TO authenticated
  USING (
    status = 'pending'
    AND EXISTS (
      SELECT 1 FROM care_team_members
      WHERE care_team_members.id = care_team_member_id
        AND care_team_members.caregiver_id = auth.uid()
    )
  );
```

#### 3. No approve button for professionals

The existing `WorkLogForm` submits with `status: 'pending'`. The approve/reject actions in `PayrollTab` are only available to admin/family via the care management page. Professionals can only submit, edit, and delete — never approve. No code change needed here; this is already correct by design.

### Files Modified

| File | Change |
|------|--------|
| `src/components/professional/ProfessionalCalendar.tsx` | Add "Log Hours" button to inline shift cards (not just in dialog) |
| New migration SQL | Add SELECT, DELETE policies for professionals on `work_logs`; add SELECT for family |

### Summary for the User

After this change, when a professional (like Denise or Tricia) views their Schedule tab and sees their assigned shift, they'll see a **"Log Hours"** button right on the shift card. Clicking it opens the work log form. Once submitted, the hours appear in the Payroll & Hours tab as a pending entry that only admin or family can approve or deny. Professionals can edit or delete their own pending logs but cannot approve them.

