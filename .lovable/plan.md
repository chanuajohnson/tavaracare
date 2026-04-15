

# Plan: Update Dashboard UI Components to Surface Financial Context + 15-Step Alignment

## What Changed (Backend/Hooks) vs What Didn't (UI)

The hooks (`useEnhancedJourneyProgress`, `useFamilyJourneyProgress`, `useEnhancedProfessionalProgress`) were upgraded to return `agreedRate`, `weeklyHours`, and `projectedWeeklyEarnings`. But **none of the dashboard UI components** consume or display this data. The family dashboard visually looks the same as before.

## Changes

### 1. `src/components/family/EnhancedFamilyNextStepsPanel.tsx` — Add Billing Context Card

- Destructure `agreedRate`, `weeklyHours` from `useEnhancedJourneyProgress()` (already returned, just not used)
- When `agreedRate` is set, render a compact **"Your Care Plan Summary"** card above the journey stages showing:
  - Agreed rate (e.g., "$35/hr — Standard")
  - Weekly hours and projected weekly cost
  - Subscription tier if applicable
- Add the new Care Coordination stage group (steps 9-11) to `groupStepsByStage()` — currently the stages map only has `foundation`, `scheduling`, `trial`, `conversion` but the hooks now return `care_coordination` steps that aren't grouped

### 2. `src/components/professional/EnhancedProfessionalNextStepsPanel.tsx` — Add Compensation Card

- Destructure `agreedRate`, `weeklyHours`, `projectedWeeklyEarnings` from `useEnhancedProfessionalProgress()` (already returned)
- When compensation data exists, show a green-themed **"Your Compensation"** card below the progress bar: hourly rate, weekly hours, projected earnings, payment schedule ("Weekly, every Friday")

### 3. `src/components/tav/components/FamilyJourneyPreview.tsx` — Add Rate Summary Line

- Access `agreedRate` and `weeklyHours` from the existing `journeyProgress` object (already available via `useEnhancedJourneyProgress`)
- When set, add a compact line below the progress bar: "Rate: $35/hr — 40 hrs/wk"
- Update the step preview from `slice(0, 7)` to show key milestones across all 15 steps (show first 7 foundation + highlight current stage)

### 4. `src/components/tav/components/ProfessionalJourneyPreview.tsx` — Add Earnings Summary Line

- Destructure `agreedRate`, `projectedWeeklyEarnings` from `useEnhancedProfessionalProgress()` (already returned)
- When set, add a compact earnings line: "Earnings: $35/hr — ~$1,400/wk"

### 5. `src/components/family/FamilyNextStepsPanel.tsx` — Align to 15 Steps

- Currently shows `steps.slice(0, 7)` — update to show steps grouped by stage category with the new care_coordination steps visible
- Add `step_number` property access (the `useFamilyJourneyProgress` hook returns steps with `id` matching step number)

### 6. `src/components/family/FamilyDashboard.tsx` — Update Rate Info Card

- The existing "Tavara Care Rates" collapsible card (line 130) shows hardcoded $40–$50+/hr range
- When the user has an `agreedRate` from their journey, show their **actual agreed rate** prominently instead of the generic range
- Minor: no structural changes, just conditionally show personalized rate

## Files Modified

1. `src/components/family/EnhancedFamilyNextStepsPanel.tsx` — Add billing summary card + care_coordination stage group
2. `src/components/professional/EnhancedProfessionalNextStepsPanel.tsx` — Add compensation card
3. `src/components/tav/components/FamilyJourneyPreview.tsx` — Add rate summary line
4. `src/components/tav/components/ProfessionalJourneyPreview.tsx` — Add earnings summary line
5. `src/components/family/FamilyNextStepsPanel.tsx` — Align step display to 15-step model
6. `src/components/family/FamilyDashboard.tsx` — Personalize rate info card when agreed rate exists

