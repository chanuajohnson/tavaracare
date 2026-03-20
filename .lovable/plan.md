

## Fix Journey Progress + Reports for Admin User View

Three issues found affecting how Ana Maria Aimey's progress displays in the admin dashboard:

---

## Issues Identified

### Issue 1: RLS blocks admin from reading assessment data
The `care_needs_family` table only allows `auth.uid() = profile_id` for SELECT. When an admin views another user's data, the query returns null — making the assessment appear incomplete even though it exists.

**Same issue affects:** `care_recipient_profiles` (need to check), `medications`, `meal_plans`

### Issue 2: Journey step number mismatch
The `journey_steps` table uses step_numbers: 1, 2, **5**, 6, 7, 8, 9, 10, 12, 13, 14, 15. But the code's switch statement checks cases 1-8 sequentially, expecting step 2 = assessment. In reality:
- Step 2 in DB = "Complete your registration" (but code checks `careAssessment`)
- Step 5 in DB = "Complete Initial Care Assessment" (no matching case)

### Issue 3: Build error (duplicate data-lov-id)
The `lovable-tagger` plugin is injecting attributes twice. The source files are clean — this is a build pipeline issue that resolves on re-deploy.

---

## Plan

### Step 1: Add admin RLS policies for family data tables

Create a migration adding admin SELECT policies to:
- `care_needs_family` — allow admin to read any user's assessment
- `care_recipient_profiles` — allow admin to read any user's care recipient data

Policy pattern: `(public.is_current_user_admin())` for SELECT

### Step 2: Fix step number mapping in useUserSpecificProgress.ts

Update the switch statement (lines 157-184) to match actual `journey_steps` table step_numbers:
- Case 1: Account created (check `profile` exists)
- Case 2: Registration complete (check `full_name`, `phone_number`, `address`, `care_recipient_name`, `relationship`)
- Case 5: Care assessment (check `careAssessment`)
- Case 6: Legacy story (check `careRecipient?.full_name`)
- Case 7: Caregiver matches unlocked (check profile + assessment complete)
- Case 8: Medication management
- Case 9: Meal management
- Case 10: Schedule visit
- Case 12-15: Trial and conversion steps

### Step 3: Fix useComprehensiveUserData.ts Reports assessment status

The logic is correct (`assessmentComplete = !!careNeedsData`) but fails silently due to RLS. The RLS fix in Step 1 will resolve this. Add a console warning if the query returns null unexpectedly.

---

## Files Changed

| Action | File | Description |
|--------|------|-------------|
| Create | `supabase/migrations/[timestamp]_admin_rls_care_data.sql` | Add admin SELECT policies for care_needs_family and care_recipient_profiles |
| Modify | `src/hooks/useUserSpecificProgress.ts` | Fix switch-case step numbers to match journey_steps table |
| Modify | `src/hooks/admin/useComprehensiveUserData.ts` | Add error logging for RLS-blocked queries |

---

## Expected Result After Fix

- Ana Maria Aimey's Journey tab: **6 of 12 steps** (42%) — matching the DB calculation
- Reports tab: Assessment shows **Complete**
- Admin can see all user data regardless of RLS restrictions designed for end users

