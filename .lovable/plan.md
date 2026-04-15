

## Plan: Fix Missing `familyCarePlanId` Prop in Admin Onboarding Checklist

### Root Cause

The `familyCarePlanId` state variable is correctly fetched (line 1357, 1451-1464) and the `ChecklistTabContent` component correctly accepts and uses it (line 688, 718, 1041-1054). However, the prop is **never passed** when `ChecklistTabContent` is rendered for the family tab (lines 1797-1852).

This means `familyCarePlanId` inside `ChecklistTabContent` is always `undefined`, so:
- `ServiceSelectionBlock` never renders (line 1041 condition fails)
- The fallback "Service selection requires a linked care plan" message shows instead (line 1049)
- `BillingSummaryCard` and `ServiceCommencementConfirmation` in post-onboarding also never render (lines 1190, 1197)

### Fix

**File: `src/pages/admin/AdminOnboardingChecklistPage.tsx` (~line 1830)**

Add the missing prop to the `ChecklistTabContent` component for the family tab:

```tsx
familyCarePlanId={familyCarePlanId}
```

This single line addition connects the already-fetched care plan ID to the component that needs it. Ana Maria's active care plan (`3d634783-...`) will then be passed through, enabling all three service components to render.

### Result

For Ana Maria (and any family with an active/draft/pending care plan):
1. `ServiceSelectionBlock` will appear in Pre-Call, Care Plan Review, Medication, Meals, Caregiver Matching, and Rates sections
2. `BillingSummaryCard` will appear in Post-Onboarding Summary
3. `ServiceCommencementConfirmation` will appear in Post-Onboarding Summary

### Files Modified
1. `src/pages/admin/AdminOnboardingChecklistPage.tsx` — add `familyCarePlanId={familyCarePlanId}` prop to family tab's `ChecklistTabContent`

