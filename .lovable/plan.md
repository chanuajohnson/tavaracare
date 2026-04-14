

## Plan: Set Up Peltier's Care Plan Revenue in Unit Economics

### Current State
- **Chanua Johnson** (user `7d850934-a44f-4348-944b-ae7182dca237`) has two care plans:
  - "Test Care Plan Onboarding" (`ee7cc4bd`) — test, ignore
  - "Peltier's Care Plan 2025" (`4848aec5`) — the real one
- **Payroll data exists**: Angela at $35/hr, 8hrs/day, Mon-Fri — already flowing correctly
- **No subscription exists** for Chanua — so the dashboard shows $0 revenue
- The `subscription_plans` table has old plans (Basic $29.99, etc.) — no "Family Care" at $499/week

### What Needs to Happen (Database Only)

**Step 1: Create a "Family Care" subscription plan** in `subscription_plans`
- Name: `Family Care`
- Price: `499` (weekly)
- Description: "Active care coordination with dedicated management support"
- Duration: `7` days (weekly billing)

**Step 2: Create a `user_subscription`** linking Chanua to the Family Care plan
- `user_id`: `7d850934-a44f-4348-944b-ae7182dca237`
- `plan_id`: (the new Family Care plan ID)
- `status`: `active`
- `start_date`: now
- `payment_method`: `manual`

### No Code Changes Needed
The hook's `getWeeklyRevenue` function already handles this:
- Plan name includes "care" → returns `$499/week`
- Payroll data already has the correct $35/hr × 8hrs = $280/day entries with NIS

### Expected Result After Data Setup
For Peltier's Care Plan 2025:
- **Revenue/wk**: $499
- **Wages/wk**: ~$1,400 (5 days × $280)
- **NIS/wk**: ~$150.60 employer
- **Ops/wk**: $360 (configurable defaults)
- **Total Cost/wk**: ~$1,910
- **Margin**: -$1,411 (-283%)
- **Status**: Losing (this is expected — the $499 subscription alone doesn't cover wages; the family also pays the caregiver directly, which is separate from Tavara's subscription revenue)

### Important Note
The dashboard currently treats `weeklyRevenue` as the Tavara subscription fee only — it does **not** include the caregiver wages that families pay directly. This means the margin will appear deeply negative because the caregiver cost ($1,400+) is being compared against only the coordination fee ($499). 

If you want the dashboard to reflect the **full family cost** (caregiver wages + Tavara fee) as revenue, I'd need to adjust the revenue calculation. Otherwise, the current model correctly shows Tavara's margin on its coordination fee alone — which means operating costs ($360) should be the main comparison against the $499 fee, yielding ~$139/week margin (28%) before wage pass-through.

### Recommendation
I can also update the Unit Economics hook to separate **Tavara coordination margin** (subscription vs. operating costs) from **pass-through costs** (caregiver wages + NIS that families pay directly). This would give a much more accurate picture. Want me to include that in the plan?

