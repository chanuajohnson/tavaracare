

## Plan: Make Care Summary and Service Commencement Approval Dynamic

### Problem
Both the `CareSummaryHeader` and `ServiceCommencementApproval` components in the family onboarding checklist page contain hardcoded static text:
- Rate: "$35/hr (Standard)" — hardcoded
- Plan: "Tavara Family Care Plan (weekly)" — hardcoded  
- Payment: "Weekly (due every Friday)" — hardcoded
- Start date text: "Monday, April 13th" and "April 13–17, 2026" — hardcoded
- These values should be derived per-family from the `checked_items` JSON stored by admin

### Data Already Available
The admin already stores these in `checked_items` per family:
- `billing_start_date` — the care start date (YYYY-MM-DD)
- `billing_cadence` — "weekly" or "monthly"
- `post_onboarding_3_date` — the onboarding milestone start date

### Changes

**File**: `src/pages/family/FamilyOnboardingChecklistPage.tsx`

1. **CareSummaryHeader** — make all fields dynamic:
   - **Start Date**: read from `billing_start_date` or `post_onboarding_3_date`, show "Not set" if neither exists
   - **Rate**: read from `checkedItems["care_rate"]` with fallback to "$35/hr (Standard)" — this keeps current default but allows admin to override later
   - **Plan/Cadence**: derive from `billing_cadence` ("Weekly" or "Monthly") instead of hardcoded "weekly"
   - **Payment**: adjust text based on cadence ("Weekly (due every Friday)" vs "Monthly")

2. **ServiceCommencementApproval** — make the instructional banner dynamic:
   - Replace hardcoded "Monday, April 13th" with the formatted start date from `billing_start_date` or `post_onboarding_3_date`
   - Replace hardcoded "April 13–17, 2026" with a dynamically calculated first billable week (start date to start date + 4 days)
   - If no start date is set, show a message like "Your care start date has not been set yet. Please check back once your coordinator has finalized your schedule."
   - **Hide the approval checkbox** when no start date exists — families without a defined start date should not be able to approve

3. **Also update the static "First billable week" line** (line 131) to use the same dynamic calculation

### What This Fixes
- Family user `chanuahjohnson@gmail` (who has no start date set) will no longer see Ana Maria's "April 13th" date
- Each family sees only their own data from their own checklist record
- Families without a start date see "Not set" and cannot prematurely approve

### Files Modified

| File | Change |
|------|--------|
| `src/pages/family/FamilyOnboardingChecklistPage.tsx` | Make `CareSummaryHeader` and `ServiceCommencementApproval` fully dynamic based on `checked_items` data |

