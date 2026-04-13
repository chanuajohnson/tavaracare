

## Plan: Weekly Grouped Payroll View + Fix NIS Edge Function

### Problem

1. **NIS details shown per daily entry** — Each payroll entry row shows its own NIS breakdown (class, employee/employer contributions). But NIS in T&T is a **weekly** contribution, not daily. Showing NIS per-day is misleading.

2. **Payroll entries listed individually by day** — The table shows one row per daily work log. There's no weekly grouping. Per T&T law, NIS is calculated on the weekly total and paid monthly (sum of 4-5 weeks).

3. **NIS API call failing** — The Process Payment dialog shows "Failed to send a request to the Edge Function." The `nis-payroll-proxy` edge function needs to be redeployed (it boots but may not be properly deployed to the current project).

### Solution

#### 1. Group Payroll Entries by ISO Week (Mon-Sun) in the Table

**File: `src/components/care-plan/payroll/PayrollEntriesTable.tsx`**

- Group entries by caregiver + ISO week (weeks start Monday)
- Render a **week header row** showing: caregiver name, week range (e.g., "Mon Mar 30 – Sun Apr 5, 2026"), weekly gross total, weekly NIS summary
- Under each week header, show the individual daily entries (collapsed by default, expandable)
- The NIS details (class, employee/employer contributions, net pay) appear **only on the week header row**, not on individual daily entries
- Remove per-entry NIS display from individual rows

#### 2. Weekly NIS Summary in Details

The expanded "Details" view for paid entries currently shows NIS per entry. Change this to:

- Show NIS details **at the weekly group level** only
- Weekly detail shows: NIS Class, total weekly gross, employee NIS (weekly), employer NIS (weekly), net pay (weekly)
- Individual entry details show only: payment date, gross pay, hours breakdown

#### 3. Monthly Summary Section

Add a collapsible monthly summary below the table:
- Group weeks into months (4 or 5 weeks per month)
- Show: month name, total gross, total NIS employee, total NIS employer, total net pay
- This gives the "paid monthly as a sum of each week" view

#### 4. Fix NIS Edge Function

**File: `supabase/functions/nis-payroll-proxy/index.ts`**

- Redeploy the edge function (it's booting but the API call fails — likely needs fresh deployment)
- Add better error logging to capture the actual failure reason

### Technical Details

**Grouping logic** (new utility function):
```text
groupEntriesByWeek(entries) → Map<string, { weekStart, weekEnd, caregiver, entries[], weeklyGross, nisDetails }>
```
- Key: `{caregiverId}_{weekStartISO}`
- Uses `startOfWeek(date, { weekStartsOn: 1 })` (already imported in payrollService)

**Table structure change:**
```text
Week: Mon Mar 30 – Sun Apr 5 | Angela Newton | $1,400.00 gross | NIS Class X | Net $X,XXX
  ├─ Mar 30  8h @ $35/hr  $280.00  paid
  ├─ Mar 31  8h @ $35/hr  $280.00  paid
  ├─ Apr 1   8h @ $35/hr  $280.00  paid
  ├─ Apr 2   8h @ $35/hr  $280.00  paid
  └─ Apr 3   8h @ $35/hr  $280.00  paid
```

### Files to Modify

| File | Change |
|------|--------|
| `src/components/care-plan/payroll/PayrollEntriesTable.tsx` | Group entries by week, render week headers with NIS summary, remove per-entry NIS display |
| `src/utils/payroll/groupByWeek.ts` (new) | Utility to group entries by caregiver + ISO week |
| `supabase/functions/nis-payroll-proxy/index.ts` | Redeploy edge function to fix API connectivity |

### Safety
- Individual entry data remains accessible (expandable under week groups)
- No database changes needed — this is purely a UI presentation change
- Paid entry NIS data already stored correctly at weekly level in the DB (distributed proportionally across entries)
- Weekly grouping uses same ISO week logic already in `payrollService.ts`

