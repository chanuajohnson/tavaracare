

## Plan: Fix Family Dashboard Quick Access + Care Coordination UX

### Issues Identified

1. **"View Care Team" button is redundant** — The "Care Plans" button already links to `/family/care-management`, same destination. Remove it.

2. **"Get Started with Care" step shown even when caregiver is already assigned** — This step (step 7) should be visually de-emphasized or hidden once the caregiver is assigned (step 9 completed), since the family has progressed past that point. However, the step is part of the journey timeline and removing it entirely would break the step count. Instead, the user's screenshot shows it in the Care Coordination stage card — the issue is that it still shows "View Care Giver Matches" as the action text even though a caregiver is already assigned. We should update the button text and behavior for step 7 when a caregiver is assigned.

3. **"Initial Family Meeting" Complete button goes nowhere** — Step 10's action navigates to `/family/care-management`, but clicking "Complete" doesn't actually mark it complete. Completion is determined by `introductionDate` which comes from `familyChecklist.checked_items.post_onboarding_1_date` in the admin checklist. The family user has no way to mark this themselves — it must be done via the admin onboarding checklist. The "Complete" button text is misleading. We need to either:
   - Change the button text to something like "Pending Admin Confirmation" or "View Details" 
   - Or allow the family to mark the meeting as done (with admin override)

### Proposed Changes

| File | Change |
|------|--------|
| `src/components/family/FamilyShortcutMenuBar.tsx` | Remove the "View Care Team" button (lines 78-93). The "Care Plans" button at line 151 already links to the same `/family/care-management` route. |
| `src/components/family/JourneyStageCard.tsx` | Update `getButtonText()` for step 7: when caregiver is assigned (step 9 completed), show "Caregiver Assigned" instead of "View Care Giver Matches". Update step 10: change "Complete" to "Awaiting Confirmation" when not completed, since the family cannot self-complete this step — it requires admin to set the introduction date via the onboarding checklist. |
| `src/hooks/useEnhancedJourneyProgress.ts` | For step 10 action, instead of silently navigating to care management, show a toast explaining "This step is confirmed by your care coordinator after the initial meeting." |

### What the family user will experience after these changes

- **Quick Access bar**: No more duplicate "View Care Team" button — the "Care Plans" shortcut covers that link
- **Care Coordination section**: Step 7 ("Get Started with Care") shows "Caregiver Assigned" text when applicable instead of prompting them to view matches they've already moved past
- **Initial Family Meeting**: Button says "Awaiting Confirmation" with a toast explaining it's confirmed by the care coordinator, so the family doesn't feel stuck clicking a button that does nothing

