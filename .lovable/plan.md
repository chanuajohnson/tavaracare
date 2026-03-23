

## Root Cause: Professional Fields Not Persisting + Progress Discrepancy

### Issue 1: Data Not Persisting

**Root cause found.** The one-param `update_user_profile(profile_data jsonb)` function (used by `ProfessionalRegistration.tsx` at line 507) is **missing all professional-specific fields**. Looking at the function body (lines 12-46 of migration `20260323131242`), it only updates family-oriented fields like `care_recipient_name`, `relationship`, `care_types`, etc.

**Missing from the one-param function:**
- `professional_type`
- `years_of_experience`
- `certifications` (array)
- `care_services` (array — partially there but may not work correctly)
- `hourly_rate`
- `commute_mode`
- `languages`
- `emergency_contact`
- `background_check`
- `preferred_work_locations`
- `drivers_license`, `own_transportation`, `available_for_matching`

The **two-param version** (`update_user_profile(user_id_param uuid, profile_data jsonb)`) has these fields, but the registration form calls the one-param version. So every time Bev Vil submits, the professional fields silently get ignored.

### Issue 2: Progress Discrepancy (17% TAV vs 33% Admin)

Two different calculation paths:
- **TAV widget (17%)**: Uses `useStoredJourneyProgress` which reads from `user_journey_progress` DB table — this row was likely set to 17% and never updated when steps were completed
- **Admin card (33%)**: Uses `useProfessionalProgress` which calculates from actual data (profile fields, documents) — it correctly detects 2/6 steps done (account + documents = 33%)

Both are "correct" given their data source, but they diverge because the `user_journey_progress` table isn't being updated when the user completes steps outside the tracked flow.

### Fix

#### 1. Database migration — Fix the one-param `update_user_profile` function
Recreate `update_user_profile(profile_data jsonb)` to include ALL professional fields that the two-param version already handles: `professional_type`, `years_of_experience`, `certifications`, `hourly_rate`, `commute_mode`, `languages`, `emergency_contact`, `background_check`, `background_check_proof_url`, `legally_authorized`, `drivers_license`, `own_transportation`, `available_for_matching`, `work_type`, `availability`, `custom_schedule`, `preferred_work_locations`.

#### 2. Update `user_journey_progress` for Bev Vil
Update Bev Vil's progress row to reflect actual completion (33%, step 4 next) so the TAV widget matches the admin dashboard.

#### 3. Add progress sync after professional registration save
In `ProfessionalRegistration.tsx`, after successful save, update the `user_journey_progress` table to mark step 2 (profile) as complete so the TAV widget stays in sync.

### Files Changed

| Action | Target | Description |
|--------|--------|-------------|
| Migrate | `update_user_profile(jsonb)` function | Add all missing professional fields to match the two-param version |
| Migrate | `user_journey_progress` row for `33a739ce` | Set progress to 33% / step 4 |
| Modify | `ProfessionalRegistration.tsx` | Sync `user_journey_progress` after successful save |

