

# Gap Analysis & Upgrade Plan: Journey Steps, Dashboards, Admin, and TAV

## Identified Gaps

After auditing the family dashboard journey, professional dashboard journey, admin journey panels, and TAV assistant, here are the key misalignments with the recent onboarding checklist upgrades:

### Gap 1: Family Journey — Missing Steps 9-11 in `useFamilyJourneyProgress` (Dashboard Hook)

The **dashboard-facing** hook (`useFamilyJourneyProgress.ts`) still uses a **12-step** model (steps 1-8 then trial 9-12). But the **shared data** hook (`useSharedFamilyJourneyData.ts`) uses the upgraded **15-step** model with the new steps 9 (Care Team Confirmed), 10 (Initial Family Meeting), 11 (Care Begins). The dashboard hook is out of sync — it has no awareness of caregiver assignments, introduction dates, or start dates from `onboarding_checklists`.

### Gap 2: Admin Journey Tracking — Outdated 12-Step Model

The admin aggregate journey tracker (`useAdminJourneyTracking.ts` + `stepDefinitions.ts`) uses the OLD **12 steps**: Profile → Care Assessment → Legacy Story → View Matches → Medication → Meal → Schedule Visit → Confirm Visit → Schedule Trial → Pay Trial → Begin Trial → Choose Path. It completely misses the new steps (Care Team Confirmed, Initial Family Meeting, Care Begins) and has no awareness of caregiver assignments or `onboarding_checklists` data.

### Gap 3: Admin `FamilyJourneyProgressPanel` — No Rate/Billing Context

The admin per-user `FamilyJourneyProgressPanel` shows journey steps but has no mention of the caregiver rate, weekly hours, billing summary, or compensation data that was just added to the onboarding checklist. When an admin views a family user's journey, there's no billing/rate context.

### Gap 4: Professional Dashboard Journey — No Post-Onboarding Compensation Visibility

The professional dashboard (`EnhancedProfessionalNextStepsPanel`) and `useEnhancedProfessionalProgress` show 8 steps (account → profile → availability → documents → references → screening → assignments → training). There is **no step or card** for "View Your Compensation" or "Rate Confirmed" after a caregiver is assigned to a family. The admin onboarding now shows compensation summaries, but the professional's own dashboard has no awareness of their agreed rate or earnings.

### Gap 5: TAV Assistant — No Awareness of Billing/Rate/Compensation Context

TAV uses `useEnhancedProfessionalProgress` and `useEnhancedJourneyProgress` for progress context. It has no awareness of:
- The family's agreed caregiver rate
- Weekly hours or shift selection
- Billing summary / projected costs
- Professional's compensation details
- Bank details or payment schedule

TAV's `ProgressContext` type only tracks `completionPercentage`, `currentStep`, `totalSteps`, `nextAction`, `journeyStage`, `careModel`, and `trialCompleted` — no financial context.

### Gap 6: `useFamilyJourneyProgress` Completion Calculation — Simpler Than `useSharedFamilyJourneyData`

The dashboard hook (`useFamilyJourneyProgress`) uses a simple `full_name` check for profile completion (step 1), while the shared hook uses the enhanced `calculateRegistrationCompletion` with required + enhanced field checks. This discrepancy means completion percentages can differ between the dashboard and admin views.

---

## Implementation Plan

### Phase 1: Align Family Dashboard Journey to 15-Step Model

**File: `src/hooks/useFamilyJourneyProgress.ts`**
- Replace the 12-step model with the 15-step model matching `useSharedFamilyJourneyData`
- Add steps 9 (Care Team Confirmed), 10 (Initial Family Meeting), 11 (Care Begins)
- Renumber trial steps to 12-14 and conversion to 15
- Add queries for `caregiver_assignments`, `admin_match_interventions`, and `onboarding_checklists` (for intro/start dates)
- Use `calculateRegistrationCompletion` for step 1 consistency
- Update `updateStepAccessibility`, `getButtonText`, `handleStepAction`, and `determineJourneyStage` accordingly

### Phase 2: Upgrade Admin Aggregate Journey Tracking to 15-Step Model

**Files:**
- `src/hooks/admin/journey/stepDefinitions.ts` — Update `STEP_TITLES` and `STEP_CATEGORIES` to 15 steps with new Care Coordination category
- `src/hooks/admin/journey/types.ts` — Add 'care_coordination' to category union type
- `src/hooks/admin/journey/userProgressCalculator.ts` — Add checks for caregiver assignments, intro date, and start date from `onboarding_checklists`
- `src/hooks/admin/useAdminJourneyTracking.ts` — Update step tracking to 15 entries

### Phase 3: Add Rate/Billing Context to Admin Journey Panel

**File: `src/components/admin/FamilyJourneyProgressPanel.tsx`**
- When a family has reached post-onboarding (step 9+), show a compact billing summary below the progress bar: agreed rate, weekly hours, projected weekly cost
- Pull this from `onboarding_checklists.checked_items["care_rate"]` for the family

### Phase 4: Add Compensation Step to Professional Dashboard

**File: `src/hooks/useEnhancedProfessionalProgress.ts`**
- After step 7 (Match with Families), add awareness of the linked family's `care_rate` from `onboarding_checklists`
- Add a "Compensation Confirmed" indicator when the rate is set
- Expose `agreedRate` and `weeklyHours` in the return data

**File: `src/components/professional/EnhancedProfessionalNextStepsPanel.tsx`**
- When a professional has active assignments AND a rate is set, show a compact compensation card: hourly rate, assigned shift, projected weekly earnings, payment schedule

### Phase 5: Upgrade TAV ProgressContext with Financial Awareness

**File: `src/components/tav/types.ts`**
- Add optional fields to `ProgressContext`: `agreedRate`, `weeklyHours`, `projectedWeeklyEarnings`, `paymentSchedule`

**File: `src/components/tav/TavaraAssistantPanel.tsx`**
- Populate the new financial fields from the enhanced hooks when building `ProgressContext`

**File: `src/components/tav/RoleBasedContent.tsx`**
- When professional has compensation data, surface it in the TAV panel alongside journey progress
- When family has billing data, TAV can reference their rate and weekly cost in context

**File: `src/components/tav/components/FamilyJourneyPreview.tsx` and `ProfessionalJourneyPreview.tsx`**
- Add a compact financial summary line when data is available (e.g., "Rate: $35/hr — 40 hrs/wk")

### Phase 6: Ensure DB Function Alignment

**File: DB function `calculate_and_update_journey_progress`**
- Already has 12-step family logic — needs migration to add steps 9-11 (care team confirmed, family meeting, care begins) matching the frontend 15-step model
- Check caregiver_assignments and onboarding_checklists for new step completion

---

## Files Modified (Summary)

1. `src/hooks/useFamilyJourneyProgress.ts` — 12→15 steps, add assignment/checklist queries
2. `src/hooks/admin/journey/stepDefinitions.ts` — 12→15 step titles/categories
3. `src/hooks/admin/journey/types.ts` — Add 'care_coordination' category
4. `src/hooks/admin/journey/userProgressCalculator.ts` — Add assignment/checklist checks
5. `src/hooks/admin/useAdminJourneyTracking.ts` — 15-step tracking
6. `src/components/admin/FamilyJourneyProgressPanel.tsx` — Add billing context
7. `src/hooks/useEnhancedProfessionalProgress.ts` — Add compensation awareness
8. `src/components/professional/EnhancedProfessionalNextStepsPanel.tsx` — Add compensation card
9. `src/components/tav/types.ts` — Extend ProgressContext
10. `src/components/tav/TavaraAssistantPanel.tsx` — Populate financial context
11. `src/components/tav/RoleBasedContent.tsx` — Surface financial data
12. `src/components/tav/components/FamilyJourneyPreview.tsx` — Add rate summary
13. `src/components/tav/components/ProfessionalJourneyPreview.tsx` — Add earnings summary
14. DB migration — Update `calculate_and_update_journey_progress` to 15 steps

