## Plan: Fix NIS $0 Values and Enhance Monthly Summary with Weekly Breakdown

### Root Cause of $0 NIS

The database confirms all 5 paid entries (Mar 30 – Apr 3) have `nis_applicable: false`, `employee_contribution: 0`, `employer_contribution: 0`. This happened because the NIS edge function was failing when these entries were originally processed. The code processed them anyway with a warning: "NIS calculation failed — not applied." The edge function is now working, but the data was never backfilled. **What to tell the Tavara project to debug:**

> ***Check your calculate-nis proxy edge function. The Nuacha API at [https://fjrxqeyexlusjwzzecal.supabase.co/functions/v1/payroll-api](https://fjrxqeyexlusjwzzecal.supabase.co/functions/v1/payroll-api) is confirmed working -- calling it with {"action":"calculate-nis","weekly_earnings":1400} returns NIS Class 10, employee $19.80, employer $41.25. The issue is on our side. Please verify:***
>
> 1. ***The NUACHA_API_KEY secret is set in Supabase edge function secrets***
> 2. ***The proxy edge function is deployed and calling the correct URL***
> 3. ***The response is being parsed correctly and not silently swallowed on error***
> 4. ***Check edge function logs for the actual error***

### Changes

**1. Add "Recalculate NIS" action for paid weeks with missing NIS**


| File                                                       | Change                                                                                                                                                                             |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/services/care-plans/work-logs/payrollService.ts`      | Add `recalculateWeeklyNIS(entryId)` — fetches all entries in the same week, calls NIS API on weekly total, distributes contributions proportionally, and updates entries in the DB |
| `src/components/care-plan/payroll/PayrollEntriesTable.tsx` | When a paid week has `employeeContribution === 0 && weeklyGross > 200`, show a "Recalculate NIS" button in the weekly summary area                                                 |
| `src/hooks/payroll/usePayrollData.ts`                      | Add `handleRecalculateNIS` handler, pass to table                                                                                                                                  |


**2. Enhance Monthly Summary to show per-week rows**


| File                                                       | Change                                                                                                                                                                                                      |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/care-plan/payroll/PayrollEntriesTable.tsx` | Expand the Monthly Summary section: each month row becomes collapsible, revealing its constituent weeks with individual gross, employee NIS, employer NIS, and net pay. The month row shows the sum totals. |


### UI Result

**Weekly NIS Summary (when expanded):**

- Shows NIS Class, Weekly Gross, Employee NIS, Employer NIS, Weekly Net Pay
- If NIS is $0 on a paid week with gross > $200: shows a yellow "Recalculate NIS" button
- After recalculation, values update to the correct NIS class amounts

**Monthly Summary (expanded):**

```text
March 2026                    1 week   $1,400.00   $19.80   $41.25   $1,380.20
  └─ Week: Mar 30 – Apr 5    5 entries $1,400.00   $19.80   $41.25   $1,380.20

April 2026                    2 weeks  $2,800.00   $39.60   $82.50   $2,760.40
  └─ Week: Apr 6 – Apr 12    5 entries $1,400.00   $19.80   $41.25   $1,380.20
  └─ Week: Apr 13 – Apr 19   5 entries $1,400.00   $19.80   $41.25   $1,380.20
```

### Files to Modify


| File                                                       | Change                                                                                    |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/services/care-plans/work-logs/payrollService.ts`      | Add `recalculateWeeklyNIS()` function                                                     |
| `src/components/care-plan/payroll/PayrollEntriesTable.tsx` | Add recalculate button for missing NIS + expand monthly summary with per-week detail rows |
| `src/hooks/payroll/usePayrollData.ts`                      | Add `handleRecalculateNIS` handler                                                        |
