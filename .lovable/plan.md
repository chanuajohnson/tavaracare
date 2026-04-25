## Plan: Lifecycle Cost Visualizer — Round 2 Fixes

Four issues raised. Here's exactly what I'll change and what I need to confirm.

---

### 1. Currency: All figures are TTD, with USD in small brackets

**Currently:** Everything is labeled/formatted as `$X` and the footer says "All figures in USD."

**Fix:**
- Update `fmtUSD()` helper in `src/utils/lifecycleScenarios.ts` → rename to `fmtTTD()` and output `TTD $1,346` as the primary figure.
- Add a smaller bracketed USD equivalent next to the big numbers (Day 0, Avg/mo, Quarter, Weekly rhythm) on the comparison cards: `TTD $31,382 (USD ~$4,615)`.
- Update PDF footer: "All figures in TTD. USD shown in brackets at indicative rate."
- Update PPTX similarly.

**TTD→USD rate question:** I'll use **TTD 6.80 = USD 1.00** as the indicative rate (standard prevailing). If you'd rather pin to a specific rate, say so when approving — otherwise I proceed with 6.80.

---

### 2. Remove NIS $349 from mandatory Day-0 bundle; move to "Optional Day-0 / Journey Items" row

**Currently:** Day-0 bundle = Assessment $499 + Matching $299 + Readiness $199 + NIS $349 = **$1,346** (mandatory).

**Fix — new mandatory Day-0 bundle:**
- Care Assessment & Setup — $499
- Caregiver Matching & Placement — $299
- Care Readiness Assessment — $199
- **New Day-0 mandatory total = TTD $997** (was $1,346)

**New "Optional services — added as needed, not blindsided" row** (presented visually below the three scenario cards, no totals — just transparent menu):
| Item | Price | Cadence |
|---|---|---|
| NIS Employer Registration Support | $349 | One-time |
| Daily Care SOP — One-Time Activation | $199 | One-time |
| Guided Home Reset | $499 | One-time |
| Medication Management Support | $99 | /week |
| Daily Care SOP + Monitoring | $149 | /week |
| Meal Support Upgrade | $75 | /week |
| Light Secondary Support | $150 | /week |
| Standard Secondary Support | $250 | /week |
| High-Need Secondary Support | $400 | /week |

This appears on:
- The interactive `/admin/lifecycle-cost` page (new `<OptionalServicesRow />` component)
- The PDF (a clean table band below the 3 columns)
- The PPTX (a dedicated 4th slide: "Optional services you can add at any time")

---

### 3. Conservative weekly total is wrong: $40 × 8h × 5d ($1,600) + Active Care Mgmt ($499) = **$2,099/wk**

**Root cause:** `subscription_plans.price_weekly` for the `care` plan is stored as **$699** in the database, but per project memory ("Subscriptions: Care $499/wk | $1799/mo") and your message, it should be **$499/wk**. The visualizer reads live from the DB, so the calculation inherited the wrong number.

**Fix — two parts:**

**(a) Update the database** — single migration:
```sql
UPDATE public.subscription_plans
SET price_weekly = 499, price_monthly = 1799
WHERE slug = 'care' AND audience = 'family';
```
This propagates correctly to every screen that reads `subscription_plans` (not just this visualizer).

**(b) Verify Premium pricing too.** DB currently has Premium = $899/wk / $3,299/mo. Per memory: "Premium ($2499/mo)". These don't match. **Question for you:**

- Should Premium Care Management be **$2,499/mo** (memory) → which works out to ~$577/wk?
- Or keep Premium at **$899/wk / $3,299/mo** as currently in the DB?
- Or some other number?

I'll wait for your answer on Premium before touching it. The Active Care fix to $499 I'll do regardless.

**Updated scenario totals after the $499 fix (TTD):**
| Scenario | Day 0 | Weekly | Quarter (Day 0 + 13 wks) |
|---|---|---|---|
| Conservative | $997 | $2,099 | **$28,284** |
| Typical (+Med Mgmt + SOP) | $997 | $2,347 | **$31,508** |
| Premium (pending your answer) | $997 | TBD | TBD |

---

### 4. Payment flow disclaimer is misleading

**Currently:** Footer says *"Caregiver wages paid by family directly to caregiver. Subscription & service fees paid to Tavara."*

**Your correction:** Care payments AND subscription plans are paid **by families to Tavara**, and Tavara then disperses to caregivers and coordinates NIS where applicable.

**Fix — new footer copy** (PDF, PPTX, and a small disclaimer on the admin page):
> *Tavara is a Care Coordination & Management Platform — not an agency. Families pay all care payments and subscription fees to Tavara. Tavara coordinates disbursement to caregivers, NIS filings, payroll records, and compliance reporting on the family's behalf as the household employer of record.*

This aligns with `mem://legal/platform-positioning-standard` and `mem://integrations/nis-tt-payroll`.

---

### Files I'll touch (all already created in the previous turn — no protected files)

1. `src/utils/lifecycleScenarios.ts` — rename `fmtUSD` → `fmtTTD`, add `fmtTTDWithUSD()` helper, drop NIS from `day0Bundle()`, add `OPTIONAL_SERVICES` constant for the new row.
2. `src/components/admin/lifecycle/ScenarioComparisonGrid.tsx` — show TTD primary + USD bracket.
3. `src/components/admin/lifecycle/OptionalServicesRow.tsx` — **NEW** component for the optional services menu.
4. `src/components/admin/lifecycle/LifecycleCostBuilder.tsx` — currency labels + remove NIS from required bundle.
5. `src/pages/admin/LifecycleCostPage.tsx` — mount `<OptionalServicesRow />`, update payment-flow disclaimer.
6. **One DB migration** — `UPDATE subscription_plans SET price_weekly=499, price_monthly=1799 WHERE slug='care'` (and Premium if you confirm).
7. Regenerate `/mnt/documents/tavara-lifecycle-cost_v2.pdf` and `tavara-lifecycle-cost_v2.pptx` with all four fixes + QA via pdftoppm.

### Guardrails respected
- ✅ No touch to `App.tsx`, `AppRoutes.tsx`, registration, AuthProvider, Supabase client.
- ✅ Versioned artifacts (`_v2`) so you can compare to the original.
- ✅ DB change scoped to one row update, no schema/migration on protected tables.
- ✅ Mobile-responsive: optional services row stacks on small screens.

---

### Two things I need from you when approving

1. **Premium Care Management correct price?** ($2,499/mo per memory, $3,299/mo per current DB, or other?)
2. **TTD→USD rate to use** in the bracketed conversions? (Default: 6.80, just say so if you want a different one.)

Reply **go** and I'll ship in this order: (1) DB migration → (2) component updates → (3) regenerate PDF v2 → (4) regenerate PPTX v2 → (5) QA each artifact image-by-image before declaring done.