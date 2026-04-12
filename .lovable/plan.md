

## Plan: Add Professional Readiness Approval to Post-Onboarding Summary

### What
Add a digital approval/signature checkbox to the professional's onboarding checklist page, mirroring the `ServiceCommencementApproval` component already on the family side. This appears at the bottom of the "Post-Onboarding Summary" section.

### Single File Change

**File**: `src/pages/professional/ProfessionalOnboardingChecklistPage.tsx`

1. **Import** `Checkbox` from `@/components/ui/checkbox`
2. **Add** a `ProfessionalReadinessApproval` component (modeled on the family's `ServiceCommencementApproval`) that:
   - Shows an instructional blue info box explaining the digital approval
   - Contains a checkbox: *"I confirm I have reviewed my onboarding checklist and I am ready to commence care as planned"*
   - On check, persists `professional_approval_confirmed: true` and `professional_approval_date: <ISO timestamp>` to `onboarding_checklists.checked_items` via Supabase update using `.eq("professional_id", user.id)`
   - Once approved, replaces the checkbox with a green badge: "Approved — Digital signature recorded on [date]"
3. **Render** the component inside the `post_onboarding` section block (after the existing Care Summary header), alongside the existing rate tier and SOP rendering pattern:

```tsx
{section.id === "post_onboarding" && (
  <>
    <CareSummaryHeader checkedItems={checkedItems} />
    <ProfessionalReadinessApproval
      checkedItems={checkedItems}
      professionalId={user?.id}
      onApproved={(updated) => setCheckedItems(updated)}
    />
  </>
)}
```

### Files Modified

| File | Change |
|------|--------|
| `src/pages/professional/ProfessionalOnboardingChecklistPage.tsx` | Add `ProfessionalReadinessApproval` component with digital signature checkbox in post-onboarding section |

