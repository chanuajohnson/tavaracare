

## Plan: Rename "Nursing" to "Caregiver" + Align Professional Tab with Payment (Not Billing) Context

### Key Insight
The professional is **paid**, not **billed**. The professional tab should show compensation/payment terms — not billing summaries meant for families. The admin professional tab should surface the caregiver's rate, shift, weekly earnings, and payment schedule in a way that aligns with the family billing but is framed as **earnings/compensation**.

### Changes

**1. Rename "Nursing" → "Caregiver" across all affected files**

- `ServiceCommencementConfirmation.tsx` line 92: `Standard Weekly Care — Nursing` → `Standard Weekly Care — Caregiver`
- `DocumentGenerationMenu.tsx` lines 105, 111-112: `nursingLineItems` → `caregiverLineItems`, label → `Caregiver`
- `invoiceService.ts` lines 440-458: `nurseRate` → `caregiverRate`, `nursingTotal` → `caregiverTotal`, label → `Caregiver`

**2. Professional tab on admin onboarding — add Compensation Summary (not Billing)**

In `AdminOnboardingChecklistPage.tsx`, for `showProfessionalData` in the `post_onboarding` section (after `CareSummaryHeader`):

- When a linked family exists with a `care_rate`, show a **"Compensation Summary"** card (not `BillingSummaryCard`) that displays:
  - Agreed hourly rate (from linked family's `care_rate`)
  - Assigned shift and weekly hours
  - Projected weekly earnings (rate × hours)
  - Payment schedule: "Weekly (every Friday)"
  - Late payment note
- This reuses the rate data from `linkedFamilyCheckedItems["care_rate"]` — same source, different framing
- Does NOT show `BillingSummaryCard` (that's family billing, includes subscription fees irrelevant to the caregiver)

**3. Professional tab — show CaregiverRateSelector in rates section (read-from-family context)**

In the `rates_and_changes` section, when `showProfessionalData` and a family is linked:
- Show the `CaregiverRateSelector` reading from `linkedFamilyCheckedItems["care_rate"]` in **read-only** mode (rate is set on family side, professional sees it)
- Show `RateTierReferenceCard` (already renders for both tabs)

**4. Family-facing onboarding — pass careRate and weeklyHours to BillingSummaryCard and ServiceCommencementConfirmation**

In `FamilyOnboardingChecklistPage.tsx` lines 629-633:
- Currently passes only `carePlanId` — add `careRate` and `weeklyHours` props from `checkedItems["care_rate"]`
- This ensures the family sees the caregiver labor line in their approved services

**5. Professional-facing onboarding — update CareSummaryHeader to read actual rate**

In `ProfessionalOnboardingChecklistPage.tsx` line 130:
- Currently hardcoded to `$40/hr (Standard)` — read from `checkedItems["care_rate"]` or linked family data
- Show the caregiver's actual rate and projected weekly earnings

### Files Modified
1. `src/components/admin/onboarding/ServiceCommencementConfirmation.tsx` — "Nursing" → "Caregiver"
2. `src/components/admin/care-plans/DocumentGenerationMenu.tsx` — "Nursing" → "Caregiver"
3. `src/services/care-plans/invoiceService.ts` — "Nursing" → "Caregiver"
4. `src/pages/admin/AdminOnboardingChecklistPage.tsx` — Add compensation summary for professional tab, read-only rate display
5. `src/pages/family/FamilyOnboardingChecklistPage.tsx` — Pass careRate/weeklyHours to components
6. `src/pages/professional/ProfessionalOnboardingChecklistPage.tsx` — Use actual rate instead of hardcoded $40/hr

