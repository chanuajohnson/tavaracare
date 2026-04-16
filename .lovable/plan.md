

# Plan: Fix Missing Services in Service Commencement Confirmation

## Problem
The Service Commencement Confirmation card for Anna only shows the synthetic "Standard Weekly Care — Caregiver" line at $1400/wk. Her 3 approved service selections from the database are not appearing:
- **Active Care Management** — $499/wk (overridden from $699 — this is her legacy plan rate)
- **Care Assessment & Setup** — $0 (waived from $499)
- **Caregiver Matching & Placement** — $0 (waived from $299)

## Root Cause Investigation
The query pattern `select('*, billable_service_items(*)')` is used identically across BillingSummaryCard, DocumentsTab, DocumentGenerationMenu, and useUnitEconomics — all working. The RLS policies allow admin full access. The data exists in the database (confirmed via direct query). The most likely cause is either:
1. A silent query error not being surfaced (the catch block logs but returns empty)
2. The `carePlanId` prop being passed incorrectly from the parent

## Changes

### 1. `ServiceCommencementConfirmation.tsx` — Add error visibility and debug logging
- Add `console.log` for the query result to surface any silent failures
- Add error display when query fails so missing data is visible
- Ensure `data` check handles edge cases (empty array vs null)

### 2. `ServiceCommencementConfirmation.tsx` — Add subscription plan line support
- Add optional `subscriptionLabel` and `subscriptionRate` props so the parent can inject a plan line (e.g., "Care Coordination — $499/wk (Legacy)")
- This synthetic line shows alongside the DB services and caregiver line, giving a complete billing picture

### 3. `AdminOnboardingChecklistPage.tsx` — Pass subscription plan data
- Pass the subscription plan details from the onboarding checklist items to `ServiceCommencementConfirmation`
- Look up the `billing_plan` or `subscription_tier` checked item values to determine the label and rate

### 4. Verify `familyCarePlanId` is correct
- Add a console log in the admin page to confirm the correct care plan ID is being passed to the component
- If it's wrong or undefined, the query returns empty — this would explain why no services appear

## Files Modified
| File | Change |
|------|--------|
| `src/components/admin/onboarding/ServiceCommencementConfirmation.tsx` | Add debug logging, error display, subscription plan line support |
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Pass subscription plan props, add debug log for carePlanId |

