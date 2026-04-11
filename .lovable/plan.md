

## Plan: Add Payment Terms to Care Summary + Add Post-Onboarding to Professional Checklist

### What Changes

**1. Add payment terms to the Care Summary card** (both admin and family views)

The `CareSummaryHeader` component in both `AdminOnboardingChecklistPage.tsx` and `FamilyOnboardingChecklistPage.tsx` currently shows Rate, Plan, and Start Date. We will expand it to include payment terms from the business logic:

- **Payment**: Weekly, due every Friday
- **Late Fee**: 5% after 3 business days
- **Holiday Rate**: 1.5x (2x Christmas)
- **Overtime**: 1.5x beyond standard shifts

The grid will change from 3 columns to a 2x3 or responsive grid to accommodate the additional fields.

**2. Add a Post-Onboarding section to the Professional checklist**

The professional onboarding (`professionalOnboardingSections.ts`) currently has 9 sections but no post-onboarding summary like the family side. We will add a matching `post_onboarding` section with professional-relevant milestones:

- Onboarding completed successfully -- welcome to the Tavara Care team
- Assigned to family and introduction scheduled
- First meeting: Tavara coordinator, professional, and family at client residence
- Professional commences work at client residence (start date)
- Professional is paid weekly by Tavara
- NIS contributions covered by Tavara
- View your assignments and care plans
- View your onboarding progress

This section will include `dateFields` for items 1-3 (Introduction Date, Meeting Date, Start Date) and `links` for items 6-7 pointing to the professional dashboard and onboarding checklist.

**3. Update ProfessionalOnboardingChecklistPage to render dates, links, and summary**

The professional's read-only checklist page currently does not support date badges or links. We will add:
- `parseLocalDate` helper (same as family page)
- Date badge rendering for `dateFields`
- Link rendering for `links`
- A `CareSummaryHeader` at the top of the post_onboarding section (showing rate, payment terms, start date)

---

### Files Modified

| File | Changes |
|------|---------|
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Expand `CareSummaryHeader` with payment terms (weekly Friday, 5% late fee, holiday/overtime rates) |
| `src/pages/family/FamilyOnboardingChecklistPage.tsx` | Same `CareSummaryHeader` expansion |
| `src/components/admin/onboarding/professionalOnboardingSections.ts` | Add `post_onboarding` section with dateFields and links |
| `src/pages/professional/ProfessionalOnboardingChecklistPage.tsx` | Add `parseLocalDate`, date badges, link rendering, and `CareSummaryHeader` for post_onboarding section |

### Technical Details

**CareSummaryHeader** -- expanded grid:
```text
┌──────────────────────────────────────────────────────┐
│  💙 Care Summary                                      │
│                                                        │
│  Rate: $35/hr (Standard)    Plan: Family Care (weekly) │
│  Start Date: April 13, 2026  Payment: Weekly (Fridays) │
│  Late Fee: 5% after 3 days   Holiday: 1.5x (2x Xmas)  │
└──────────────────────────────────────────────────────┘
```

**Professional post_onboarding section** -- mirrors family structure with professional-specific items, uses same `dateFields`/`links` interface from `OnboardingSectionDef`.

