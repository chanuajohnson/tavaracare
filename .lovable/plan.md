

## Plan: Lock In "Coordination Platform, Not Agency" Across All Surfaces + Quarterly Action Roadmap

Two parallel deliverables:
1. **Positioning audit & enforcement** — guarantee "coordination platform, not agency" language appears everywhere it matters and never accidentally appears as agency-style language
2. **Quarterly action plan** — concrete, time-boxed checklist baked into the admin Unit Economics page so we hit profit + growth targets every quarter

---

## Part 1: Positioning Enforcement (No-Agency Guardrail)

### 1a. Audit existing copy
Sweep these surfaces for any phrasing that implies agency / employer relationship and replace with coordination-platform language:

| Surface | File(s) |
|---|---|
| Family Dashboard | `src/pages/dashboard/FamilyDashboard.tsx`, `src/components/family/*` hero/intro components |
| Professional Dashboard | `src/pages/dashboard/ProfessionalDashboard.tsx`, professional intro components |
| Family Onboarding Checklist | `src/components/admin/onboarding/onboardingSections.ts` + intro cards |
| Professional Onboarding Checklist | `src/components/admin/onboarding/professionalOnboardingSections.ts` + intro cards |
| FAQ pages | `src/pages/FAQPage.tsx` (or equivalent), any FAQ data files |
| Quotations / Invoices / Receipts | `supabase/functions/generate-*-pdf` edge functions, billing PDF generators, nudge templates |
| Onboarding report PDFs | Existing PDF generators (per memory, already aligned but verify footer disclaimer) |
| Bank transfer / billing nudges | WhatsApp templates with hardcoded billing copy |

### 1b. Standard disclaimer block (single source of truth)
Create one shared component: `src/components/shared/PlatformPositioningDisclaimer.tsx`

A reusable footer-style block with three variants (`compact`, `inline`, `full`):
> **Tavara is a Care Coordination & Management Platform.** Families engage caregivers directly. Tavara coordinates matching, scheduling, payroll calculation, and quality oversight — but is not an employment agency, placement agency, or employer of caregivers. Caregiver wages flow as a transparent pass-through; coordination fees fund platform operations.

Mount this disclaimer on:
- Family Dashboard footer (compact)
- Professional Dashboard footer (compact)
- Family + Professional Onboarding Checklist intro card (inline)
- FAQ page (full, in dedicated "About Tavara's Model" section)
- Generated Quotation, Invoice, and Receipt PDFs (compact, in footer)
- Billing nudge WhatsApp templates (one-line version)

### 1c. FAQ entry
Add a new FAQ Q&A pair (top of list):
- **"Is Tavara a care agency?"** — No, Tavara is a Care Coordination & Management Platform. Families engage caregivers directly; we coordinate matching, scheduling, training oversight, and payroll calculation.
- **"Who employs the caregiver?"** — The family is the employer of record for NIS purposes. Tavara handles NIS calculations and government form generation as a coordination service.
- **"What does Tavara's coordination fee cover?"** — Caregiver matching, schedule coordination, payroll calculation, training oversight, dispute resolution, and platform infrastructure. It does not cover caregiver wages, which flow directly as a transparent pass-through.

### 1d. Expense category guardrail
In the upcoming `expense_categories` seed (from previous approved plan), add a `platform_positioning_warning` flag on these categories:
- "Labor & Training" → warning: *"Log as contractor stipend / training pay. Never label as 'wages' or 'salary' — Tavara does not employ caregivers."*
- "Founder Time" → warning: *"Logged for true cost accounting. Tax-deductible only if paid out as director's fees per BIR rules."*

Surface this warning as a yellow info banner in the expense entry dialog whenever those categories are selected.

### 1e. Memory update
Update `mem://legal/platform-positioning-standard` to note: positioning disclaimer is enforced via `PlatformPositioningDisclaimer` shared component across dashboards, onboarding, FAQ, and all generated financial documents.

---

## Part 2: Quarterly Action Roadmap (Built Into Unit Economics)

### 2a. New tab on `/admin/unit-economics`: "Quarterly Action Plan"

A live checklist organized by quarter with target dates, owners, status tracking, and links to relevant dashboard surfaces. Stored in a new `quarterly_action_items` table so progress persists and admins can mark items done, in-progress, or blocked.

**Database**: `quarterly_action_items` (id, quarter, year, category, title, description, target_date, owner, status, completion_notes, completed_at, sort_order)

Seeded with this initial roadmap (admin can edit/add):

#### Q1 — Foundation & Compliance (Months 1-3)
- [ ] Register all current recurring software subscriptions in expense ledger (Lovable, Supabase, OpenAI, WhatsApp Business, domain) — **Week 1**
- [ ] Backfill last 90 days of direct client costs (training stipends, devices) — **Week 2**
- [ ] Log founder time daily for 30 days to establish baseline hourly cost — **Month 1**
- [ ] Confirm 5 active paying clients with positive margin — **Month 2**
- [ ] Hit TT$50k cumulative gross revenue (8% of VAT threshold) — **Month 3**
- [ ] Quarterly Business Levy + Green Fund Levy filing — **End of quarter**

#### Q2 — Growth & Margin Discipline (Months 4-6)
- [ ] Achieve 20%+ avg margin across all clients — **Month 4**
- [ ] Onboard 3 net-new paying clients — **Month 5**
- [ ] Hit TT$150k cumulative YTD (25% of VAT threshold) — **Month 6**
- [ ] Reduce overhead-to-revenue ratio below 40% — **Month 6**
- [ ] Quarterly Business Levy + Green Fund Levy filing — **End of quarter**

#### Q3 — Scale Prep (Months 7-9)
- [ ] Hit TT$300k cumulative YTD (50% of VAT threshold) — **Month 7**
- [ ] Begin VAT registration paperwork (proactive, before crossing threshold) — **Month 8**
- [ ] Document all SOPs for caregiver-side and family-side operations — **Month 9**
- [ ] Average client lifetime ≥ 6 months (churn check) — **Month 9**
- [ ] Quarterly Business Levy + Green Fund Levy filing — **End of quarter**

#### Q4 — Profit & Compliance Close (Months 10-12)
- [ ] Hit TT$600k YTD — VAT registration must be active — **Month 10**
- [ ] Net profit ≥ 25% of revenue — **Month 11**
- [ ] Annual Corporation Tax estimate prepared for accountant — **Month 12**
- [ ] Year-end audit-ready expense export (CSV by BIR category) — **Month 12**
- [ ] Set next-year quarterly targets — **Month 12**

### 2b. UI: Quarterly Action Plan tab
- Quarter selector (Q1/Q2/Q3/Q4 + year)
- Progress bar: items complete / total for the quarter
- Grouped checklist with target date, owner, status badge (Todo/In Progress/Done/Blocked), inline notes
- "Add custom action item" button
- Visual cue when target_date is approaching (yellow within 14 days, red if overdue)
- Summary card at top: "X of Y quarterly targets on track" + countdown to next levy filing

### 2c. Integration with Tax Dashboard tab
The Tax Dashboard (from previously-approved plan) gets a new card: **"Next Quarterly Action Deadline"** that surfaces the soonest-due item from the action plan.

---

## Files

| File | Change |
|---|---|
| `src/components/shared/PlatformPositioningDisclaimer.tsx` | NEW — reusable 3-variant disclaimer block |
| `src/pages/dashboard/FamilyDashboard.tsx` | Mount `<PlatformPositioningDisclaimer variant="compact" />` in footer |
| `src/pages/dashboard/ProfessionalDashboard.tsx` | Same |
| `src/components/admin/onboarding/onboardingSections.ts` | Add disclaimer to family intro card |
| `src/components/admin/onboarding/professionalOnboardingSections.ts` | Add disclaimer to professional intro card |
| `src/pages/FAQPage.tsx` (or FAQ data file) | Add 3 new "About Tavara's Model" FAQ entries |
| `supabase/functions/generate-*-pdf/index.ts` | Add disclaimer line to quotation/invoice/receipt PDF footers |
| Billing nudge templates | Add one-line disclaimer to WhatsApp billing templates |
| `supabase/migrations/...` | NEW table `quarterly_action_items` + RLS (admin-only) + seed initial roadmap |
| `src/hooks/admin/useQuarterlyActionPlan.ts` | NEW — fetch/update/add/complete action items |
| `src/components/admin/expenses/QuarterlyActionPlanTab.tsx` | NEW — quarter selector, grouped checklist, progress UI |
| `src/components/admin/expenses/QuickLogExpenseDialog.tsx` | Show positioning warning banner when Labor & Training or Founder Time selected |
| `src/pages/admin/UnitEconomicsPage.tsx` | Add "Quarterly Action Plan" as 6th tab |
| `mem://legal/platform-positioning-standard` | Update — disclaimer now enforced via shared component everywhere |

## Why this seals it
1. **Single source of truth** for positioning copy — one component change updates every surface
2. **No accidental agency drift** — expense category warnings + standard disclaimer block prevent slip-ups
3. **Quarterly accountability** — concrete time-boxed targets visible every time admin opens unit economics
4. **Compliance-aligned** — quarterly levy filings + VAT threshold milestones baked into the roadmap
5. **Scales with us** — admins can edit/add action items as priorities shift each quarter

