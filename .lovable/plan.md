
## Plan: Fix Revenue Model, Clean Payroll Data, and Restore Ana Maria

### Issues Identified

1. **Revenue model incomplete**: Currently only counting subscription fee ($499/wk). The family also pays caregiver wages ($1,400/wk for 40hrs x $35/hr). Total weekly revenue per client should be $499 + $1,400 = **$1,899/wk**.

2. **Angela's payroll data duplicated**: There are **25 entries** for Angela on 2026-04-13 when there should be **5** (Mon-Fri, 8hrs each at $35/hr). This inflates hours to ~50/wk and wages to ~$1,750/wk instead of the correct 40hrs/$1,400.

3. **Ana Maria missing from dashboard**: Her care plan is active and subscription exists, but she's not appearing. Need to investigate if this is an RLS or query issue with care_plans or profiles tables.

### Changes

**1. Update revenue calculation in `useUnitEconomics.ts`**
- Change `weeklyRevenue` to be the sum of:
  - **Subscription fee** (Family Care = $499/wk)
  - **Caregiver wages** (passed through from family = total payroll cost for that plan)
- This means: `weeklyRevenue = subscriptionRevenue + weeklyCaregiverCost`
- Update the table to show both revenue lines (subscription + caregiver fees)
- Margin calculation stays: `weeklyRevenue - weeklyTotalCost`
- With correct data: $1,899 revenue - ($1,400 wages + $150 NIS + $360 ops) = ~-$11 margin

**2. Update `UnitEconomicsTable.tsx`**
- Add a "Subscription" column and "Caregiver Fees" column in the expanded breakdown
- Show revenue breakdown: subscription fee + caregiver pass-through

**3. Database migration: Clean Angela's duplicate payroll entries**
- Delete 20 of the 25 duplicate entries for care_team_member `2302e12c` on 2026-04-13, keeping only 5
- The 5 retained entries represent Mon-Fri: 8hrs x $35/hr = $280/day each

**4. Database migration: Fix RLS if needed for Ana Maria's visibility**
- Verify care_plans admin policy works for both families
- If needed, add explicit admin SELECT policy

### Expected Results After Fix

| Client | Plan | Subscription/wk | Caregiver Fees/wk | Total Revenue/wk | Wages/wk | NIS/wk | Ops/wk | Total Cost/wk | Margin |
|--------|------|-----------------|-------------------|-----------------|----------|--------|--------|---------------|--------|
| Chanua Johnson | Family Care | $499 | $1,400 | $1,899 | $1,400 | $150 | $360 | $1,910 | -$11 (-0.6%) |
| Ana Maria Aimey | Family Care | $499 | $0* | $499 | $0 | $0 | $360 | $360 | $139 (27.9%) |

*Ana Maria has no payroll entries yet (caregivers assigned but no shifts logged).

### Technical Details
- Revenue model change is in `useUnitEconomics.ts` lines 206-209
- Payroll cleanup via SQL: delete 20 rows by ID, keeping 5 with correct data
- The `ClientEconomics` interface will get a new `subscriptionRevenue` field to separate the two revenue streams
