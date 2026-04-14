

## Plan: Fix NIS Weekly Earnings Calculation

### Root Cause
The `weekly_earnings` sent to the NIS API is computed by summing `gross_pay` from payroll entries. The `gross_pay` field includes **reimbursed expenses** (transport, supplies, etc.), which should not be part of NIS-insurable earnings. Additionally, the sum should reflect only actual wage earnings (hours x rates) to ensure accuracy per the Nuacha API's expectations.

### Fix
Compute `weekly_earnings` as the sum of **(regular_hours x regular_rate) + (overtime_hours x overtime_rate) + (holiday_hours x holiday_rate)** across all entries in the week — excluding expense reimbursements.

### Files to Modify

**1. `src/services/care-plans/work-logs/payrollService.ts`**

Create a helper function to compute wage-only earnings from a payroll entry:
```typescript
const getWageEarnings = (entry) =>
  (entry.regular_hours || 0) * (entry.regular_rate || 0) +
  (entry.overtime_hours || 0) * (entry.overtime_rate || 0) +
  (entry.holiday_hours || 0) * (entry.holiday_rate || 0);
```

**In `fetchWeeklyPendingEntries`** (around line 154-156):
- Change `weeklyTotal` calculation from summing `gross_pay` to summing `getWageEarnings(entry)` for each entry
- This ensures the NIS API receives actual weekly wage earnings, not gross pay + expenses
- Keep `pendingTotal` and `paidTotal` using `gross_pay` for display purposes (those show total compensation including expenses)

**In `recalculateWeeklyNIS`** (around line 367):
- Change `weeklyGross` to use `getWageEarnings(entry)` instead of `gross_pay`
- Same reasoning: NIS should be on wages only

**In `processWeeklyPayrollPayment`** (around line 230):
- The NIS distribution proportion should also use wage earnings, not gross_pay, so NIS is distributed proportionally to wages

### What This Fixes
- 4-day week at $35/hr x 8hrs: `weekly_earnings` = $1,120 (not $1,400)
- 5-day week at $35/hr x 8hrs: `weekly_earnings` = $1,400
- Weeks with expenses no longer inflate the NIS class

### No Changes Needed
- The NIS API / edge function proxy — already correct
- The `calculatePayrollEntry` service — correctly calculates hours and rates
- The `approvalService.ts` — payroll entry creation is fine (stores hours and rates separately)
- Database schema — all needed fields (`regular_hours`, `regular_rate`, etc.) already exist on `payroll_entries`

### After Deploying
Use the "Recalculate NIS" button on each month to update stored NIS values using the corrected wage-only calculation and 2026 NIS rates.

