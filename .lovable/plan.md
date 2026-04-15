

# Plan: Correct NIS Language Across All Documents and UI

## What's Changing
The old NIS wording implies Tavara directly covers/pays NIS, which is legally inaccurate. The new wording positions Tavara as providing **guidance, coordination, and support** for NIS compliance — consistent with the platform positioning as a coordination platform (not an employer).

## Old Text (various forms)
- "NIS (National Insurance) contributions for the assigned caregiver are included and covered by Tavara as required by Trinidad & Tobago law."
- "NIS (National Insurance) contributions for the assigned caregiver are covered by Tavara."
- "NIS: Covered by Tavara"
- "NIS compliance coverage"

## New Text
**Full version (for notes/quotes):**
"NIS (National Insurance) contributions for assigned caregivers are managed in accordance with Trinidad & Tobago regulations, with Tavara providing guidance, coordination, and support to ensure compliance."

**Short version (for onboarding report PDF):**
"NIS: Managed per T&T regulations — Tavara provides guidance & coordination"

**Bullet point (for subscription includes list):**
"NIS compliance guidance and coordination"

## Files to Update

### 1. `src/services/care-plans/invoiceService.ts`
- **Line 89**: Update the `DEFAULT_TERMS` array entry
- **Line 524**: Change "NIS compliance coverage" → "NIS compliance guidance and coordination" (subscription includes list)
- **Line 535**: Update the `additionalNotes` default

### 2. `src/components/care-plan/DocumentsTab.tsx`
- **Line 147**: Update the `additionalNotes` string in `buildBillingData`

### 3. `src/pages/admin/AdminOnboardingChecklistPage.tsx`
- **Line 566**: Update the onboarding report PDF text from "NIS: Covered by Tavara" to the short version

### 4. Memory update
- Update `mem://integrations/nis-tt-payroll` to reflect the corrected language positioning

**Total: 5 string replacements across 3 files + 1 memory update. No logic changes.**

