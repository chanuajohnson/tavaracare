

## Plan: Always Show "Recalculate NIS" Button for Paid Weeks

### Problem
The "Recalculate NIS" button only appears when `employeeContribution === 0`. Your entries have $19.80 (incorrect, but non-zero), so the button is hidden. You cannot trigger recalculation to fix the wrong values.

### Fix
**File: `src/components/care-plan/payroll/PayrollEntriesTable.tsx`**

Three condition changes:

1. **Bulk recalc filter** (line 134): Change from `w.employeeContribution === 0` to include all paid weeks with gross > $200. The button label will say "Recalculate NIS for X week(s)" regardless of current NIS value.

2. **Monthly `weeksNeedingNIS` variable** (around line 274): Same condition update so the bulk button appears.

3. **Per-week recalculate button** (line 491): Change `week.employeeContribution === 0` to just `week.weeklyGross > 200` so the button always shows for weeks that qualify for NIS, with updated label text: "Recalculate NIS" (always visible) instead of only showing when NIS is missing.

The message below the per-week button will change from "NIS was not applied when this week was processed." to "Recalculate NIS contributions based on current weekly gross."

### Result
- Recalculate button visible on every paid week with gross > $200
- Bulk recalculate at month level covers all qualifying weeks
- You can immediately fix the $19.80 → $75.30 values

