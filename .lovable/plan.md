

## Plan: Fix Date Picker Timezone Bug and Allow Date Changes

### Problem
Two issues with the post-onboarding date picker:

1. **Timezone bug**: When the user selects April 11th, the code calls `date.toISOString().split("T")[0]` which converts to UTC first. In Trinidad (UTC-4), this shifts the date back by one day, storing "2026-04-10" instead of "2026-04-11".

2. **Cannot change date**: Once a date is set, re-selecting a different date should work (the Calendar component supports this), but the timezone bug makes it appear broken since the displayed date is always one day behind.

### Fix

**File: `src/pages/admin/AdminOnboardingChecklistPage.tsx`**

**Line 288** -- Replace UTC-based date formatting with local date formatting:

```typescript
// Before (broken - converts to UTC, shifts date)
onDateChange(dateKey, date.toISOString().split("T")[0]);

// After (correct - uses local date components)
const yyyy = date.getFullYear();
const mm = String(date.getMonth() + 1).padStart(2, '0');
const dd = String(date.getDate()).padStart(2, '0');
onDateChange(dateKey, `${yyyy}-${mm}-${dd}`);
```

This single change fixes both issues: the date will now store correctly in the user's local timezone, and changing the date will reflect the correct selection.

### Technical Detail
`Date.toISOString()` always returns UTC. A user in UTC-4 selecting "April 11" at any local time creates a Date object where the UTC representation could be "April 10" (if local time is before 8 PM, which maps to before midnight UTC). Using `getFullYear()`/`getMonth()`/`getDate()` preserves the local date the user actually clicked.

