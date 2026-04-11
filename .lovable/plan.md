

## Plan: Add Date Fields and Links to Post-Onboarding Section

### Problem Analysis

1. **No date inputs on admin side**: Items 1-3 in post_onboarding ("Assigned nurse confirmed...", "First meeting...", "Assigned nurse commences work...") need date/time pickers so admin can record when these happen. Currently they're just checkboxes with text.

2. **Links not rendering on admin side**: The `links` property IS defined in `onboardingSections.ts` (indices 5, 7, 8, 9, 10, 11) but the admin checklist page (`AdminOnboardingChecklistPage.tsx` lines 226-241) only renders checkboxes + plain text -- it never reads `section.links`. The family page does render links, but only for items that have them.

3. **Subscription link exists but may not show**: Link for index 5 (`/subscription`) is already defined in the section definition. It should render on the family page. Need to verify family page rendering handles it.

### Changes

**1. `src/components/admin/onboarding/onboardingSections.ts`**
- Add `dateFields?: Record<number, string>` to `OnboardingSectionDef` interface -- maps item index to a label for the date field
- Add `dateFields` to the `post_onboarding` section for indices 1, 2, 3:
  - Index 1: "Introduction Date"
  - Index 2: "Meeting Date & Time" 
  - Index 3: "Start Date"

**2. `src/pages/admin/AdminOnboardingChecklistPage.tsx`**
- In the item rendering loop (lines 226-241), detect if the current section has `dateFields[i]`
- If so, render a date picker (using Popover + Calendar from shadcn) next to the checkbox + text
- Store selected dates in `checkedItems` JSONB as `post_onboarding_1_date`, `post_onboarding_2_date`, `post_onboarding_3_date`
- Also render links from `section.links` as clickable anchors (like the family page does) so admin can quickly navigate

**3. `src/pages/family/FamilyOnboardingChecklistPage.tsx`**
- Already renders links -- verify indices 5, 7, 8, 9, 10, 11 all work
- Display the stored dates next to items 1-3 as read-only badges (e.g., "Apr 14, 2026" next to "First meeting...")
- This gives the family visibility into scheduled dates

### Data Storage

Dates stored in existing `onboarding_checklists.checked_items` JSONB:
```json
{
  "post_onboarding_1_date": "2026-04-11",
  "post_onboarding_2_date": "2026-04-11T15:00",
  "post_onboarding_3_date": "2026-04-13"
}
```
No migration needed.

### Files Changed

| File | Action |
|------|--------|
| `src/components/admin/onboarding/onboardingSections.ts` | Add `dateFields` to interface and `post_onboarding` section |
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Add date pickers for flagged items + render links from section definition |
| `src/pages/family/FamilyOnboardingChecklistPage.tsx` | Show stored dates as read-only badges next to relevant items |

