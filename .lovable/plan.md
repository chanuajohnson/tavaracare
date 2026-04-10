

## Add "Rates, Care Changes & Escalation" Section to Onboarding Checklist

### Purpose
Add a new onboarding section that covers pricing transparency, holiday/overtime rates, care escalation triggers, and the change-order process. This ensures families understand the baseline service agreement and what happens when care needs evolve over time.

### New Section: "Rates, Care Changes & Escalation"
Positioned after "Caregiver Matching & Introduction" (section 9) and before "Next Steps & Follow-Up" (section 10), using the `DollarSign` icon from lucide-react.

**Checklist items:**

1. Review base rate tiers: Standard ($35/hr), Full Service ($40/hr), Premium ($45+/hr)
2. Holiday rates apply — time and a half (1.5x) on recognized holidays; double time (2x) on Christmas
3. Extended hours / overtime rates — time and a half for shifts beyond standard coverage
4. Change orders: any increase in service scope is recorded and discussed before taking effect
5. Care escalation triggers — bedridden status, wheelchair/lift needs, increased fall risk
6. Dietary changes — stricter dietary requirements may increase care complexity and cost
7. Medication changes — new prescriptions or regimen changes require updated care documentation
8. Errands and personal runs (grocery, market) — arranged privately with nurse at agreed stipend, outside Tavara scope
9. Baseline care level is established at onboarding; all changes from baseline are documented
10. Family will be notified and consulted before any rate or care level adjustment takes effect

### File Changed

| File | Change |
|------|--------|
| `src/components/admin/onboarding/onboardingSections.ts` | Add new `rates_and_changes` section object to `ONBOARDING_SECTION_DEFS` array between `caregiver_matching` and `next_steps` |
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Add `DollarSign` to the lucide icon import and to `ICON_MAP` |
| `src/pages/family/FamilyOnboardingChecklistPage.tsx` | Add `DollarSign` to `ICON_MAP` |
| `src/pages/public/OnboardingGuidePage.tsx` | Add `DollarSign` to `ICON_MAP` |

### Technical Details
- Uses existing `DollarSign` icon from lucide-react (already available, just needs importing)
- No database changes — section data lives in the shared `onboardingSections.ts` file
- All three views (admin, family, public) automatically pick up the new section since they all consume `ONBOARDING_SECTION_DEFS`
- Holiday rates align with existing `holidaysService.ts` (1.5x standard, 2x Christmas)
- Rate tiers align with the existing $35/hr minimum and tier structure already in the platform

