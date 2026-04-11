

## Plan: Fix Care Coordination Journey + Admin Caregiver Assignment (COMPLETED)

### Changes Made

**1. Admin "Find & Assign Caregiver" — Family Selector Added**
- Added a "Select Family" dropdown to `UnifiedMatchingInterface.tsx` when no `familyUserId` prop is provided
- Loads all family profiles from the database so admin can pick which family to assign a caregiver to
- Fixed validation message: "Please select a family and a caregiver"

**2. Family Journey Steps Updated (9→15 steps)**
- Steps 1-8: Unchanged (foundation + scheduling)
- Step 9 (NEW): **Caregiver Assigned** — checks `caregiver_assignments` and `admin_match_interventions` for active assignments
- Step 10 (NEW): **Initial Family Meeting** — checks `onboarding_checklists` for `post_onboarding_1_date`
- Step 11 (NEW): **Care Begins** — checks `onboarding_checklists` for `post_onboarding_3_date`
- Steps 12-14: Trial steps (shifted from old 9-11)
- Step 15: Conversion (shifted from old 12)

**3. Family Quick Access Bar Updated**
- Added "View Care Team" button (green) when caregiver is assigned, linking to `/family/care-management`
- "Schedule Care" button now hidden when caregiver is already assigned
- All other buttons preserved as-is

### Files Modified

| File | Change |
|------|--------|
| `src/components/admin/UnifiedMatchingInterface.tsx` | Added family selector dropdown + fixed validation |
| `src/hooks/useSharedFamilyJourneyData.ts` | Added steps 9-11, shifted trial/conversion, query assignments + onboarding checklists |
| `src/hooks/useEnhancedJourneyProgress.ts` | Mirrored new steps in mock data + calculateSteps() |
| `src/components/family/FamilyShortcutMenuBar.tsx` | Added View Care Team button, hid Schedule Care when assigned |
