

## Plan: Fix Family Notes Visibility + Add Rates Section

### Two changes:

### 1. Fix: Family onboarding checklist not showing admin notes

**Root cause**: `FamilyOnboardingChecklistPage.tsx` passes `filterAssignee="family"` to `OnboardingNotesCard`, so only notes explicitly assigned to "family" appear. The test note "Tell nurse x" was assigned to "admin", so it's correctly filtered out by the current logic — but the family should see **all** notes, not just family-assigned ones.

**Fix**: Remove the `filterAssignee="family"` prop from the `OnboardingNotesCard` in `FamilyOnboardingChecklistPage.tsx` (line ~196). The family will see all notes regardless of assignee, giving them full visibility into action items from the onboarding call.

| File | Change |
|------|--------|
| `src/pages/family/FamilyOnboardingChecklistPage.tsx` | Remove `filterAssignee="family"` from `OnboardingNotesCard` |

### 2. Add "Rates, Care Changes & Escalation" section

Add the new section to `onboardingSections.ts` between `caregiver_matching` (index 8) and `next_steps` (index 9), with the `DollarSign` icon. Add the icon mapping to all three pages' `ICON_MAP`.

**10 checklist items** as specified in the approved plan (rate tiers, holiday rates, overtime, change orders, escalation triggers, dietary changes, medication changes, errands, baseline documentation, family notification).

| File | Change |
|------|--------|
| `src/components/admin/onboarding/onboardingSections.ts` | Insert `rates_and_changes` section object at index 9 |
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Add `DollarSign` to import and `ICON_MAP` |
| `src/pages/family/FamilyOnboardingChecklistPage.tsx` | Add `DollarSign` to import and `ICON_MAP` |
| `src/pages/public/OnboardingGuidePage.tsx` | Add `DollarSign` to import and `ICON_MAP` |

No database changes required for either fix.

