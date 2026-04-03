

## Add Legacy Story Report to User Report Generator

### What Changes

The `care_recipient_profiles` table data (which IS the legacy story) is already fetched in `useComprehensiveUserData.ts` as `careRecipient`. We just need to surface it properly in the Reports tab.

### Changes

**1. `src/hooks/admin/useComprehensiveUserData.ts`**
- Add `legacyStoryComplete: boolean` to the `ComprehensiveUserData` interface
- Set it to `true` when `careRecipientData` exists AND has a `life_story` or `story` field populated
- Include it in the returned data object

**2. `src/components/admin/UserDetailModal.tsx`**
- **Summary grid**: Change from 3-column to 4-column grid (for family users). Add a 4th card for "Legacy Story" with a green checkmark when `comprehensiveData.legacyStoryComplete` is true, showing "Complete" or "Not Started"
- **Data section**: Expand the existing "Care Recipient Profile" card (lines 757-770) to also display the legacy story content fields:
  - `life_story` / `story` (the main narrative)
  - `daily_routine`
  - `dietary_preferences`
  - `communication_style`
  - `comfort_piorities`
  - `caregiver_personality` preferences
  - Any other rich fields from the `care_recipient_profiles` table
- Rename the card heading from "Care Recipient Profile" to "Legacy Story / Care Recipient Profile" for clarity

### Technical Details

| File | Change |
|------|--------|
| `src/hooks/admin/useComprehensiveUserData.ts` | Add `legacyStoryComplete` boolean to interface and computation |
| `src/components/admin/UserDetailModal.tsx` | Add Legacy Story summary card to grid; expand care recipient data display with story fields |

No new database queries needed -- the data is already fetched via the existing `care_recipient_profiles` select.

