

# Plan: Tavara Care Environment Support — New Premium Service Arm

## Summary
Reposition the existing $199 "Home Setup Support / Care Readiness" into a 3-tier "Care Environment Support" service arm, add a new onboarding section with warm dignity-centered copy, and wire everything into billing/invoicing/unit economics.

---

## Technical Details

### 1. Database: Update existing + insert new billable service items

**Update existing item** (id: `a01245d4-f5a2-4b1e-a7b2-002c3c5dfcb3`):
- Change label: `Home Setup Support / Care Readiness` → `Care Readiness Assessment`
- Change category: `setup` → `care_environment_support`
- Update description to reflect assessment + guidance positioning
- Keep price at $199

**Insert 2 new items** into `billable_service_items`:
- **Guided Home Reset** — $499, one_time, category `care_environment_support`, sort_order 3
- **Full Care Environment Reset** — $0 (custom/quote-based), one_time, category `care_environment_support`, sort_order 3

### 2. New Onboarding Section in `onboardingSections.ts`

Add a new section **before** `daily_checklist` (or alongside it):

```
{
  id: "care_environment",
  title: "Preparing Your Home for Care",
  iconName: "Leaf",
  description: "Support in preparing the home as a safe, dignified care environment",
  serviceCategory: "care_environment_support",
  helperText: "warm positioning copy...",
  items: [
    "Home walkthrough and caregiver workflow mapping",
    "Hygiene, safety, and airflow assessment",
    "Decluttering recommendations and space optimization",
    "Caregiver workspace and movement considerations",
    "Light organization and sanitation planning guidance",
    "Coordination of deeper resets when needed (vendor management)",
  ],
}
```

This will automatically render the `ServiceSelectionBlock` for `care_environment_support` category items in both admin and family onboarding pages.

### 3. New Component: `CareEnvironmentIntroCard.tsx`

A warm intro card rendered above `CareSuppliesCard` when the `care_environment` section is active. Contains the dignity-centered copy from the request, plus the 3 service tiers as informational display. The actual selection happens via `ServiceSelectionBlock`.

### 4. Update `CareSuppliesCard.tsx`

- Add a "Part 2" framing: keep existing supplies list but add a subtle header indicating it's part of the readiness flow
- Remove the "Home Setup" supply category (items 56-61) since that's now covered by the new service arm

### 5. Update `AdminOnboardingChecklistPage.tsx`

- Render `CareEnvironmentIntroCard` when `section.id === "care_environment"`
- Keep `CareSuppliesCard` rendering for `daily_checklist` section (existing behavior preserved)

### 6. Update `FamilyOnboardingChecklistPage.tsx`

- Same pattern: render the intro card for the `care_environment` section
- The `ServiceSelectionBlock` already auto-renders via `serviceCategory` matching

### 7. Billing Integration — Already Handled

The existing architecture automatically handles:
- **Quotes/Invoices**: `DocumentGenerationMenu.tsx` and `DocumentsTab.tsx` pull from `care_plan_service_selections` joined with `billable_service_items` — new items will appear automatically
- **Billing Summary**: `BillingSummaryCard.tsx` groups by `billing_type` — one-time items will appear in "One-Time Fees"
- **Unit Economics**: `useUnitEconomics.ts` reads `care_plan_service_selections` with `billable_service_items` — new items with `visible_in_unit_economics: true` will appear automatically
- **Service Commencement**: `ServiceCommencementConfirmation.tsx` reads all selected services — no changes needed

### 8. Memory Update

Save `mem://features/care-environment-support` with the 3-tier structure, language rules, and positioning.

---

## Files Changed

| File | Change |
|------|--------|
| `billable_service_items` (DB) | Update 1 row + insert 2 new rows |
| `src/components/admin/onboarding/onboardingSections.ts` | Add `care_environment` section |
| `src/components/admin/onboarding/CareEnvironmentIntroCard.tsx` | **New** — warm intro + tier descriptions |
| `src/components/admin/onboarding/CareSuppliesCard.tsx` | Minor: remove "Home Setup" category, add Part 2 framing |
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Render `CareEnvironmentIntroCard` for new section |
| `src/pages/family/FamilyOnboardingChecklistPage.tsx` | Same rendering for family view |
| `mem://features/care-environment-support` | **New** memory file |
| `mem://index.md` | Add reference |

No changes needed to invoice, quote, unit economics, or billing summary — the existing `billable_service_items` + `care_plan_service_selections` architecture handles it automatically.

