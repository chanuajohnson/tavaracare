

## Plan: Fix Work Log Submission, Duplicate Prevention, and Professional Access

This plan addresses the core issues you raised across multiple scenarios: RLS policy failures, duplicate submission prevention, professional work log access, and admin approval workflow.

### Problems Identified

1. **Work log INSERT fails for family and professional** — The `work_logs` table only has SELECT policies for family and caregiver roles. No INSERT policy exists for either, so only admin can create work logs.

2. **No `submitted_by` tracking** — The `work_logs` table has no column to track who submitted the log (family, professional, or admin), so there's no way to show "already submitted by X."

3. **No duplicate prevention at RLS/UI level** — The `checkDuplicateWorkLog` function exists in code but the SELECT query it runs also fails for family users (the SELECT policy checks `care_plans.family_id = auth.uid()` but the duplicate check queries by `care_team_member_id`). Even if it worked, there's no UI indication that hours were already logged.

4. **Professional "Work Logs" card goes nowhere** — The card in `ActionCardsGrid.tsx` has no click handler or link.

5. **Payroll entries table missing admin policy** — Admin can't manage payroll entries (no ALL policy).

6. **Post-onboarding demarcation** — Requested but will be handled separately as it's a larger UI/UX change.

---

### Changes

#### 1. Database Migration — Add `submitted_by` columns and RLS policies

Add columns to `work_logs`:
- `submitted_by_user_id UUID` — who submitted
- `submitted_by_role TEXT` — 'family', 'professional', or 'admin'

Add RLS policies:
- **Family can INSERT work logs** for their care plans
- **Professional can INSERT work logs** for shifts they are assigned to
- **Family can UPDATE work logs** (for their care plans, pending status only)
- **Professional can UPDATE work logs** (for their own, pending status only)
- **Admin ALL on payroll_entries**

```sql
-- Add tracking columns
ALTER TABLE work_logs ADD COLUMN submitted_by_user_id UUID REFERENCES auth.users(id);
ALTER TABLE work_logs ADD COLUMN submitted_by_role TEXT;

-- Family can insert work logs for their care plans
CREATE POLICY "Family can insert work logs for their care plans"
  ON public.work_logs FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM care_plans
      WHERE care_plans.id = work_logs.care_plan_id
        AND care_plans.family_id = auth.uid()
    )
  );

-- Professionals can insert work logs for their assigned shifts
CREATE POLICY "Professionals can insert their own work logs"
  ON public.work_logs FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM care_team_members
      WHERE care_team_members.id = work_logs.care_team_member_id
        AND care_team_members.caregiver_id = auth.uid()
    )
  );

-- Admin ALL on payroll_entries
CREATE POLICY "Admins can manage all payroll entries"
  ON public.payroll_entries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

#### 2. Update `createWorkLog` in `workLogCore.ts` — Pass `submitted_by` info

Modify `createWorkLog` to accept and persist `submitted_by_user_id` and `submitted_by_role` from the current auth session.

#### 3. Update `WorkLogForm.tsx` and `useWorkLogForm.ts` — Add duplicate check UI

Before showing the form, check if a work log already exists for this shift. If it does, show a read-only summary: "Hours already submitted by [Admin/Family/Professional] on [date]" with the details, instead of the form.

#### 4. Update `ShiftCalendar.tsx` — Visual indicator for logged shifts

Show a checkmark or "Logged" badge on shifts that already have work logs, so users see at a glance which shifts have been submitted.

#### 5. Connect professional "Work Logs" card — Link to care plan

Make the Work Logs card in `ActionCardsGrid.tsx` navigate to the selected care plan's Payroll & Hours tab, or show an inline list of the professional's work logs.

#### 6. Allow professional to log hours from their care plan view

The professional already sees the care plan tabs via `CarePlanTabs.tsx`. Ensure the Schedule tab's "Log Hours" button works for professionals (it will once the INSERT RLS policy is added). Pass the current user's role so `submitted_by_role` is set correctly.

---

### Files to modify

| File | Change |
|------|--------|
| **Migration** | Add `submitted_by_user_id`, `submitted_by_role` columns; INSERT policies for family/professional; admin ALL on `payroll_entries` |
| `src/services/care-plans/work-logs/workLogCore.ts` | Include `submitted_by_user_id` and `submitted_by_role` in INSERT |
| `src/services/care-plans/work-logs/shiftService.ts` | Pass auth user info to `createWorkLog` |
| `src/services/care-plans/types/workLogTypes.ts` | Add `submitted_by_user_id` and `submitted_by_role` to types |
| `src/components/care-plan/WorkLogForm.tsx` | Add duplicate check — show "already submitted" instead of form |
| `src/components/care-plan/ShiftCalendar.tsx` | Show visual indicator on shifts with existing work logs |
| `src/components/professional/profile/ActionCardsGrid.tsx` | Link Work Logs card to care plan payroll tab |

### Post-onboarding demarcation (separate follow-up)

The request to move the onboarding progress section below care plans once commencement is approved is a UI restructuring task that should be addressed separately to keep this change focused and testable.

