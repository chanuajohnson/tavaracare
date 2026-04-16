

## Plan: Fix Missing Care Plans + Comprehensive Operating Cost Framework

### Issue 1: Care plans not showing on Per-Client Economics

**Root cause**: The query `supabase.from('care_plans').select(...).eq('status', 'active')` returns 2 plans (Peltier + Mum), but the table renders empty. Most likely causes:
- Silent error in one of the parallel fetches causing the whole `fetchData` to throw before `setClients` runs
- RLS on `payroll_entries` or `care_plan_service_selections` blocking admin reads (admin should bypass but worth verifying)
- April 2026 has only 3 entries for Peltier and none for Mum — both rows SHOULD still render with zeros, but if the query throws we get an empty array

**Fix**:
1. Wrap each parallel query in its own try/catch so a single failure doesn't blank the whole page
2. Add a clear console error trace + a yellow info banner when care plans exist but no payroll for the selected month (so the user knows *why* numbers are zero, not that data is "missing")
3. Always render care plans even with zero payroll for the month — show "No payroll this month" inline instead of dropping the row

### Issue 2: Operating costs are not comprehensive — rebuild as a real chart of accounts

Replace the 6 hardcoded sliders with a **structured operating cost framework** organized into 8 categories matching real business accounting (and aligned to T&T BIR expense classes). Each category contains multiple line items with expected ranges. All editable, all summed live.

#### New comprehensive cost framework (per-week defaults shown, all editable)

**1. Software & SaaS** (recurring)
- Lovable subscription
- Supabase (DB + storage + edge functions)
- OpenAI / AI gateway usage
- WhatsApp Business API
- Domain & DNS (tavara.care)
- Google Workspace / email
- Resend / transactional email
- Analytics & monitoring (Sentry, PostHog, etc.)
- Other SaaS

**2. Devices & Equipment** (depreciated weekly)
- Laptops (with 24-month depreciation auto-calc)
- Phones / tablets
- Peripherals (monitor, headset, etc.)
- Printer & supplies

**3. Founder & Admin Time** (true cost of business)
- Founder hours/week × hourly rate
- Admin/VA hours/week × hourly rate
- Bookkeeper time

**4. Care Operations** (direct platform overhead per client)
- Care coordination labor
- Training & shadow shift stipends (the $140 example)
- Replacement / backup buffer
- Quality oversight & spot-checks
- Documentation & report generation

**5. Marketing & Acquisition**
- Social media ads (Meta, Google)
- Content production
- Referral payouts
- Print marketing (flyers, business cards)
- Event sponsorships

**6. Professional Services**
- Accountant / bookkeeping fees
- Legal counsel
- BIR / tax filing fees
- Insurance (professional liability, general liability)

**7. Banking & Financial**
- Payment processing fees (% of revenue + fixed)
- Bank account fees
- Wire / ACH fees
- FX conversion costs (USD↔TTD)

**8. T&T Statutory Costs** (NEW — matches research)
- Business Levy provision (0.6% of gross revenue, auto-calc)
- Green Fund Levy provision (0.3% of gross revenue, auto-calc)
- Health Surcharge (if applicable per employee class)
- VAT input cost when not yet registered (12.5% absorbed)
- Annual Corporation Tax provision (30% of estimated net profit, prorated weekly)

Each line item has:
- Editable amount (per week)
- Recurrence flag (one-time / weekly / monthly / yearly — auto-normalized to weekly view)
- Tax-deductible flag (T&T BIR)
- Notes field
- Subcategory grouping with collapsible sections

Total bar at top showing weekly + monthly + annual run-rate, plus a "compared to revenue" % indicator.

### Storage approach

Keep the current localStorage pattern for now (no DB migration needed — quick win), but structure the data as nested categories so the upcoming `business_expenses` ledger (from previously-approved plan) becomes the persistent source of truth later. Migration path: when ledger exists, this config becomes the **default/baseline** and ledger becomes the **actuals**, with a toggle (already planned).

### Files

| File | Change |
|---|---|
| `src/hooks/admin/useUnitEconomics.ts` | Wrap parallel fetches in try/catch; expose `carePlansWithoutPayroll` count; never blank the list on partial failure |
| `src/hooks/admin/operatingCostFramework.ts` | NEW — full category/subcategory taxonomy with defaults, recurrence normalization, T&T flags |
| `src/hooks/admin/useUnitEconomics.ts` | Update `OperatingCosts` interface to nested structure; add `totalOperatingCostFromFramework()` helper; backward-compat migration from old flat shape |
| `src/components/admin/OperatingCostConfig.tsx` | Rewrite as collapsible accordion: 8 categories, each with line items, recurrence toggles, T&T-deductible badges, running totals per category |
| `src/components/admin/UnitEconomicsTable.tsx` | Show "No payroll this month" inline when `payrollWeeks === 0` instead of disappearing |
| `src/pages/admin/UnitEconomicsPage.tsx` | Add info banner when care plans exist but no payroll for selected month |

### Result
- Both care plans visible always (Peltier + Mum), with clear messaging when one has no payroll for the month
- Operating costs go from 6 vague sliders to ~35 line items across 8 real accounting categories
- T&T statutory costs (Business Levy, Green Fund, Corp Tax provision) auto-calculated against gross revenue
- Foundation laid for the persistent `business_expenses` ledger to plug in next

