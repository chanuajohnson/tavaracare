

## Plan: Make Checklist SOP Sections Collapsible

### Problem
The "Full Caregiver Daily Checklist (SOP Reference)" sections on the admin onboarding page are very long (especially with the new First Aid section), taking up excessive vertical space.

### Solution
Wrap each SOP section card in a collapsible component (using the existing Radix `Collapsible` from `src/components/ui/collapsible.tsx`). Each section title becomes a clickable trigger that expands/collapses its item list. All sections start **collapsed by default** to save space.

This applies to **both** the family and professional tabs on the admin onboarding checklist, as well as the professional's own onboarding checklist page — all three render the same `CHECKLIST_SECTIONS.map(...)` pattern.

### Changes

| File | Change |
|------|--------|
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Replace the static SOP section rendering (lines ~910-922) with `Collapsible` wrappers — title becomes a `CollapsibleTrigger` with a chevron icon, items go inside `CollapsibleContent`. Collapsed by default. |
| `src/pages/professional/ProfessionalOnboardingChecklistPage.tsx` | Same collapsible treatment for the SOP reference section (lines ~363-370). |

### UI Behavior
- Each section shows its title with a chevron arrow (right when collapsed, down when expanded)
- Clicking the title toggles the item list open/closed
- All sections start collapsed
- No changes to the interactive `DailyChecklist` or `ChecklistSectionCard` components (those are working checklists, not reference lists)

