

## Plan: Fix NIS Amounts, Add Total NIS Column, Fix Week Count, Monthly Bank Transfer

### Issues Identified

1. **NIS amounts are wrong in the database**: At $1,400 weekly earnings, employee NIS should be $75.30 and employer NIS should be $150.60, but the stored values show $19.80 and $41.25. The `recalculateWeeklyNIS` function itself looks correct (it calls the NIS API with the weekly gross and distributes proportionally). The stored data is stale/incorrect from when the entries were originally processed. **Fix**: Need to recalculate NIS for all weeks — the bulk recalculate button already exists but requires clicking per month. The real data fix requires triggering recalculation.

2. **Missing "Total NIS" column**: The Nuacha reference shows a combined "Total NIS Cont." column. Currently only Employee and Employer NIS are shown separately with no combined total.

3. **March shows 5 weeks but should be 4**: Current code assigns a week to the month of its **Monday (weekStart)**. March 30 is a Monday in March, so the week Mar 30–Apr 5 gets counted as March. But that week mostly falls in April (and its week-ending is Apr 5). The Nuacha system shows "Mar 02 – Mar 29 = 4 weeks". **Fix**: Change `groupWeeksByMonth` to assign weeks to the month of the **week-ending date** instead of the week-start.

4. **Bank transfer should be per month, not per week/entry**: Currently individual "Record Transfer" buttons appear per entry inside each week. Since NIS is paid monthly, there should be one "Record Monthly Transfer" button at the month level.

### Changes

#### File 1: `src/utils/payroll/groupByWeek.ts`
- Change `groupWeeksByMonth` to use `week.weekEnd` (Sunday) instead of `week.weekStart` (Monday) for month assignment
- This means the week of Mar 30–Apr 5 goes into April, giving March exactly 4 weeks

#### File 2: `src/components/care-plan/payroll/PayrollEntriesTable.tsx`

**Add "Total NIS" column** to the table header and all row levels (month header, week row, weekly NIS summary):
- New column between "NIS (Employer)" and "Net Pay" showing combined employee + employer NIS
- Shows at month level, week level, and in the monthly NIS summary

**Move bank transfer to month level**:
- Remove per-entry "Record Transfer" buttons from the week detail section (lines 463-480)
- Add a single "Record Monthly Transfer" button in the Monthly NIS Summary section
- When clicked, records the transfer ref against all paid entries in that month (batch update)
- Show existing transfer ref if already recorded

**Default months expanded**:
- Initialize `expandedMonths` with all month keys so weeks are visible by default

#### File 3: `src/components/care-plan/payroll/BankTransferDialog.tsx`
- Update to accept `payrollIds: string[]` (array) instead of single `payrollId`
- When saving, call `recordBankTransfer` for each entry in the batch
- Dialog title: "Record Monthly NIS Transfer"

#### File 4: `src/components/care-plan/payroll/PayrollTab.tsx`
- Update `bankTransferPayrollId` state to `bankTransferPayrollIds: string[]`
- Update `openBankTransferDialog` to accept array of IDs

### About the wrong NIS values
The stored NIS values ($19.80/$41.25) need to be recalculated via the existing "Recalculate NIS" button. The code logic in `recalculateWeeklyNIS` correctly calls the NIS API with the weekly gross — the issue is the original values were calculated incorrectly (possibly the NIS API was returning different results, or the weekly aggregation was wrong at the time). After implementing these changes, you should click "Recalculate NIS" on the affected weeks to get the correct $75.30/$150.60 values.

### Summary

| Change | Detail |
|--------|--------|
| Week-to-month assignment | Use week-end date (Sunday) instead of Monday |
| Total NIS column | Combined employee + employer at all levels |
| Bank transfer | One per month, not per entry |
| Default expand | All months start open showing weeks |
| NIS values | Recalculate via existing button after deploy |

