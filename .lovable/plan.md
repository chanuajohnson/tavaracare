

## Plan: Monthly Unit Economics with Reinstated Data

### Current State
- Angela has **26 work logs** spanning Apr 25, 2025 through Apr 3, 2026 (mostly all of March 2026: 23 weekdays)
- Only **5 payroll entries** remain for Angela (Mar 30 - Apr 3) after we deleted 20 + 1 in the previous migration
- Those deleted entries were **not duplicates** — they corresponded to real work logs for all of March. The deletion was incorrect.
- The hook currently filters payroll by `created_at` within a "weeks back" window and divides by numWeeks — this produces misleading averages
- Ana Maria's family has no payroll data yet (new plan)

### What Needs to Change

**1. Database Migration: Reinstate deleted payroll entries**
Re-insert the 21 deleted payroll entries for Angela. These map to her actual work logs from March 2-27, 2026 (20 entries at $35/hr x 8hrs = $280 each) plus 1 entry at $30/hr that was from an older rate. All are legitimate payroll records.

**2. Rewrite hook to use monthly periods instead of "weeks back"**
- Replace `weeksBack` parameter with `selectedMonth` (e.g., "2026-03", "2026-04")
- Filter payroll by `pay_period_start` within the selected month (not `created_at`)
- Calculate totals for the month, then derive weekly averages by dividing by weeks in that month
- Provide a list of available months based on actual data

**3. Rewrite the page UI for monthly selection**
- Replace the "Last N weeks" dropdown with a month picker (e.g., "March 2026", "April 2026")
- Update summary cards to show monthly totals alongside weekly averages
- Relabel columns: "Revenue/mo", "Wages/mo", etc. with weekly average shown as secondary

**4. Update the table for monthly presentation**
- Show monthly totals as primary figures
- Show weekly average as a secondary line
- Keep the caregiver breakdown expandable
- For Ana Maria (no payroll yet): show subscription revenue with $0 wages — effectively showing projected subscription income vs. operating costs only

### Interface Changes

The `ClientEconomics` interface changes from weekly-only to:
- `monthlyRevenue`, `monthlyCaregiverCost`, `monthlyNisCost`, `monthlyExpenses`, `monthlyOperatingCost`, `monthlyTotalCost`, `monthlyMargin`
- Keep `marginPercent` and `status`
- Keep `caregiverBreakdowns` but show monthly totals

### Expected Result for March 2026 (Peltier family)
Angela: 23 work days x 8hrs x $35/hr = $6,440 wages
- Monthly Revenue: $499 x 4.33 + $6,440 = ~$8,600
- Monthly Cost: $6,440 wages + NIS + $360 x 4.33 ops = ~$8,500
- Margin: ~$100

### Files Modified
1. `supabase/migrations/new.sql` — reinstate 21 deleted payroll entries
2. `src/hooks/admin/useUnitEconomics.ts` — rewrite for monthly periods
3. `src/pages/admin/UnitEconomicsPage.tsx` — month picker UI
4. `src/components/admin/UnitEconomicsTable.tsx` — monthly columns

