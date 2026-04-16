

# Plan: Update Care Environment Cards — Add Supplies Checklist + Refine Service Tier Descriptions

## Summary
Two changes across admin and family-facing onboarding:
1. Move the "Basic Care Supplies" checklist from the Daily Care Checklist SOP card into the "Preparing Your Home for Care" (`CareEnvironmentIntroCard`) card — this is the foundational readiness step Anna should see
2. Update all 3 service tier descriptions (in both `CareEnvironmentIntroCard.tsx` and `CareEnvironmentJourneyStepContent.tsx`) to accurately reflect the business model

## What Changes

### 1. Add Care Supplies checklist to `CareEnvironmentIntroCard.tsx`
Import and render the `SUPPLY_CATEGORIES` data (from `CareSuppliesCard.tsx`) inside the "Preparing Your Home for Care" card, positioned before the service tiers. This makes the supplies list part of the care environment readiness flow rather than buried in the caregiver SOP section.

- Export `SUPPLY_CATEGORIES` from `CareSuppliesCard.tsx` so it can be reused
- Render the supplies grid inside `CareEnvironmentIntroCard` with a heading like "📋 Basic Care Supplies — Family Responsibility"

### 2. Update service tier descriptions in both components

**Level 1 — Care Readiness Assessment**
- Price: Show as "Waived" (not $199) with a strikethrough on the original price, or simply "$0 — Waived"
- Description update: "Structured home walkthrough, caregiver workflow mapping, hygiene and safety assessment, decluttering recommendations, and space optimization plan. Provided as part of your care onboarding."
- Badge: "Waived" instead of "Included with care" on the family journey component

**Level 2 — Guided Home Reset ($499)**
- Price stays $499 (one-time coordination fee)
- Description update: "Decluttering the space, lightening the home, and addressing hygiene concerns. Tavara coordinates and guides this process — the $499 covers our hands-on coordination until completion. External contractor costs (cleaning, pest treatment, etc.) are the family's responsibility and quoted separately."
- Clarify this also covers guidance on what the Full Care Environment Reset would entail

**Level 3 — Full Care Environment Reset (Custom)**
- Price stays "Custom"
- Description update: "Ongoing care environment support — including recurring pest control coordination, contractor management, and sustained home readiness. After the initial guided reset, this provides continued oversight for things like monthly pest control, seasonal deep cleaning, and any evolving environmental needs. Coordinated and managed by Tavara."
- Billing label: "ongoing / quote-based" instead of just "quote-based"

### 3. Also render supplies on Family Onboarding Checklist
In `FamilyOnboardingChecklistPage.tsx`, add `<CareSuppliesCard />` inside the `care_environment` section (alongside `CareEnvironmentIntroCard`), so Anna sees the full supplies list when she views her onboarding.

## Files Modified
| File | Change |
|------|--------|
| `src/components/admin/onboarding/CareSuppliesCard.tsx` | Export `SUPPLY_CATEGORIES` as named export |
| `src/components/admin/onboarding/CareEnvironmentIntroCard.tsx` | Add supplies checklist, update tier descriptions |
| `src/components/family/CareEnvironmentJourneyStepContent.tsx` | Update tier descriptions, waived pricing for Level 1, ongoing label for Level 3 |
| `src/pages/family/FamilyOnboardingChecklistPage.tsx` | Add `CareSuppliesCard` to `care_environment` section |

