

## Plan: Move "Get Started with Care" Out of Care Coordination + Verify Journey Progress Page

### Problem
Step 7 ("Get Started with Care") is categorized as `scheduling`, placing it inside the "Care Coordination" card. For families who already have caregivers assigned and care in operation, this completed step clutters the Care Coordination section with irrelevant information. The Care Coordination card should only contain steps that relate to the actual coordination phase (Confirm Visit, Caregiver Assigned, Initial Family Meeting, Care Begins).

### Solution
Move Step 7 from `scheduling` category to `foundation` category. This means:
- The Foundation card gains Step 7 (making it 7 of 7 steps)
- The Care Coordination card shows only Steps 8-11 (Confirm Visit, Caregiver Assigned, Initial Family Meeting, Care Begins)
- The `/family/care-journey-progress` page uses the same `EnhancedFamilyNextStepsPanel` component with `showAllSteps=true`, so it will automatically reflect this change

### Changes

| File | Change |
|------|--------|
| `src/hooks/useEnhancedJourneyProgress.ts` | **Line 670**: Change Step 7 category from `'scheduling'` to `'foundation'`. Also update in the anonymous mock steps at **line 48**. |
| `src/hooks/useSharedFamilyJourneyData.ts` | **Line ~85**: Change Step 7 category from `'scheduling'` to `'foundation'` |
| `src/hooks/useFamilyJourneyProgress.ts` | **Line ~114**: Change Step 7 category from `'scheduling'` to `'foundation'` |
| `src/hooks/useEnhancedJourneyProgress.ts` | Update the paths definition (~line 857-866) to include step 7 in the foundation path's step_ids |

### Result
- **Foundation card**: Shows Steps 1-7, including "Get Started with Care" as the final foundation step
- **Care Coordination card**: Shows only Steps 8-11 (Confirm Visit, Caregiver Assigned, Initial Family Meeting, Care Begins) — cleaner and more relevant
- **`/family/care-journey-progress`**: Automatically updated since it uses the same hook and component

### Verification
The `/family/care-journey-progress` page renders `<EnhancedFamilyNextStepsPanel showAllSteps={true} />`, which calls `useEnhancedJourneyProgress` — the same hook being updated. Both the dashboard summary and full journey page will be consistent.

