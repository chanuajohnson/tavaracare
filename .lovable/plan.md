

## Audit Summary: Care Environment Alignment Across Surfaces

I checked four surfaces against the new 17-step journey + Care Environment Readiness stage:

| Surface | File | Status |
|---|---|---|
| **Family Dashboard** (`useEnhancedJourneyProgress`, `useSharedFamilyJourneyData`) | Steps 12 (Care Readiness Assessment) + 13 (Home Environment Optimization), `care_environment` category & stage transitions | ✅ Up to date |
| **Family Admin Onboarding Checklist** | `onboardingSections.ts` has `care_environment` block, `CareEnvironmentIntroCard` with supplies + 3 tiers | ✅ Up to date |
| **Professional Admin Onboarding Checklist** | `professionalOnboardingSections.ts` has `care_environment_awareness` section | ✅ Up to date (just added) |
| **Professional Dashboard Journey** (`src/hooks/professional/stepDefinitions.ts` → `EnhancedProfessionalNextStepsPanel`) | Still 8-step journey, **NO awareness step** about family home readiness / their role in flagging | ❌ Gap |
| **TAV Assistant** (`TavaraAssistantPanel.tsx` line 120) | Hardcoded `totalSteps: steps?.length \|\| 15` fallback — should be **17** | ❌ Stale fallback |
| **Admin User Card Journey Tracking** (`src/hooks/admin/journey/stepDefinitions.ts`) | Hardcoded 15 step titles, categories `foundation/scheduling/care_coordination/trial/conversion` — **missing `care_environment` category, missing steps 12-13, only tracks 15 instead of 17** | ❌ Major gap |
| **Admin Journey Tracking Loop** (`useAdminJourneyTracking.ts` line 24, 32) | Iterates `for (let i = 1; i <= 15; i++)` — caps at 15 | ❌ Stale cap |
| **Admin User Progress Calculator** (`userProgressCalculator.ts`) | Computes step completion only up to step 15 — **no logic for steps 12-13 (care env), and step numbering is misaligned with family journey v3** | ❌ Major gap |

## Plan: Bring Pro Dashboard, TAV, and Admin Cards to 17-Step Parity

### 1. Professional Dashboard Journey — add Care Environment Awareness step
**File**: `src/hooks/professional/stepDefinitions.ts`

Insert a new step (id 7, between "Head nurse screening" and current "Match with Tavara Families") OR append as new step 9, titled **"Care Environment Awareness"** with description tying to the family's home readiness process. Update `getButtonText` switch and `EnhancedProfessionalNextStepsPanel` step count.

Since the prof journey is more linear, **append as Step 9** ("Care Environment Awareness") with link to a read-only briefing (or to the professionalOnboardingSections care_environment_awareness anchor). Auto-completes once professional has acknowledged via a simple flag (or manually by admin).

### 2. TAV Assistant — fix stale step count fallback
**File**: `src/components/tav/TavaraAssistantPanel.tsx` (line 120)
- Change fallback `15` → `17` so TAV shows correct progress when steps array is empty
- Verify TAV's `useFamilyProgress` reads from `useEnhancedJourneyProgress` (already does per audit)

### 3. Admin User Card Journey Tracking — sync to 17 steps
**File**: `src/hooks/admin/journey/stepDefinitions.ts`
- Replace `STEP_TITLES` (15 items) with the canonical 17 from `useEnhancedJourneyProgress.ts`:
  1-6 Foundation, 7-8 Scheduling, 9-11 Care Coordination, **12-13 Care Environment**, 14-16 Trial, 17 Conversion
- Replace `STEP_CATEGORIES` to include `'care_environment'` for indices 12-13
- Update category union type

**File**: `src/hooks/admin/journey/types.ts` — extend category union with `'care_environment'`

**File**: `src/hooks/admin/useAdminJourneyTracking.ts` (lines 24, 32)
- Change `for (let i = 1; i <= 15; i++)` → `i <= 17` in both the init loop and the user step completion loop

**File**: `src/hooks/admin/journey/userProgressCalculator.ts`
- Re-map step completion logic to match the canonical 17-step order
- Add care environment step checks:
  - Step 12 (Care Readiness Assessment): completes when care plan exists + assigned caregiver (mirrors `useSharedFamilyJourneyData.ts` lines 371-372 logic)
  - Step 13 (Home Environment Optimization): completes when family has a row in `care_plan_service_selections` with category `care_environment_support`
- Shift trial/conversion step numbering accordingly (was 12-15, becomes 14-17)

### 4. Update memory
**File**: `mem://journey/family-journey-architecture-v3` — add note that admin tracking, TAV, and pro dashboard now mirror the 17-step structure

## Files Modified
| File | Change |
|---|---|
| `src/hooks/professional/stepDefinitions.ts` | Append Step 9 "Care Environment Awareness" |
| `src/hooks/professional/types.ts` (if needed) | Extend types |
| `src/hooks/professional/completionCheckers.ts` | Add checker for the new step |
| `src/components/tav/TavaraAssistantPanel.tsx` | 15 → 17 fallback |
| `src/hooks/admin/journey/stepDefinitions.ts` | 15 → 17 titles + categories with care_environment |
| `src/hooks/admin/journey/types.ts` | Add `care_environment` to category union |
| `src/hooks/admin/useAdminJourneyTracking.ts` | Loop bounds 15 → 17 |
| `src/hooks/admin/journey/userProgressCalculator.ts` | Add steps 12-13 logic, shift 14-17 |
| `mem://journey/family-journey-architecture-v3` | Update reflecting cross-surface parity |

