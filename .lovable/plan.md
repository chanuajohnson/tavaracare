

## Plan: Bulk Work Log Entry for Professionals and Admins

### Problem
Currently, logging work hours requires clicking on each individual shift in the calendar, one day at a time. For a full month like Angela's March schedule, this means ~20+ individual form submissions — tedious and error-prone.

### Solution
Add a **"Bulk Log Hours"** button to the Schedule tab that opens a dialog where the user selects:
1. A **date range** (start date → end date)
2. A **caregiver** (from the care team)
3. A **rate type** and **base rate** (applied uniformly)
4. Optional **notes**

The system then finds all shifts for that caregiver within the date range, filters out shifts that already have work logs, and creates work logs for all remaining shifts in one batch.

### UI Flow

```text
[Schedule Tab header]
  [+ New Shift]  [📋 Bulk Log Hours]  [Share Schedule]

Click "Bulk Log Hours" →
┌─────────────────────────────────────────┐
│ Bulk Log Work Hours                     │
│                                         │
│ Caregiver:  [Angela ▾]                  │
│ From:       [Mar 1, 2026]               │
│ To:         [Mar 31, 2026]              │
│                                         │
│ Rate Type:  [Regular ▾]                 │
│ Base Rate:  [$25.00]                    │
│ Notes:      [________________]          │
│                                         │
│ Preview: 18 shifts found, 3 already     │
│ logged. Will create 15 work logs.       │
│                                         │
│           [Cancel]  [Submit 15 Logs]    │
└─────────────────────────────────────────┘
```

### Technical Details

**New file: `src/components/care-plan/work-logs/BulkWorkLogForm.tsx`**
- Date range picker (two date inputs using Shadcn Calendar/Popover)
- Caregiver selector dropdown (from `careTeamMembers`)
- Rate type selector (reuses existing `RateTypeSelector`)
- Preview section: queries shifts in range for selected caregiver, checks which already have work logs, shows count
- Submit button calls `createWorkLogFromShift` for each unlogged shift
- Progress indicator during bulk submission
- Summary toast on completion ("Created 15 of 15 work logs")

**Modified file: `src/components/care-plan/ScheduleTab.tsx`**
- Add "Bulk Log Hours" button next to existing buttons in the header
- Add state for bulk log dialog open/close
- Add Dialog wrapping `BulkWorkLogForm`
- Pass `carePlanId`, `careShifts`, `careTeamMembers` as props

**New service function in `src/services/care-plans/work-logs/shiftService.ts`**
- `bulkCreateWorkLogsForShifts(shifts, notes, options)` — iterates over an array of shifts, skips duplicates, calls `createWorkLogFromShift` for each, returns summary `{ created: number, skipped: number, failed: number }`

### Files to Create/Modify

| File | Change |
|------|--------|
| `src/components/care-plan/work-logs/BulkWorkLogForm.tsx` | **New** — bulk entry form component |
| `src/components/care-plan/ScheduleTab.tsx` | Add "Bulk Log Hours" button + dialog |
| `src/services/care-plans/work-logs/shiftService.ts` | Add `bulkCreateWorkLogsForShifts()` |

### Safety
- Each shift is individually checked for existing work logs before creation (reuses existing `checkDuplicateWorkLog`)
- Preview step shows exactly what will be created before submission
- Already-logged shifts are clearly indicated and skipped
- Uses existing `createWorkLogFromShift` per shift — same validation, same payroll entry creation

