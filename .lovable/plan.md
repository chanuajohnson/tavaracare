
## Plan: Align Unit Economics with Payroll Month Logic

### What I found
The March payroll summary you attached is internally consistent:
- March 2026 payroll summary = **4 weeks**
- **160.0h reg**
- **$5600.00 gross**
- **$301.20 employee NIS**
- **$602.40 employer NIS**
- **$903.60 combined NIS**

That happens because the payroll screen groups by **ISO week** and assigns a week to the month of its **ending Sunday**:
- Mar 2–8
- Mar 9–15
- Mar 16–22
- Mar 23–29  
= March

But:
- **Mar 30–Apr 5** is counted under **April**, not March

The unit economics page is currently using a different rule:
- it filters `payroll_entries` by raw `pay_period_start` inside calendar March
- so it includes **Mar 30 and Mar 31**
- that is why it shows **176 hours** and the higher NIS number

So the issue is **not** the payroll summary. The issue is that **/admin/unit-economics is using a different month definition than payroll**.

### Fix
1. **Make unit economics use the same monthly grouping as payroll**
   - Stop treating a selected month as a simple calendar date filter
   - Reuse the same payroll week/month grouping logic already used by the payroll table
   - Build monthly economics from the grouped payroll weeks that belong to that payroll month

2. **Use payroll month totals as the source of truth**
   For March 2026, unit economics should use:
   - 4 payroll weeks
   - 160 hours
   - $5600 gross caregiver wages
   - $301.20 employee NIS
   - $602.40 employer NIS

3. **Show the period clearly in the UI**
   Add a visible label under the month title such as:
   - `Payroll month: Mar 2, 2026 – Mar 29, 2026`
   - `Week of Mar 30 – Apr 5 is counted in April payroll`

4. **Fix the revenue breakdown wording**
   In the expanded row, clearly separate:
   - **Tavara care coordination fee**
   - **Caregiver wages pass-through**
   - **Total revenue**
   
   Also make the math visible so there is no ambiguity.

5. **Align weekly fee scaling with payroll month structure**
   Since payroll March is 4 weeks, unit economics should not multiply by `31/7`.
   It should use the actual number of payroll weeks in that month from the grouped data.

### Files to update
1. `src/hooks/admin/useUnitEconomics.ts`
   - Replace calendar-month filtering logic with payroll-style week/month aggregation
   - Remove the `getDaysInMonth(...) / 7` dependency for month totals
   - Use grouped month totals for wages and NIS
   - Use payroll-week count for monthly subscription/operating-cost scaling

2. `src/components/admin/UnitEconomicsTable.tsx`
   - Add a “period covered” line
   - Clarify revenue breakdown labels and formulas
   - Show payroll-week basis for the selected month

3. Possibly `src/pages/admin/UnitEconomicsPage.tsx`
   - Update month header copy so users understand this is a payroll-month view, not a raw calendar-month slice

### Expected result for March 2026 after the fix
For Peltier, March should match payroll:
- **Hours:** 160.0
- **Caregiver wages:** $5600.00
- **Employee NIS:** $301.20
- **Employer NIS:** $602.40

And the page should make it obvious that:
- March payroll month = 4 weeks
- Mar 30–Apr 5 belongs to April payroll
- the revenue breakdown is separate from the NIS/wage totals

### Technical details
- Current mismatch:
  - `src/hooks/admin/useUnitEconomics.ts` uses `pay_period_start >= startOfMonth && <= endOfMonth`
  - `src/utils/payroll/groupByWeek.ts` assigns month by `weekEnd` (Sunday)
- Payroll logic already matches the screenshot you provided
- Unit economics must be refactored to consume the **same grouping rule**, not a separate date-window rule
- No new database migration is needed for this correction; this is a **logic alignment** issue, not a data integrity issue
