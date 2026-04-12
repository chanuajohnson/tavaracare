

## Plan: Fix Journey Progress Page — Correct %, Stage Label, and Add Active Care Card

### Problems Identified

1. **Overall shows 50% despite all non-optional stages being 100%** — The header at line 296 displays `steps.filter(s => s.completed).length of steps.length` which counts ALL 15 steps (including 3 optional trial steps), showing "12 of 15" = ~80%. But the `completionPercentage` from the hook correctly excludes optional steps. The "50%" visible in screenshots suggests the stored `user_journey_progress` table value is stale and being used somewhere, or the `getStepsData` merge is picking up wrong values.

2. **Current stage shows "Trial"** — In `useSharedFamilyJourneyData.ts` line 418-419, when `schedulingSteps.length > 0` (which it is — 4 scheduling steps completed), the stage is set to `'trial'`. This is wrong for a family with active care. The stage should be `'conversion'` or better yet a new `'active'` stage.

3. **No "Care Plan Active" indicator** — After all stages complete, there's no final card showing the family that their care is active and operational.

### Changes

| File | Change |
|------|--------|
| **`src/hooks/useSharedFamilyJourneyData.ts`** (lines 410-424) | Fix `journeyStage` logic: if scheduling steps are ALL complete (4/4) AND conversion step is complete, set stage to `'active'`. If scheduling steps exist but conversion is incomplete, set to `'conversion'`. Current logic incorrectly jumps to `'trial'` when any scheduling step is complete. |
| **`src/hooks/useSharedFamilyJourneyData.ts`** (line 21, 27) | Add `'active'` to the `journeyStage` union type. |
| **`src/components/family/EnhancedFamilyNextStepsPanel.tsx`** (line 296) | Change step count display from `steps.length` to count only non-optional steps: `steps.filter(s => !s.is_optional).length` and `steps.filter(s => s.completed && !s.is_optional).length`. This ensures "12 of 12" instead of "12 of 15". |
| **`src/components/family/EnhancedFamilyNextStepsPanel.tsx`** (after line 363) | Add a new "Care Plan Active" card that renders when all non-optional stages are complete. This card shows a success state with links to care management, confirming the family's care is operational. |
| **`src/hooks/useEnhancedJourneyProgress.ts`** (line 858) | Update `currentStage` to use `stepsData.currentStage` (which comes from `sharedJourneyData.journeyStage`) instead of hardcoded `'foundation'`. |

### Updated Stage Logic

```text
Current (broken):
  trialSteps > 0 || care_model → 'conversion'
  schedulingSteps > 0 → 'trial'        ← WRONG for active families
  foundationSteps >= 4 → 'scheduling'

Fixed:
  allSchedulingComplete && conversionComplete → 'active'
  trialSteps > 0 || care_model → 'conversion'
  allSchedulingComplete → 'conversion'
  schedulingSteps > 0 → 'scheduling'
  foundationSteps >= 4 → 'scheduling'
  else → 'foundation'
```

### Active Care Card Design

A green-bordered card at the bottom of the journey page:
- Title: "Care Plan Active" with a green checkmark
- Description: "Your care team is set up and actively supporting your family"
- Links to: Care Management dashboard, Care Team view
- Only shows when all non-optional steps are complete

### Result

- Overall % will show 100% (12 of 12 non-optional steps) for families with active care
- Current stage will show "Active" instead of "Trial"
- A clear "Care Plan Active" card confirms the family's care status at the bottom of the journey

