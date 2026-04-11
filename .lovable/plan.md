

## Plan: Move Documents to Tab, Add Period Selection, Fix Branding, Improve Line Items

This is a multi-part update covering UI placement, billing period logic, branding corrections, and line item improvements for the care billing document system.

### Changes Overview

**1. Move Documents from header button to a tab** (`CarePlanDetailPage.tsx`)
- Remove `DocumentGenerationMenu` from the header area (lines 144-149)
- Add a new "Documents" tab after "Plan Details" in the TabsList
- Create a new `DocumentsTab` component that contains the generation buttons (Quote, Invoice, Receipt) as cards rather than a dropdown, plus a period selector

**2. Create `DocumentsTab` component** (new file: `src/components/care-plan/DocumentsTab.tsx`)
- Period selector: date picker for selecting the billing period (start date auto-calculated from a "service start date" field, end date = start + 7 days for weekly or start + 30 days for monthly)
- Cadence display: shows whether this family is weekly or monthly
- Three generation buttons as cards (Quote, Invoice, Receipt) with the selected period passed to the PDF generator
- Pulls family-specific data (nurse rate, hours, subscription tier) to build accurate line items

**3. Add Billing Start Date and Cadence fields to admin onboarding checklist** (`AdminOnboardingChecklistPage.tsx`)
- Add a "Billing Configuration" card in the family tab with:
  - Service Start Date (date picker)
  - Billing Cadence (weekly / monthly dropdown)
- Store these in the existing `onboarding_checklists` JSONB `checked_items` field as `billing_start_date` and `billing_cadence`
- These values feed into the DocumentsTab period selector

**4. Fix PDF branding** (`invoiceService.ts`)
- Change `TAVARA_PURPLE = '#7E69AB'` to Tavara blue `#5B8DEF` (derived from CSS `--primary: 217 75% 65%`)
- Change tagline from `'Compassionate Care, Connected'` to `'It takes a village to care'`
- Apply the blue color to: header bar background, table header, total row, subscription border

**5. Improve line items** (`invoiceService.ts`)
- Line 1: "Nursing Care (Standard Tier)" -- keep as-is, pulled from family-specific rate and hours
- Line 2: Rename "Tavara Platform Management Fee" to the subscription tier name (e.g., "Family Care Plan -- Care Management & Coordination"). Show it as the subscription amount (e.g., $199.99/week or $699.99/month) rather than hours x rate
- Remove NIS as a line item; move it to a footer note: "NIS (National Insurance) contributions for the assigned caregiver are included and covered by Tavara as required by Trinidad & Tobago law."
- Update `buildDefaultCareBillingData` to reflect these changes
- Update `CareBillingData` type to support subscription as a line item (flat amount, no hours/rate)

**6. Quote period selection logic**
- When generating a quote, the user selects which billing period (e.g., "Week 1: Apr 14 - Apr 18" based on start date + cadence)
- The `billingPeriodStart` and `billingPeriodEnd` are passed to `generateQuotePDF`
- Quote validity = 14 days from generation date (unchanged)

### Files Changed

| File | Action |
|------|--------|
| `src/components/care-plan/DocumentsTab.tsx` | **Create** -- New tab with period selector + generation buttons |
| `src/pages/family/care-management/CarePlanDetailPage.tsx` | **Modify** -- Remove header DocumentGenerationMenu, add Documents tab |
| `src/services/care-plans/invoiceService.ts` | **Modify** -- Fix branding colors/tagline, improve line items, remove NIS line item |
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | **Modify** -- Add billing start date + cadence fields |

### Technical Details

- Tavara brand blue hex: `#5B8DEF` (from CSS variable `--primary: 217 75% 65%`)
- Tagline: "It takes a village to care"
- Billing config stored in existing JSONB column (no migration needed)
- Period calculation: start date + (7 days for weekly, 30 days for monthly) = end date
- Line items dynamically built from: nurse rate (from onboarding/care plan), subscription tier (from family selection), and hours (from care schedule)

