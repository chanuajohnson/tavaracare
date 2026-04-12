

## Plan: Add Scope/Add-On T&C Items + Podiatry Line Item on Quote + Family Approval Confirmation

### 3 changes:

---

### 1. Add 5 new T&C items to the Family Onboarding Checklist

**File**: `src/components/admin/onboarding/onboardingSections.ts`

Add these 5 items to the `family_terms` section (after the existing 8 items):

1. `"Family understands that care is primarily provided for the identified care recipient and does not extend to other household members unless explicitly agreed and billed as an additional service"`
2. `"Family confirms approval of any additional care services requested (e.g. podiatric care for secondary household member), as outlined in the quotation"`
3. `"Family understands that approved secondary services are limited to the defined task only and do not extend to general caregiving for the secondary individual"`
4. `"Family acknowledges that additional services are billed weekly and will continue unless discontinued in writing with one (1) week's notice"`
5. `"Family confirms that caregiver support will be provided in a manner that respects existing household roles and routines, with the caregiver supporting — not replacing — family responsibilities where appropriate"`

---

### 2. Add optional Podiatry Care add-on toggle to DocumentsTab

**File**: `src/components/care-plan/DocumentsTab.tsx`

Add a checkbox toggle: **"Include Podiatric Care Support (Secondary Household Member)"** above the document generation cards. When checked, the `buildBillingData()` call appends an additional line item:

- Description: `Podiatric Care Support (Secondary Household Member)`
- Amount: `$349.00`
- Note: `Twice-daily antifungal treatment — full care cycle: preparation, hygiene protocol, application, and post-care handling`

The subtotal and total are recalculated to include $349. An additional note is appended: `"This service is limited to the defined podiatric care task only and does not extend to general caregiving for the secondary household member. Service continues weekly unless discontinued in writing with one (1) week's notice."`

Also update `buildDefaultCareBillingData` in `invoiceService.ts` to accept an `additionalLineItems` array in overrides so extra items can be cleanly merged.

**File**: `src/services/care-plans/invoiceService.ts`

Update `buildDefaultCareBillingData` to support merging `additionalLineItems` into the default line items and recalculating totals.

**File**: `src/components/admin/care-plans/DocumentGenerationMenu.tsx` — same toggle for the admin-side document generation.

---

### 3. Add Family Approval confirmation card on FamilyOnboardingChecklistPage

**File**: `src/pages/family/FamilyOnboardingChecklistPage.tsx`

Add a "Service Commencement Approval" card in the post-onboarding summary section. It contains:

- A confirmation checkbox: `"I confirm the care start date above and authorize billing to commence as planned"`
- The checkbox is saved to `onboarding_checklists.checked_items` as `family_approval_confirmed: true` (persisted via Supabase update)
- Once checked, it shows a green confirmation badge: "Approved — Digital signature recorded on [date]"
- The approval timestamp is saved as `family_approval_date`

This serves as the family's digital signature to commence care with the first billable week.

---

### Files Modified

| File | Change |
|------|--------|
| `src/components/admin/onboarding/onboardingSections.ts` | Add 5 scope/add-on T&C items to `family_terms` |
| `src/services/care-plans/invoiceService.ts` | Support `additionalLineItems` in `buildDefaultCareBillingData` |
| `src/components/care-plan/DocumentsTab.tsx` | Add podiatry care toggle checkbox, inject line item into billing data |
| `src/components/admin/care-plans/DocumentGenerationMenu.tsx` | Same podiatry toggle for admin-side generation |
| `src/pages/family/FamilyOnboardingChecklistPage.tsx` | Add "Service Commencement Approval" card with digital signature checkbox |

