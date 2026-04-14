

## Plan: Fix March Data, NIS, and Revenue Presentation

### Problems Identified

1. **NIS missing on 20 reinstated payroll entries**: The March reinstated entries have `nis_applicable=false` and `$0` NIS. The correct rate is $30.12 employer / $15.06 employee per $280/day entry (matching the existing entries from Mar 30-31).

2. **Revenue breakdown is confusing**: The "Sub/mo" column shows $2,139 (which is $499/wk × 4.43 weeks), but the user wants to see the revenue clearly as two distinct lines:
   - **Tavara Coordination Fee**: Family Care $499/wk
   - **Caregiver Wages Pass-through**: $35/hr × 40hrs/wk = $1,400/wk
   - **Total Revenue** = sum of both

3. **March 2026 data verification**: 22 entries, 176 hours, $6,160 wages — correct (22 weekdays in March). But NIS totals are only $60.24/$30.12 instead of the expected ~$662.64/$331.32 (22 × $30.12 / $15.06).

4. **Ana Maria visibility**: Both care plans are active in the database with active subscriptions. She should appear even with $0 payroll.

### Changes

**1. Database migration: Fix NIS on reinstated payroll entries**
Update 20 payroll entries in March that have `nis_applicable=false` and `$0` contributions:
- Set `nis_applicable = true`
- Set `employer_contribution = 30.12`
- Set `employee_contribution = 15.06`
- Recalculate `net_pay_after_nis = 280 - 15.06 = 264.94`

This gives March totals: 22 × $30.12 = $662.64 employer NIS, 22 × $15.06 = $331.32 employee NIS.

**2. Update revenue presentation in `UnitEconomicsTable.tsx`**
In the expanded breakdown, replace the generic "Weekly Avg Revenue" with a clear revenue breakdown:
```
Revenue Breakdown:
  Tavara Coordination Fee (Family Care): $499/wk × 4.43 = $2,139/mo
  Caregiver Wages (Weekday Standard @ $35/hr): $6,160/mo
  Total Revenue: $8,299/mo
```

**3. Verify Ana Maria appears in both months**
If she doesn't render, add console logging to debug. Both her care plan and subscription are confirmed active in the database.

### Expected March 2026 Results (Peltier Family)

| Field | Value |
|-------|-------|
| Sub/mo | $2,139 ($499/wk × 4.43) |
| CG Fees/mo | $6,160 (176hrs × $35) |
| Revenue/mo | $8,299 |
| Wages/mo | $6,160 |
| NIS/mo | $663 (employer) |
| Ops/mo | $1,543 |
| Total Cost/mo | $8,366 |
| Margin | -$67 (-0.8%) |

### Files Modified
1. `supabase/migrations/new.sql` — update 20 payroll entries with correct NIS
2. `src/components/admin/UnitEconomicsTable.tsx` — clearer revenue breakdown in expanded view

