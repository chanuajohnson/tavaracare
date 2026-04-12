

## Plan: Fix Progress Counter Overcounting

### Problem

The "Overall Progress" counter shows **103/101** because:
1. Checked items are stored with keys like `family_terms_4`, `post_onboarding_3`, etc.
2. When items were recently removed (e.g., "3 business days" T&C item) or reordered, the old keys remain in the database
3. The counter uses `Object.values(checkedItems).filter(Boolean).length` which counts ALL truthy values — including orphaned keys from deleted items AND date strings stored in the same object (e.g., `post_onboarding_1_date: "2026-04-13"`)

### Fix

**Files**: `src/pages/admin/AdminOnboardingChecklistPage.tsx` and `src/pages/family/FamilyOnboardingChecklistPage.tsx`

Replace the naive count with a function that only counts keys matching current valid item definitions:

```typescript
// Instead of:
const familyTotalChecked = Object.values(familyCheckedItems).filter(Boolean).length;

// Use:
const familyTotalChecked = ONBOARDING_SECTION_DEFS.reduce((sum, section) => {
  return sum + section.items.filter((_, i) => !!familyCheckedItems[`${section.id}_${i}`]).length;
}, 0);
```

Same pattern for `profTotalChecked` and the family page's `totalChecked`.

This ensures only currently-defined item keys are counted, ignoring orphaned database entries and date fields.

### Files Modified

| File | Change |
|------|--------|
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Fix `familyTotalChecked` and `profTotalChecked` calculations |
| `src/pages/family/FamilyOnboardingChecklistPage.tsx` | Fix `totalChecked` calculation |

