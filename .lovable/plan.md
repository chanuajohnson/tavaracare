

## Plan: Fix Journey Completion Percentages and Stage Accuracy

### Problems Identified

1. **Overall completion % counts all 15 steps equally** — Optional trial steps (12-14) dilute the percentage, making a family with active care appear less complete than they are
2. **Care Coordination shows wrong count** — For this family, visit is confirmed (step 8), caregiver assigned (step 9), but steps 10 and 11 may not be marked complete even though care is active. The stage should reflect actual state (e.g., 4 of 4 if care has begun)
3. **"Care Services" (conversion) stage is unclear** — Step 15 ("Rate & Choose Your Path") checks `visitNotes?.care_model` but this family already has a care model. This step's completion logic may not detect that correctly
4. **The overall header % is misleading** — It calculates `completedSteps / totalSteps` including optional trial steps, so a family with full active care can never hit 100% without doing the trial

### Solution

**Exclude optional steps from the overall completion percentage** and fix step completion logic for families with active care.

### Changes

| File | Change |
|------|--------|
| `src/hooks/useEnhancedJourneyProgress.ts` | **Lines 820-832**: Change `completedSteps` and `totalSteps` calculations to exclude steps where `is_optional === true`. The per-stage cards already calculate their own %, so this only affects the overall header display. |
| `src/hooks/useSharedFamilyJourneyData.ts` | **Lines 437-438**: Same fix — exclude optional steps from overall `completionPercentage` calculation. |
| `src/hooks/useEnhancedJourneyProgress.ts` | **Step 11 (Care Begins, line 735)**: Check if care plan exists with active assignments (`carePlans.length > 0` with active status) to mark as completed, not just rely on `sharedJourneyData`. |
| `src/hooks/useSharedFamilyJourneyData.ts` | **Step 11 completion check**: Add logic to mark "Care Begins" as complete when there are active care assignments (query `care_team_members` for active status). |
| `src/hooks/useEnhancedJourneyProgress.ts` | **Step 15 (line 802)**: Broaden the completion check — if a family has active care (step 11 complete), mark step 15 as complete since they've effectively chosen their care path. |

### Per-Stage Expected Results (for this family)

- **Foundation**: 7 of 7 (100%) — unchanged, correct
- **Care Coordination**: 4 of 4 (100%) — steps 8-11 all marked complete since care is active
- **Trial Experience**: 0 of 3 (0%) — optional, clearly labeled, does NOT affect overall %
- **Care Services**: 1 of 1 (100%) — step 15 marked complete since care model is in operation

### Overall % Calculation Change

```text
Before: completedSteps / 15 total steps (includes 3 optional trial steps)
After:  completedSteps (non-optional) / 12 non-optional steps
```

For this family: 12 of 12 non-optional steps completed = 100%

### Technical Detail

The `JourneyStageCard` component already calculates per-stage percentages independently from its own `steps` array (line 78-80), so no changes needed there. The fix is in the hooks that calculate the overall header percentage and step completion states.

