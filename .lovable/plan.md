

## Fix: Add References Tab to Professional Profile Hub

### Problem

The `ProfessionalProfileHub` page at `/professional/profile` was refactored to use the `CarePlanTabs` component, which does not include a "References" tab. The old component in `src/components/professional/ProfessionalProfileHub.tsx` had it, but the current page version at `src/pages/professional/ProfessionalProfileHub.tsx` lost it during refactoring. When navigating to `/professional/profile?tab=references`, the tab param is ignored and no references UI appears.

### Fix

**File: `src/components/professional/profile/CarePlanTabs.tsx`**

1. Import `ProfessionalReferencesForm` from `@/components/professional/ProfessionalReferencesForm`
2. Import the `ClipboardList` icon from lucide-react
3. Add a "References" entry to the `adminTabs` array (alongside Documents, etc.) with value `"references"`, icon `ClipboardList`, label `"References"`
4. Add a `TabsContent` block for `value="references"` that renders `<ProfessionalReferencesForm />` inside a Card with title "Professional References" and description "Submit at least 2 professional references to proceed with matching"

This is a single-file change that restores the references tab within the existing tab system. The URL param `?tab=references` will work automatically since `ProfessionalProfileHub` already reads the `tab` search param and passes it to `CarePlanTabs` via `activeTab`.

