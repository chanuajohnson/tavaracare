

## Plan: Fix Ana Maria's revenue — treat "Family Care" as flat monthly, not prorated

### Database truth (verified)

Ana Maria (`9874b53e…edf5`), care plan "Care plan for Mum." (`3d63…39e4`), April 2026:

| Item | Source | Truth |
|---|---|---|
| Subscription | `user_subscriptions` → `subscription_plans` | **"Family Care" = $499 flat MONTHLY** (legacy plan) |
| Service: Active Care Management (weekly $499) | `care_plan_service_selections` | Selected — but **already suppressed** by hook ✅ |
| Service: Care Assessment & Setup ($499 one-time) | same | Selected, `override_price = 0` → **Waived** ✅ |
| Service: Caregiver Matching ($299 one-time) | same | Selected, `override_price = 0` → **Waived** ✅ |
| Service: Care Readiness ($199 one-time) | same | Selected, `override_price = 0` → **Waived** ✅ |
| Payroll | `payroll_entries` / `work_logs` | 5 days × 8 hrs = **40 hrs @ $35 = $1,400** in 1 ISO payroll week |

### What's wrong on /admin/unit-economics

Screenshot shows:
- **Sub Rev: $115/mo** (label: *"Active Care Management — $115/wk × 1 weeks"*)
- Total Revenue: $1,515/mo

### Root cause (1 bug, in `useUnitEconomics.ts`)

The "Family Care" legacy plan is correctly flagged as monthly in `getWeeklySubscriptionRevenue()` (line 118 → returns `499/4.33 ≈ 115.24` per week). But line 468 then **multiplies by `payrollWeeks`**:

```ts
const monthlySubRevenue = weeklySubRevenue * payrollWeeks;  // 115.24 × 1 = $115
```

For a true monthly-flat subscription, the family owes **$499 every month** regardless of whether 1 or 5 payroll weeks fell in that month. The current math only produces $499 when payrollWeeks = 4.33 (which never happens in practice — months have 4 or 5 ISO weeks).

This affects **every legacy Family Care subscriber**, and would also affect any future flat-monthly plan.

### The fix (single file: `src/hooks/admin/useUnitEconomics.ts`)

**1. Track billing cadence on the subscription, not just a weekly number**

Replace `getWeeklySubscriptionRevenue(planName, price)` with `resolveSubscriptionRevenue(planName, price)` that returns:

```ts
{ weeklyRevenue: number; monthlyFlat: number | null; cadence: 'weekly' | 'monthly_flat' }
```

- **"Family Care"** → `{ weeklyRevenue: 0, monthlyFlat: 499, cadence: 'monthly_flat' }`
- **"Premium"** → `{ weeklyRevenue: 899, monthlyFlat: null, cadence: 'weekly' }`
- **"Care" / "Active Care"** → `{ weeklyRevenue: 699, monthlyFlat: null, cadence: 'weekly' }`
- **Basic / Free** → all zero
- **Generic > $200** (assume monthly) → `{ weeklyRevenue: 0, monthlyFlat: price, cadence: 'monthly_flat' }`

**2. Use cadence when computing monthly revenue (line ~468)**

```ts
const monthlySubRevenue = subInfo.cadence === 'monthly_flat'
  ? (payrollWeeks > 0 ? subInfo.monthlyFlat ?? 0 : 0)   // bill once per month if active
  : Math.round(subInfo.weeklyRevenue * payrollWeeks * 100) / 100;
```

A flat-monthly sub is owed **whenever the family had any payroll activity that month**, not prorated by weeks.

**3. Update the Sub Rev tooltip text (in `UnitEconomicsTable.tsx`)**

Currently shows: *"Active Care Management — $115/wk × 1 weeks"*
After: *"Active Care Management — $499 flat monthly"* when `cadence === 'monthly_flat'`, otherwise keep the `$X/wk × N weeks` format.

This needs the cadence info exposed on `ClientEconomics`. Add 1 field:

```ts
subscriptionCadence: 'weekly' | 'monthly_flat' | 'none'
```

### Expected result for Ana (April 2026)

| Metric | Before | After |
|---|---|---|
| Sub Rev/mo | $115 | **$499** |
| Caregiver pass-through | $1,400 | $1,400 |
| Svc Rev/mo | $0 | $0 |
| **Total Revenue/mo** | $1,515 | **$1,899** |
| Direct Care | $1,400 | $1,400 |
| Care Ops | $403 | $403 |
| Allocated Platform | $474 | $474 |
| Total Cost | $2,277 | $2,277 |
| **Final Margin** | -$762 (-50.3%) | **-$378 (-19.9%)** |
| Status | Losing | Losing (improved) |

(Ana still doesn't fully cover her share of platform overhead at 2 active clients — but that's the real story the dashboard is meant to tell. The scenario slider already shows when break-even hits.)

### What's NOT touched
- Chanua / Peltier (different plans — already correct)
- Service suppression logic for Active Care Management (already working)
- Care Ops, platform allocation, scenario logic (no changes)
- DB writes — none needed
- `App.tsx`, registration, providers — untouched

### Files

| File | Change |
|---|---|
| `src/hooks/admin/useUnitEconomics.ts` | Replace `getWeeklySubscriptionRevenue` with `resolveSubscriptionRevenue` returning `{ weeklyRevenue, monthlyFlat, cadence }`. Update line ~468 to use cadence-aware math. Add `subscriptionCadence` to `ClientEconomics` interface and result object. |
| `src/components/admin/UnitEconomicsTable.tsx` | In the Sub Rev tooltip / breakdown card, branch on `subscriptionCadence`: show *"$499 flat monthly"* for monthly_flat plans, keep weekly format otherwise. |

### Verification after build
1. Open `/admin/unit-economics`, April 2026 — Ana row Sub Rev shows **$499/mo**, Total Revenue **$1,899/mo**, Final Profit **-$378 (-19.9%)**.
2. Tooltip on Ana's Sub Rev reads *"Active Care Management — $499 flat monthly"*.
3. Chanua / Peltier rows unchanged.
4. Move scenario slider to 8 clients — Ana flips to profitable as platform allocation drops.

