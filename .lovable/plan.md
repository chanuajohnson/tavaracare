

## Plan: Fix Family Approval Visibility on Admin Checklist

### Root Cause

Two issues found:

**1. RLS blocks family from saving their approval**
The `onboarding_checklists` table has these RLS policies:
- `Admins can manage all onboarding checklists` (ALL for admins)
- `Families can view their own onboarding checklist` (SELECT only)

There is **no UPDATE policy** for families. When User1 Family checks the Service Commencement Approval box, the `supabase.update()` call is silently blocked by RLS. The error is caught but only logged to console — no toast feedback to the user.

**2. No Family Feedback Summary on admin page**
The admin checklist page has a "Professional Feedback Summary" card (showing approval status, notes acknowledged, etc.) but there is **no equivalent card for the Family tab**. Even once the approval saves correctly, the admin would have no visual indicator of it.

### Changes

#### 1. Add RLS UPDATE policy for families (Migration)
Create an UPDATE policy allowing families to update their own checklist row's `checked_items`:

```sql
CREATE POLICY "Families can update their own onboarding checklist"
ON public.onboarding_checklists
FOR UPDATE
TO authenticated
USING (family_id = auth.uid())
WITH CHECK (family_id = auth.uid());
```

#### 2. Add Family Feedback Summary card on admin page
**File: `src/pages/admin/AdminOnboardingChecklistPage.tsx`**

Add a "Family Feedback Summary" card (similar to the Professional one) on the Family tab showing:
- Service Commencement Approval status (Approved with date, or Pending)
- Notes acknowledged count
- Overall items checked count

This reads `family_approval_confirmed` and `family_approval_date` from the already-loaded `checkedItems`.

#### 3. Add error toast on family page
**File: `src/pages/family/FamilyOnboardingChecklistPage.tsx`**

Add a `toast.error()` in the catch block of `handleApprove` so the family user gets feedback if the save fails, rather than silent failure.

### Files to modify

| File | Change |
|------|--------|
| **Migration** | Add UPDATE RLS policy on `onboarding_checklists` for families |
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Add "Family Feedback Summary" card showing approval status on Family tab |
| `src/pages/family/FamilyOnboardingChecklistPage.tsx` | Add toast.error on approval save failure |

