

## Plan: Build Unit Economics Dashboard

### What This Is
An admin-only page at `/admin/unit-economics` that shows real-time profit/loss per client (care plan) by pulling actual payroll data from `payroll_entries`, NIS contributions, subscription revenue, and configurable operating cost estimates.

### Data Sources (Already in DB)

| Data | Source Table | Fields |
|------|-------------|--------|
| Caregiver wages | `payroll_entries` | `regular_hours * regular_rate`, `overtime_hours * overtime_rate`, `holiday_hours * holiday_rate`, `expense_total` |
| NIS costs | `payroll_entries` | `employer_contribution`, `employee_contribution` |
| Client identity | `care_plans` → `profiles` | `family_id`, `title` |
| Subscription tier | `user_subscriptions` → `subscription_plans` | `plan_id`, `price`, `name` |
| Care team | `care_team_members` | `care_plan_id`, `regular_rate` |

### What Gets Built

**1. New page: `src/pages/admin/UnitEconomicsPage.tsx`**

Top-level metrics cards:
- Total active clients
- Average weekly revenue per client
- Average weekly cost per client
- Average gross margin % (with color: green >20%, yellow 10-20%, red <10%)

Per-client table with columns:
- Client name (from care plan → profile)
- Subscription plan + weekly fee
- Weekly caregiver wages (summed from paid payroll entries)
- Weekly employer NIS
- Estimated operating costs (configurable defaults)
- Total weekly cost
- Total weekly revenue (subscription fee)
- Gross margin ($) and margin (%)
- Status indicator (profitable / at-risk / losing money)

Expandable row detail showing:
- Breakdown by caregiver (hours, rate, pay)
- NIS breakdown (employer + employee)
- Operating cost assumptions

**2. New hook: `src/hooks/admin/useUnitEconomics.ts`**

Fetches and aggregates:
- All active care plans with family profiles
- Payroll entries grouped by care_plan_id for a selected period (last 4 weeks default)
- User subscriptions to determine revenue per client
- Computes wage totals, NIS totals, and margin per client

**3. New component: `src/components/admin/UnitEconomicsTable.tsx`**

Renders the per-client breakdown table with expandable rows.

**4. New component: `src/components/admin/OperatingCostConfig.tsx`**

A small panel with editable defaults (stored in localStorage for now):
- Care coordination cost/week (default: $75)
- Replacement/backup buffer/week (default: $75)
- Payment processing/week (default: $30)
- Admin & documentation/week (default: $45)
- Platform overhead/week (default: $35)
- Sales & acquisition/week (default: $100)

These get applied uniformly to each client for margin calculation.

**5. Route addition in `src/App.tsx`**

Add `/admin/unit-economics` route pointing to the new page. Add a navigation card on the Admin Dashboard linking to it.

### Key Calculations

```text
Per Client Per Week:
  Revenue = subscription_plan.price (weekly equivalent)
  
  Caregiver Cost = SUM(regular_hours * regular_rate + 
                       overtime_hours * overtime_rate + 
                       holiday_hours * holiday_rate) + expense_total
  
  NIS Cost = SUM(employer_contribution)
  
  Operating Cost = sum of configurable line items
  
  Total Cost = Caregiver Cost + NIS Cost + Operating Cost
  
  Gross Margin = Revenue - Total Cost
  Margin % = (Gross Margin / Revenue) * 100
```

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/pages/admin/UnitEconomicsPage.tsx` | Create |
| `src/hooks/admin/useUnitEconomics.ts` | Create |
| `src/components/admin/UnitEconomicsTable.tsx` | Create |
| `src/components/admin/OperatingCostConfig.tsx` | Create |
| `src/App.tsx` | Add route (minimal, preserving all existing routes) |
| `src/pages/admin/AdminDashboard.tsx` | Add navigation card to unit economics |

### Technical Notes
- Period selector: default last 4 weeks, with option for custom date range
- Weekly averages computed by dividing total period costs by number of weeks
- Subscription revenue mapped from `user_subscriptions` joined to `subscription_plans` for each family
- For Family Basic (free), revenue = $0
- Family Care = $499/week or $1,799/month ÷ 4.33 = ~$415/week
- Family Premium = $2,499/month ÷ 4.33 = ~$577/week
- Color-coded margin indicators throughout

