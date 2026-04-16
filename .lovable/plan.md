

# Plan: Reverse Note Order + Add Care Environment to Professional Checklist

## 1. Reverse notes to show newest first

**File**: `src/components/admin/onboarding/OnboardingNotesCard.tsx`

Currently `filteredNotes` renders in array order (oldest first). The fix:
- Create a reversed copy of `filteredNotes` for display: `const displayNotes = [...filteredNotes].reverse()`
- Update the `getRealIndex` helper to correctly map reversed display indices back to the original `notes` array index (critical for edit/delete/acknowledge operations)
- Render `displayNotes.map(...)` instead of `filteredNotes.map(...)`

This ensures newest notes appear at the top on both family and professional onboarding checklists.

## 2. Add Care Environment section to professional onboarding checklist

**File**: `src/components/admin/onboarding/professionalOnboardingSections.ts`

Add a new section (positioned after "Communication & Support", before "Next Steps & First Assignment") so professionals can see what the family is being guided through regarding home readiness:

```
{
  id: "care_environment_awareness",
  title: "Care Environment Readiness",
  iconName: "Leaf",
  description: "Understand the family's home readiness process and your role in supporting a safe, effective care environment",
  items: [
    "Understand the Care Readiness Assessment process (home walkthrough, workflow mapping)",
    "Awareness of family's supply checklist responsibilities (gloves, first aid, hygiene products, etc.)",
    "How to flag environmental concerns (hygiene hazards, safety risks, workflow blockers)",
    "Guided Home Reset process — what the family is coordinating (decluttering, hygiene, workspace setup)",
    "Ongoing care environment support — pest control, seasonal resets, vendor coordination",
    "How care environment observations feed back to the coordinator and family",
  ],
}
```

This mirrors the family-side "Preparing Your Home for Care" section but from the professional's perspective — what they need to know about the home readiness process and how to participate in it.

## Files Modified

| File | Change |
|------|--------|
| `src/components/admin/onboarding/OnboardingNotesCard.tsx` | Reverse display order of notes (newest first), fix index mapping |
| `src/components/admin/onboarding/professionalOnboardingSections.ts` | Add "Care Environment Readiness" section for professional awareness |

