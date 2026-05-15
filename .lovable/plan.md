# Plan & End Date — admin checklist + family/professional dashboards

## What changes

### 1. Add the new "removed from assignment" milestone (admin + professional checklists)
Both `onboardingSections.ts` (family) and `professionalOnboardingSections.ts` get a new item inserted **right after** the existing "commences work" line, mirroring its shape:

> "Care team member removed from assignment at client residence (end date confirms billing period)"

with `dateFields[4] = "End Date"`. Because the array grows by one, every following entry's index shifts by +1 — the `links` map keys in both files (and the helper-text reference in `AdminOnboardingChecklistPage.tsx` at `post_onboarding_3`) get re-indexed.

The end date is stored in the existing `onboarding_checklists` / `professional_onboarding_checklists` tables under the key `post_onboarding_4_date`. No DB migration needed.

### 2. Admin & professional onboarding "Care Summary" headers
Both `CareSummaryHeader` blocks (in `AdminOnboardingChecklistPage.tsx` and `ProfessionalOnboardingChecklistPage.tsx`) get a new "End Date" cell that shows the formatted `post_onboarding_4_date` when set, or "Active — no end date" when not.

### 3. Family dashboard — payment records card shows plan dates
`PaymentRecordsBanner` already wraps `PaymentMilestoneTicker` in family mode. We extend it to also fetch the family's `onboarding_checklists` row and pull `post_onboarding_3_date` (start) + `post_onboarding_4_date` (end). The ticker gets a new optional `milestoneDates` prop and renders two date pills above the payment chips — "Plan Start: Apr 13, 2026" and "Plan End: May 8, 2026" (end pill hidden if not set).

### 4. Professional dashboard — new payment-records card
New component `src/components/professional/ProfessionalPaymentRecordsCard.tsx`. Mounted in `ProfessionalDashboard.tsx` immediately under `ProfessionalMatchingReadinessBanner` (which already sits under the status banners), before `CurrentAssignmentsSection`.

It:
- Reads active assignments via `useUnifiedMatches('professional')`
- Picks the most recent active assignment's `family_user_id` + `care_plan_id`
- Reuses `PaymentMilestoneTicker` in family (read-only) mode with the same `milestoneDates` prop, so the professional sees the same plan-start / plan-end pills plus the chronological payment chips
- Heading: "Family payment records — {family name}"
- Returns `null` if no active assignment

This requires no schema change. RLS already allows assigned care-team members to read the family's `onboarding_checklists` row (verified — care_team_members can read their family's records). For `family_payment_records`, the existing policy is admin + the family. **One small migration adds a SELECT policy** so active care-team members can read their assigned family's payment records.

### 5. Migration (one new SELECT policy)
```sql
CREATE POLICY "Active care team can view family payment records"
  ON public.family_payment_records FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.care_team_members ctm
      WHERE ctm.family_id = family_payment_records.family_user_id
        AND ctm.caregiver_id = auth.uid()
        AND ctm.status = 'active'
    )
  );
```
Same for `onboarding_checklists` if not already covered (verify before policy add — skip if existing policy covers care-team read).

## Files touched
- `src/components/admin/onboarding/onboardingSections.ts` — insert item + dateField, re-key links
- `src/components/admin/onboarding/professionalOnboardingSections.ts` — same shape change
- `src/pages/admin/AdminOnboardingChecklistPage.tsx` — `CareSummaryHeader` adds End Date cell; bump `post_onboarding_3` label key reference
- `src/pages/professional/ProfessionalOnboardingChecklistPage.tsx` — header adds End Date cell
- `src/components/admin/care-plans/PaymentMilestoneTicker.tsx` — add optional `milestoneDates?: { startDate?: string; endDate?: string }` prop, render pills row
- `src/components/family/dashboard/PaymentRecordsBanner.tsx` — fetch checklist row, pass milestoneDates
- `src/components/professional/ProfessionalPaymentRecordsCard.tsx` — new
- `src/pages/dashboard/ProfessionalDashboard.tsx` — mount the new card under readiness banner
- One migration adding the SELECT policy on `family_payment_records` for active care-team members.

## Out of scope
No changes to routing, registration, the chat flow, or the family-side write enforcement landed in the previous turn. PaymentMilestoneTicker admin write logic is untouched.
