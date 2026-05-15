# Family Payment Milestones — Logging & Display

Goal: Log Ana Maria Aimey's three real payments to Denise Narcis's care plan as durable records, then surface them as a milestone ticker on the admin Onboarding Checklist and as a banner on the family dashboard. Also clean up the Limited Access banner.

## Payments to log (Ana Maria Aimey, plan w/ Denise Narcis, Apr 13 – May 8)

| # | Paid date | Week ending | Amount (TTD) | Breakdown |
|---|-----------|-------------|--------------|-----------|
| 1 | 2026-04-16 | Apr 13 (Mon) week | $1,899 | $1,400 caregiver + $499 subscription |
| 2 | 2026-05-01 | Apr-end week | $2,248 | $1,400 caregiver + $499 subscription + $349 NIS one-time registration/coordination |
| 3 | 2026-05-07 | May 4 (Mon) week | $1,899 | $1,400 caregiver + $499 subscription |
| **Total** | | | **$6,046** | Plan closed Friday May 8, 2026 |

(I'll confirm the $349 NIS-fee figure with you before insert — your message said the May 1 payment "included" it but didn't name the amount; $2,248 − $1,400 − $499 = $349.)

## What I'll build

### 1. Data model — new table `family_payment_records`
A lightweight manual ledger so admin can log any historical / offline payment per family + care plan. Separate from `payment_transactions` (which is PayPal-only).

Columns:
- `id`, `created_at`, `created_by` (admin uuid)
- `family_user_id` (→ profiles.id)
- `care_plan_id` (nullable → care_plans.id)
- `paid_date` (date the family actually paid)
- `period_start`, `period_end` (the week the payment covers)
- `total_amount` numeric, `currency` default 'TTD'
- `line_items` jsonb — array of `{ label, amount, category }` where category ∈ `caregiver_care | subscription | nis_registration | coordination | other`
- `notes` text
- `is_milestone` boolean default true
- `receipt_id` (nullable, link to a generated receipt later)

RLS: admins full access; family can `select` their own records. Migration includes seed `INSERT`s for the three payments above (after you confirm the NIS amount).

### 2. Admin Onboarding Checklist — Payment Milestone Ticker
On `src/pages/admin/AdminOnboardingChecklistPage.tsx`, add a horizontal ticker strip pinned at the top of the family's checklist view:

```text
┌────────────────────────────────────────────────────────────────┐
│  PAYMENTS · 3 received · TTD $6,046 total                      │
│  ● Apr 16 — $1,899  ● May 1 — $2,248 (incl. NIS)  ● May 7 — $1,899 │
└────────────────────────────────────────────────────────────────┘
```
- Color-coded chips per payment, click → opens a drawer with full line-item breakdown
- Shows "No payments logged yet" empty state with an "Add payment" button for admins
- New component: `src/components/admin/care-plans/PaymentMilestoneTicker.tsx`
- New service: `src/services/care-plans/familyPaymentService.ts` (CRUD)

### 3. Family Dashboard — Payment Records Banner
On `src/pages/dashboard/family.tsx`, add a new banner placed **directly under** `<LimitedAccessBanner />`:
- New component: `src/components/family/dashboard/PaymentRecordsBanner.tsx`
- Shows compact milestone strip (same chips, read-only) titled "Your payment records"
- Each chip click → expandable card with line items, paid date, period
- Hidden when there are zero records
- Uses semantic tokens (no hard-coded colors), responsive at 1189px and mobile

### 4. Limited Access banner cleanup
In `src/components/family/dashboard/LimitedAccessBanner.tsx`:
- Remove the "Talk to Coordinator" outline button (and its `Link to="/support"`)
- Keep "WhatsApp Coordinator" as the single CTA
- Drop the now-unused `MessageCircle` import

## Files touched
- **New**: `supabase/migrations/<ts>_family_payment_records.sql`
- **New**: `src/services/care-plans/familyPaymentService.ts`
- **New**: `src/components/admin/care-plans/PaymentMilestoneTicker.tsx`
- **New**: `src/components/family/dashboard/PaymentRecordsBanner.tsx`
- **Edit**: `src/pages/admin/AdminOnboardingChecklistPage.tsx` (mount ticker at top of checklist view)
- **Edit**: `src/pages/dashboard/family.tsx` (mount banner under LimitedAccessBanner)
- **Edit**: `src/components/family/dashboard/LimitedAccessBanner.tsx` (remove Talk to Coordinator)

## Two questions before I build
1. **NIS one-time fee on May 1** — confirm it was **$349** (the math residual)? Or was a different breakdown intended (e.g., coordination fee vs. NIS registration split)?
2. **Add-payment UI** — do you want admins to be able to add/edit future payments inline from the ticker now, or should I just seed the three historical records and add the admin entry form in a follow-up?
