## Plan: Add Read-Only Service Components to Family Onboarding Checklist

### Problem

The family-facing onboarding page (`/family/onboarding-checklist`) does not show any of the billable service components (ServiceSelectionBlock, BillingSummaryCard, ServiceCommencementConfirmation). These were only added to the admin page. I not seeing it on admin for Families like Chanua Johnson and Ana Maria — and need iton family page as wellwho already have active care plans — cannot see their approved services.

### Changes

**File: `src/pages/family/FamilyOnboardingChecklistPage.tsx**`

1. **Fetch `familyCarePlanId**` — Add a query in the existing `useEffect` load function to fetch the user's care plan ID (matching the admin page logic: prefer `active`, fall back to `draft`/`pending`).
2. **Import and render `ServiceSelectionBlock**` (read-only, compact) — For each section that has a `serviceCategory`, render `<ServiceSelectionBlock carePlanId={familyCarePlanId} filterCategory={section.serviceCategory} readOnly compact />` inside the collapsible content. This shows families which services are selected/approved for their care plan without allowing edits.
3. **Import and render `BillingSummaryCard**` (read-only) — In the `post_onboarding` section, add `<BillingSummaryCard carePlanId={familyCarePlanId} />` alongside the existing `CareSummaryHeader` and `ServiceCommencementApproval`.
4. **Import and render `ServiceCommencementConfirmation**` (read-only) — In the `post_onboarding` section, add `<ServiceCommencementConfirmation carePlanId={familyCarePlanId} readOnly />` so families can see the formal summary of their approved service structure.

### Technical Details

- `ServiceSelectionBlock` already supports `readOnly` and `compact` props — no changes needed to that component
- `BillingSummaryCard` is already read-only by nature
- `ServiceCommencementConfirmation` will need a check: if it doesn't have a `readOnly` prop, we'll pass it anyway (it may already be display-only)
- The care plan query uses `.in('status', ['active', 'draft', 'pending'])` to match families in any onboarding stage
- Both Chanua Johnson (care plan `4848aec5...`) and Ana Maria (care plan `3d634783...`) have `active` care plans, so they will immediately see their service selections once services are selected via the admin page

### Files Modified

1. `src/pages/family/FamilyOnboardingChecklistPage.tsx` — add care plan fetch, import and render 3 service components in read-only mode