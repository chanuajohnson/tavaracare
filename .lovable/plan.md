

## Plan: Monthly-First Payroll View with NIS Summary + Bulk Recalculate

### What Changes

The current payroll table shows weeks flat with a hidden "Monthly Summary" collapsible at the bottom. You want the **opposite**: months as the primary view, weeks nested inside each month as collapsible dropdowns, and a clear monthly NIS summary showing total employee + employer contributions.

### 1. Restructure PayrollEntriesTable to Month-First Layout

**File: `src/components/care-plan/payroll/PayrollEntriesTable.tsx`**

Replace the current flat week list (lines 210-413) + bottom monthly summary (lines 418-482) with a single month-first structure:

```text
[ March 2026 ]  $5,600.00 gross | Employee NIS: $79.20 | Employer NIS: $165.00 | Net: $5,520.80
  [ v Week: Mar 30 – Apr 5 ]  $1,400 | $19.80 | $41.25 | $1,380.20
      Mon Mar 30 ... (daily entries)
      Tue Mar 31 ...
  [ v Week: Mar 23 – Mar 29 ]  $1,400 | $19.80 | $41.25 | $1,380.20
  [ v Week: Mar 16 – Mar 22 ]  ...
  [ v Week: Mar 9 – Mar 15 ]   ...
```

- **Month row**: bold header with totals for gross, employee NIS, employer NIS, net pay, hours, and status
- **Monthly NIS Summary card**: expandable section under each month header showing aggregated NIS class breakdown, total contributions, and a "Recalculate All NIS" button for weeks with missing NIS
- **Week rows**: collapsible inside each month, showing the existing week-level data
- **Daily entries**: collapsible inside each week (existing behavior preserved)

### 2. Add Bulk "Recalculate NIS" at Month Level

- Add a button on the monthly NIS summary that recalculates NIS for **all weeks in that month** that have $0 NIS but gross > $200
- Calls `handleRecalculateNIS` for each affected week sequentially
- Shows progress: "Recalculating 1 of 3..."

### 3. Monthly NIS Summary Section

Each month header expands to show:
- Total Employee NIS contributions for the month
- Total Employer NIS contributions for the month  
- Total NIS (combined) for the month
- Number of weeks with NIS applied vs missing
- "Recalculate Missing NIS" button when applicable

### Files to Modify

| File | Change |
|------|--------|
| `src/components/care-plan/payroll/PayrollEntriesTable.tsx` | Restructure to month-first with weeks as nested collapsibles; add monthly NIS summary; add bulk recalculate |

### What Stays the Same
- All existing week-level functionality (select, expand daily entries, NIS detail, bank transfers, undo)
- The `groupByWeek.ts` utility and `MonthGroup` interface (already has the right data)
- All payroll data hooks and services

