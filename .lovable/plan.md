

## Plan: Fix Off-by-One Date Range in Bulk Work Log Entry

### Root Cause

When the user picks a start date (e.g., Mar 1) and end date (e.g., Mar 5), the `startDate` and `endDate` from the Calendar component are set to **midnight (00:00:00)** of those days. A shift on March 5 might have a `startTime` like `2026-03-05T08:00:00` (8 AM). The `isWithinInterval` check from date-fns treats the end boundary as `2026-03-05T00:00:00`, so the 8 AM shift on March 5 falls **after** the end boundary and is excluded.

This is why selecting 5 days always produces only 4 matches — the last day is effectively cut off.

### Fix

In `BulkWorkLogForm.tsx`, adjust the `endDate` used in the interval check to be the **end of that day** (23:59:59.999) instead of midnight. This ensures all shifts on the selected end date are included.

### Technical Change

**File: `src/components/care-plan/work-logs/BulkWorkLogForm.tsx`**

1. Add `import { endOfDay } from "date-fns"` to the existing date-fns import
2. Change line 54 from:
   ```ts
   return isWithinInterval(shiftDate, { start: startDate, end: endDate });
   ```
   to:
   ```ts
   return isWithinInterval(shiftDate, { start: startDate, end: endOfDay(endDate) });
   ```

This is a one-line fix. No other files need to change.

### Expected Result
Selecting March 1–5 will now correctly match all 5 days of shifts instead of only 4.

