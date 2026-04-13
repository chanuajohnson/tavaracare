

## Plan: Show Family Medications on Admin Onboarding Checklist and Admin Dashboard

### Problem
The admin onboarding checklist at `/admin/onboarding-checklist` shows "Medication Confirmation 0/3" with generic checklist items, but does NOT display the actual medication records for the selected family (e.g., "Coveram 10/5mg"). The family's own onboarding page does fetch and display these inline. Additionally, `/dashboard/admin` has no medication visibility at all.

Ana Maria Aimey has 1 medication ("Coveram 10/5mg, prescription") under her care plan "Care plan for Mum" — but admin can't see it anywhere.

### Changes

#### 1. Fetch and display actual medications on admin onboarding checklist
**File: `src/pages/admin/AdminOnboardingChecklistPage.tsx`**

When a family is selected on the Family tab:
- Look up their care plan(s) from `care_plans` where `family_id = selectedId`
- Fetch medications from `medications` where `care_plan_id` matches
- Display the medication list inline under the "Medication Confirmation" section (same blue card style used on the family page), showing name, dosage, type, frequency, and schedule
- Show "No medications found" amber warning if none exist

This mirrors exactly what `FamilyOnboardingChecklistPage.tsx` does at lines 496-540.

#### 2. Add medication summary to admin dashboard
**File: `src/pages/dashboard/AdminDashboard.tsx`** (or wherever the admin user report modal lives)

In the admin user report/profile modal (visible in screenshot as "Ana Maria Aimey" modal with Profile/Journey/Reports tabs):
- Add a "Medications" data row in the Reports tab showing the count and names of medications for the family's care plan(s)
- This gives admin quick visibility without navigating to the onboarding checklist

### Technical Details

Medication fetch query (used in both places):
```sql
SELECT m.* FROM medications m
JOIN care_plans cp ON cp.id = m.care_plan_id
WHERE cp.family_id = :selectedFamilyId
```

No RLS issues — admin already has full access to both `care_plans` and `medications` tables.

### Files to modify

| File | Change |
|------|--------|
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Add medication data fetch when family selected; render medication cards under "Medication Confirmation" section |
| Admin user report modal component (needs identification) | Add medication count/names to family report data |

### No migration needed
Admin already has full table access. Frontend-only changes.

