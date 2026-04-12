

## Plan: Fix "Unnamed Care Plan" / "Unknown Family" Display for Professionals

### Root Cause
The `care_plans` table has no RLS policy allowing professionals to read care plans they're assigned to via `care_team_members`. When Tricia's browser queries `care_plans`, RLS returns zero rows. The code falls back to "Unnamed Care Plan" / "Unknown Family".

The `profiles` table likely has a similar issue for reading family profiles — but the code already fetches family profiles separately and those appear to work (the admin match path shows "Unknown Family" too, which suggests the family profile fetch may also be blocked in some cases).

### Fix: Single SQL Migration

Add a SELECT policy on `care_plans` so professionals assigned via `care_team_members` can read their assigned care plans:

```sql
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
```

This is a **database-only fix** — no code changes needed. The existing `fetchCarePlanAssignments` logic in `ProfessionalProfileHub.tsx` already correctly fetches care plan titles and family profiles. Once RLS allows the SELECT, the real titles and family names will display.

### Files Modified

| File | Change |
|------|--------|
| **Migration** (new SQL) | Add SELECT policy on `care_plans` for assigned professionals |

