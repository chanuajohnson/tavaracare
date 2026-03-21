

## Fix: Schedule Submit + Admin Queue Visibility

### Root Cause

**Submit fails** because `profiles.preferred_visit_type` has a CHECK constraint: `CHECK (preferred_visit_type IN ('virtual', 'in_person'))`. We're trying to store `'trial_day - March 21st, 2026'` which violates this constraint.

**Admin queue shows 0** because the submit never succeeds — no rows have `ready_for_admin_scheduling = true`.

### Changes

#### 1. Migration: Drop the CHECK constraint and update allowed values

Drop `profiles_preferred_visit_type_check` so we can store the new values (`trial_day`, `direct_hire`). Store the date separately in `visit_notes` (text field, already exists) instead of appending to the visit type.

```sql
ALTER TABLE profiles DROP CONSTRAINT profiles_preferred_visit_type_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_preferred_visit_type_check 
  CHECK (preferred_visit_type = ANY (ARRAY['virtual', 'in_person', 'trial_day', 'direct_hire']));
```

#### 2. `src/components/family/ScheduleVisitModal.tsx`

Change the update to store:
- `preferred_visit_type`: just `'trial_day'` or `'direct_hire'` (passes constraint)
- `visit_notes`: JSON string with the selected date — `{"preferred_start_date": "2026-03-25", "care_option": "trial_day"}`

#### 3. `src/components/admin/AdminSchedulingQueue.tsx`

Update the admin queue to:
- Parse `visit_notes` JSON to display the preferred start date and care option
- Update the `PendingSchedulingRequest` interface to accept the new visit types (`trial_day`, `direct_hire`)
- Show the care option label ("Trial Day $320" or "Hire Immediately") and preferred date in the queue table

#### 4. Update journey step text

The Care Coordination step still says "Choose to meet your match and a care coordinator virtually (Free) or in person ($300 TTD)." — this should reflect the new options (Trial Day / Hire Immediately). Update in `useEnhancedJourneyProgress.ts`.

### Files Changed

| Action | File | Description |
|--------|------|-------------|
| Create | Migration SQL | Drop old CHECK, add new values |
| Modify | `src/components/family/ScheduleVisitModal.tsx` | Store visit type as enum value, date in `visit_notes` |
| Modify | `src/components/admin/AdminSchedulingQueue.tsx` | Display new care options + preferred date, accept new types |
| Modify | `src/hooks/useEnhancedJourneyProgress.ts` | Update step 7 description text |

### Result

- Submit succeeds — family sees confirmation
- Admin queue shows the request with care option and preferred start date
- Journey text matches actual options

