

## Plan: Add Primary Client Scope Line + Basic Care Supplies Card

### 2 changes:

---

### 1. Add "primary client only" scope line to Daily Care Checklist SOP sections

**3 files affected:**

**`checklistSections.ts`** (professional SOP): Add to the "Start of Shift" section items:
`"Caregivers are assigned to the primary client. Support to other household members is limited to approved, scoped services only"`

**`onboardingSections.ts`** (family onboarding `daily_checklist` section, id line 114): Add item:
`"Caregivers are assigned to the primary client — support to other household members is limited to approved, scoped services only"`

**`professionalOnboardingSections.ts`** (professional onboarding `daily_checklist_sop` section, id line 64): Add item:
`"Caregivers are assigned to the primary client — support to other household members is limited to approved, scoped services only"`

Also add this as a line in the Care Summary header in `FamilyOnboardingChecklistPage.tsx` (the read-only family view) and in the admin `CareSummaryHeader` so it's visible in the post-onboarding summary area.

---

### 2. Add "Basic Care Supplies" reference card to both Family and Professional onboarding tabs

Add a new reusable component `CareSuppliesCard.tsx` in `src/components/admin/onboarding/` that renders a styled card with the supplies checklist grouped by category:

- 🧤 Basic Care Supplies (gloves, sanitizer, disinfectant, cloths, garbage bags)
- 🩺 Health & Monitoring (thermometer, BP machine, pulse oximeter, first aid kit)
- 💊 Medications & Support (prescribed meds, pill organizer, OTC basics)
- 🍽️ Food & Nutrition (groceries, snacks, dietary items)
- 🛏️ Personal Care (towels, soap/lotion, adult care supplies)
- 🧼 Home Setup (clear workspace, kitchen access, laundry access)
- ➕ Optional (notebook, extra linens, comfortable chair)

This card is **informational/reference only** (not checkable items). It renders below the relevant onboarding sections on both tabs, similar to how `RateTierReferenceCard` is rendered below the rates section.

**Placement**: Render `CareSuppliesCard` inside the admin onboarding checklist page after the `daily_checklist` section (family tab) and after the `daily_checklist_sop` section (professional tab). The card title will be "📋 Basic Care Supplies — Family Responsibility" to make it clear the family provides these.

---

### Files Modified

| File | Change |
|------|--------|
| `src/components/professional/checklist/checklistSections.ts` | Add primary-client-only scope line to Start of Shift |
| `src/components/admin/onboarding/onboardingSections.ts` | Add scope line to `daily_checklist` section |
| `src/components/admin/onboarding/professionalOnboardingSections.ts` | Add scope line to `daily_checklist_sop` section |
| `src/components/admin/onboarding/CareSuppliesCard.tsx` | New reusable card component with grouped supplies list |
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Render `CareSuppliesCard` after daily checklist sections on both tabs |
| `src/pages/family/FamilyOnboardingChecklistPage.tsx` | Add "Primary Client" line to Care Summary header |

