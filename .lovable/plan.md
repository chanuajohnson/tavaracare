

## Plan: Fix Missing Service Components in Admin Onboarding Checklist

### Root Cause

The Service Selection Blocks, Billing Summary Card, and Service Commencement Confirmation are all gated by `familyCarePlanId`, which is only set when the selected family has a care plan with `status = 'active'` (line 1449 of `AdminOnboardingChecklistPage.tsx`).

If Ana Maria Aimey's care plan has a different status (e.g., `draft`, `pending`, `inactive`), `familyCarePlanId` remains `null` and all three components are hidden silently.

### Changes

**1. `src/pages/admin/AdminOnboardingChecklistPage.tsx` (line ~1445-1455)**

- Broaden the care plan query to include non-active statuses relevant during onboarding (e.g., `draft`, `pending`, `active`) using `.in('status', ['active', 'draft', 'pending'])` instead of `.eq('status', 'active')`
- Add a visible fallback message when no care plan is found for the selected family, so it's clear why service blocks aren't showing (e.g., "No care plan found for this family. Create one to enable service selection.")
- Prefer `active` plans first, fall back to `draft`/`pending` if no active plan exists

**2. `src/pages/admin/AdminOnboardingChecklistPage.tsx` (line ~1041)**

- Add a small info note when `familyCarePlanId` is null but `section.serviceCategory` exists, telling the admin "Service selection requires a linked care plan"

### Result

- Service Selection Blocks will appear in Pre-Call, Care Plan Review, Medication, Meals, Caregiver Matching, and Rates sections as long as the family has any care plan (not just active ones)
- Billing Summary Card and Service Commencement Confirmation will render in Post-Onboarding Summary
- If no care plan exists at all, a clear message tells the admin what's needed

### Files Modified
1. `src/pages/admin/AdminOnboardingChecklistPage.tsx` — broaden care plan status filter, add fallback UI

