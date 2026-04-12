

## Plan: Add Instructional Guidance to Service Commencement Approval Card

### What
Add a friendly instructional banner above the approval checkbox in the `ServiceCommencementApproval` component so the client clearly understands the purpose and action required.

### Change

**File**: `src/pages/family/FamilyOnboardingChecklistPage.tsx`

In the `ServiceCommencementApproval` component (around line 117), add an instructional note between the heading and the start date line:

```
💙 At the bottom of your checklist, you'll find this Service Commencement Approval.
Checking the box below acts as your digital approval for us to commence care
starting Monday, April 13th. This confirms the first billable week (April 13–17, 2026)
as outlined in your quotation.
```

This renders as a styled info paragraph (blue-toned, similar to the Care Summary style) only when the approval has NOT yet been given. Once approved, the green confirmation badge replaces it as it does today.

### Files Modified

| File | Change |
|------|--------|
| `src/pages/family/FamilyOnboardingChecklistPage.tsx` | Add instructional guidance text to `ServiceCommencementApproval` card |

