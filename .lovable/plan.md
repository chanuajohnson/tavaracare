

## Plan: Fix Care Coordination Journey + Admin Caregiver Assignment

### What's Broken & What Changes

There are **3 interconnected problems** to fix:

---

### 1. Admin "Find & Assign Caregiver" has no Family Selector

**Problem**: When opened from the admin dashboard, the `UnifiedMatchingInterface` receives no `familyUserId`. The admin can search caregivers and fill out the form, but clicking "Create Assignment" fails with "Please select a caregiver" (the real issue is no family is selected).

**Fix**: Add a **"Select Family"** dropdown at the top of `UnifiedMatchingInterface` when `familyUserId` is not provided as a prop. This dropdown loads all family profiles and lets the admin pick which family to assign the caregiver to. When a family is selected, match scores auto-calculate. The validation message will also be corrected to say "Please select a family and a caregiver."

---

### 2. Family Dashboard "Care Coordination" Stage is Outdated

**Problem**: The scheduling/care coordination stage in the journey panel only shows "Get Started with Care" and "Confirm Your Visit." For families like Ana Maria who already have a caregiver assigned and are past the visit stage, the journey doesn't reflect reality. There's no step for "Caregiver Assigned," "Initial Family Meeting," "Care Start Date," or a link to the care plan.

**Fix**: Replace the current scheduling steps (7-8) with a more accurate care coordination flow. The scheduling category steps become:

- **Step 7**: "Get Started with Care" (existing -- schedule visit) 
- **Step 8**: "Confirm Your Visit" (existing -- visit confirmed)
- **Step 9** (new, replaces old trial step): **"Caregiver Assigned"** -- checks `caregiver_assignments` or `manual_caregiver_assignments` table for an active assignment. Links to care team view.
- **Step 10** (new): **"Initial Family Meeting"** -- checks the family's onboarding checklist for `post_onboarding_1_date` (Introduction Date). Displays the date when set.
- **Step 11** (new): **"Care Begins"** -- checks for `post_onboarding_3_date` (Start Date) from onboarding checklist. Links to care plan.

The existing trial/conversion steps (9-12) shift to steps 12-15 to accommodate the new steps.

These new steps will be added to both `useSharedFamilyJourneyData.ts` and the fallback `calculateSteps()` in `useEnhancedJourneyProgress.ts`.

Data sources for new steps:
- Caregiver assignment: query `caregiver_assignments` + `manual_caregiver_assignments` for `family_user_id = userId`
- Meeting & start dates: query `family_onboarding_checklists` for `family_id = userId`, parse the JSON `checked_items` for date fields

---

### 3. Quick Access Bar "Schedule Care" Button Outdated

**Problem**: The `FamilyShortcutMenuBar` shows "Schedule Care" when matches exist but no visit is scheduled. For families past the visit stage with an assigned caregiver, this is misleading.

**Fix**: Update `FamilyShortcutMenuBar` to:
- Hide "Schedule Care" if a caregiver is already assigned
- Add a **"View Care Team"** button that links to the care plan's care team tab when an assignment exists
- Keep "Onboarding Progress" and "Care Plans" links as-is

---

### Files Modified

| File | Changes |
|------|---------|
| `src/components/admin/UnifiedMatchingInterface.tsx` | Add family selector dropdown when `familyUserId` prop is not provided; fix validation message |
| `src/hooks/useSharedFamilyJourneyData.ts` | Add steps 9-11 (Caregiver Assigned, Initial Meeting, Care Begins); shift trial/conversion steps; query assignment tables and onboarding checklists |
| `src/hooks/useEnhancedJourneyProgress.ts` | Mirror new steps in `calculateSteps()` and mock data; fetch caregiver assignments and onboarding dates |
| `src/components/family/FamilyShortcutMenuBar.tsx` | Add assignment-awareness; show "View Care Team" when caregiver assigned; hide "Schedule Care" when past that stage |

### Technical Details

- New Supabase queries in journey hooks: `caregiver_assignments` (where `family_user_id = userId, status = 'active'`), `manual_caregiver_assignments` (same), and `family_onboarding_checklists` (where `family_id = userId`) to parse `checked_items` JSON for date fields
- The `UnifiedMatchingInterface` family selector reuses the existing pattern of querying `profiles` where `role = 'family'`
- Step IDs are renumbered: foundation (1-6), scheduling (7-8), care coordination (9-11), trial (12-14), conversion (15)
- Actions for new steps: Step 9 navigates to `/family/care-management` (care team tab), Step 10 shows meeting date info, Step 11 navigates to `/family/care-management`

