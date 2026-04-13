

## Plan: Fix "Unknown Family" on Professional Dashboard

### Root Cause
The `profiles` table RLS has no SELECT policy allowing professionals to view the family profiles they are assigned to via `care_team_members`. The professional can only see their own profile (`users_own_profile_select`), so the family profile query returns empty, resulting in "Unknown Family".

### Fix
Add one RLS policy to the `profiles` table:

```sql
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
```

This mirrors the existing `family_can_view_assigned_professionals` policy but in reverse: professionals can see the family profile for any care plan they are actively assigned to.

### Files to modify
| File | Change |
|------|--------|
| **Migration** | Add `professionals_can_view_assigned_families` SELECT policy on `profiles` |

### No frontend changes needed
The `ProfessionalProfileHub.tsx` already queries profiles correctly (line 258-261). Once the RLS policy permits the SELECT, `familyProfile.full_name` will resolve and "Unknown Family" will show the actual family name (Ana).

