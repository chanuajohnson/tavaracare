

## Plan: Update Step 7 "Get Started with Care" Description Across All Journey Hooks

### Problem
Step 7 ("Get Started with Care") still shows the old trial-day pricing: *"Choose a Trial Day ($320 TTD) or Hire Immediately (from $40/hr)"*. This is inconsistent with the current subscription model ($199.99/week or $699.99/month). Additionally, for families who already have a caregiver assigned, this step's description is irrelevant.

### Changes

| File | Change |
|------|--------|
| `src/hooks/useEnhancedJourneyProgress.ts` | **Line 48**: Update default step 7 description. **Line 667**: Update computed step 7 description. For families with a caregiver assigned (step 9 complete), change description to "Your care team is set up and active". For others, update to subscription-aligned text: "Begin your care journey with a scheduled visit". |
| `src/hooks/useFamilyJourneyProgress.ts` | **Line 112**: Same description update for step 7 |
| `src/hooks/useSharedFamilyJourneyData.ts` | **Line 84**: Same description update for step 7 |

### Updated Description
- **Default (no caregiver yet)**: `"Begin your care journey with a scheduled visit from our care coordinators"`
- **Caregiver assigned (step 9 complete)**: Step 7 `completed` set to `true`, description changed to `"Your care team is set up and active"`

This removes all references to the old "$320 TTD" and "$40/hr" pricing from the journey steps, aligning with the subscription model.

