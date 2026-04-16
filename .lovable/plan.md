

# Plan: Add Care Environment Support as New Journey Stage on Family Dashboard

## Summary
Add "Care Environment Readiness" as a new journey stage in the family dashboard progress tracker, positioned after Care Coordination (scheduling) and before Trial Experience. This stage surfaces the 3-tier care environment service (Assessment $199, Guided Reset $499, Full Reset custom) with clear mandatory vs optional framing.

## What Changes

### 1. Add new journey steps to `useSharedFamilyJourneyData.ts`
Insert 2 new steps (IDs 12-13, shifting existing trial/conversion IDs to 14-17) under a new `care_environment` category:
- **Step 12**: "Care Readiness Assessment" — Mandatory when flagged by caregiver. Description: home walkthrough completed by your care team during their first week. Links to care environment info/action.
- **Step 13**: "Home Environment Optimization" — Optional unless health/safety concern flagged. Description: guided or full reset coordination. Links to care environment service options.

### 2. Add new journey steps to `useEnhancedJourneyProgress.ts`
Mirror the same 2 steps in the mock anonymous steps and the real step generation logic, with `category: 'care_environment'`.

### 3. Add `care_environment` stage to `EnhancedFamilyNextStepsPanel.tsx`
In `groupStepsByStage()`, add a new stage between `scheduling` and `trial`:
```
care_environment: {
  name: "Care Environment Readiness",
  key: "care_environment_stage",
  description: "Preparing your home for sustainable, safe caregiving",
  color: "emerald",
  steps: steps.filter(step => step.category === 'care_environment'),
  subscriptionCTA: null
}
```

Update `stagesToDisplay` to include this new stage.

### 4. Update `useUserJourneyProgress.ts`
Add link mappings for the new step IDs pointing to `/family/care-management` or a future care environment page.

### 5. Create `CareEnvironmentJourneyStepContent.tsx`
A small component rendered inside the journey step when expanded, showing:
- The 3 tiers (Assessment $199, Guided Reset $499, Full Reset custom)
- "Mandatory" badge when caregiver flags health/safety concern
- "Recommended" badge otherwise
- CTA to message care coordinator or view details
- Dignity-centered copy (not cleaning — readiness, transition, workflow)

### 6. Update step completion logic
In `useSharedFamilyJourneyData.ts`, check for care environment service selections in `care_plan_service_selections` with `service_category = 'care_environment_support'` to auto-mark steps as completed.

### 7. Professional dashboard consideration
No changes needed — the professional doesn't track the family's home readiness journey. The caregiver's role is to flag observations through daily care logs, which the admin then acts on.

## Files Modified
| File | Change |
|------|--------|
| `src/hooks/useSharedFamilyJourneyData.ts` | Add 2 care_environment steps, shift IDs, add completion logic |
| `src/hooks/useEnhancedJourneyProgress.ts` | Add care_environment steps to mock data and real step generation |
| `src/components/family/EnhancedFamilyNextStepsPanel.tsx` | Add care_environment stage group, include in display |
| `src/hooks/useUserJourneyProgress.ts` | Add link mappings for new step IDs |
| `src/components/family/CareEnvironmentJourneyStepContent.tsx` | **New** — tier display component for the journey step |
| `mem://journey/family-journey-architecture-v3` | Update to reflect 17-step journey with care environment stage |

