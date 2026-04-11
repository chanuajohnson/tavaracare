## Plan: Add Post-Onboarding Summary Card

Create a new "Post-Onboarding Summary" card that appears after the Communication & Notifications section on both the admin and family-facing onboarding pages. This card contains structured, checkable items summarizing what was completed and next actions -- distinct from the free-form "Notes & Action Items" section.

### What the Card Contains

A structured checklist with these items (admin can check them off, family sees read-only status):

1. Onboarding completed successfully -- welcome to Tavara.Care!
2. Assigned nurse confirmed and to be introduced to family
3. First meeting: Tavara coordinator, assigned nurse, and family at client residence (date/time set in billing config)
4. Assigned nurse commences work at client residence (placeholder here for start date that is to be confirmed and not to be altered once started, this is to be used for  billing config start date for first billing quote/ etc/payment when generated)
5. Assigned nurse is paid weekly by Tavara
6. Tavara subscription: Family Care Plan (weekly) -- [link to /subscription]
7. NIS (National Insurance) contributions covered by Tavara for assigned nurse
8. View your care plan and team -- [link to /family/care-management]
9. View your onboarding progress -- [link to /family/onboarding-checklist]
10. Generate your first quote -- [link to care plan Documents tab]
11. Or Generate your first invoice only clickable when quote  is done -- [link to care plan Documents tab]
12. and Generate your first receipt only clickable when quote and invoice are done -- [link to care plan Documents tab]

### Files Changed


| File                                                    | Action                                                                                                                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/admin/onboarding/onboardingSections.ts` | Add new `post_onboarding` section at the end of `ONBOARDING_SECTION_DEFS`                                                                                           |
| `src/pages/family/FamilyOnboardingChecklistPage.tsx`    | Render items in the `post_onboarding` section as clickable links where applicable (subscription page, care management, documents tab)                               |
| `src/pages/admin/AdminOnboardingChecklistPage.tsx`      | No structural change needed -- the `ChecklistTabContent` loop already renders all sections from `ONBOARDING_SECTION_DEFS`, so the new section appears automatically |


### Technical Details

- The new section uses `id: "post_onboarding"` and `iconName: "CheckCircle2"` (or `"CalendarCheck"`)
- Items with links will be rendered as anchor tags on the family-facing page by detecting link syntax in the item text (e.g., items containing `[link:/path]` suffix)
- Add a `links` optional field to `OnboardingSectionDef` interface: `links?: Record<number, string>` mapping item index to URL
- On the family page, when a link exists for an item index, render the item text as a clickable link
- Data is stored in the same `checked_items` JSONB field using keys like `post_onboarding_0`, `post_onboarding_1`, etc.
- No migration needed -- uses existing `onboarding_checklists` table