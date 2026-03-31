

## Professional Vetting Pipeline — Implementation Status (All 21 Touchpoints)

### COMPLETED (18 of 21)

| # | File | Status | Details |
|---|------|--------|---------|
| 1 | **Migration SQL** | Done | `professional_references`, `professional_screening` tables created. `onboarding_stage` and `screening_cleared` added to `profiles`. RLS policies applied. `calculate_and_update_journey_progress` updated to 8 steps. |
| 2 | **`stepDefinitions.ts`** | Done | 8 steps defined with steps 5 (references) and 6 (screening) inserted. `getButtonText` handles all 8 step IDs. |
| 3 | **`completionCheckers.ts`** | Done | `hasRequiredReferences()` and `hasPassedScreening()` added. `checkStepAccessibility` gates step 7 on all 6 prior steps. |
| 4 | **`types.ts`** | Done | `ProfessionalReference` and `ProfessionalScreening` interfaces added. |
| 5 | **`useEnhancedProfessionalProgress.ts`** | Done | 8-step `baseSteps` array, `vetting` stage added, `getButtonText` handles steps 5-8. |
| 6 | **`useProfessionalProgress.ts`** | Done | Inline step array updated to 8 steps with references/screening entries. |
| 7 | **`useSpecificUserProfessionalProgress.ts`** | Done | Switch/case handles steps 5 (`hasRequiredReferences`), 6 (`hasPassedScreening`), 7 and 8 renumbered. Fetches references and screenings. |
| 8 | **`EnhancedProfessionalNextStepsPanel.tsx`** | Done | Imports `Users` and `Shield` icons. `sourceMap` present (though missing entries for "Add References" and "Awaiting Interview" — minor). |
| 10 | **`ProfessionalJourneyPreview.tsx`** | Done | `getStageIcon` and `getStageColor` both handle `vetting` stage. |
| 11 | **`ProfessionalJourneyStageCard.tsx`** | Done | `getStageIcon` handles `vetting` (uses `FileCheck`). |
| 12 | **DB function `calculate_and_update_journey_progress`** | Done | Updated in migration to 8 steps with references (step 5) and screening (step 6) checks. |
| 13 | **`useStoredJourneyProgress.ts`** | Done | Fallback `totalSteps` is `8` (line 113). |
| 14 | **`ProfessionalRegistration.tsx`** | Done | No code change needed — RPC is parameterized. |
| 15 | **`UserDetailModal.tsx`** | Done | Auto-reflects 8 steps via consumed hooks. |
| 16 | **`AdminDashboard.tsx`** | Done | "Caregiver Screening" button added, navigates to `/admin/caregiver-screening`. |
| 17 | **`ProfessionalReferencesForm.tsx`** | Done | Created — form for submitting references with status badges. |
| 18 | **`ProfessionalScreeningPanel.tsx`** | Done | Created — admin panel for scheduling interviews, recording outcomes, verifying references. |
| 21 | **`ProfessionalProfileHub.tsx`** | Done | "References" tab added using `ProfessionalReferencesForm`. |

---

### NOT YET COMPLETED (3 of 21)

| # | File | Status | What's Missing |
|---|------|--------|----------------|
| 9 | **`ProfessionalReadinessModal.tsx`** | Not updated | Still only checks 4 items (profile, ID, certificate, background check). Does NOT check references or screening status. Needs `fetchReferences`, `fetchScreenings` calls and 2 new readiness check entries. |
| 19 | **`ProfessionalScreeningPage.tsx`** | Created | File exists but has NO route — it's unreachable. |
| 20 | **`AppRoutes.tsx` (route)** | Not added | Route `/admin/caregiver-screening` → `ProfessionalScreeningPage` is missing. AdminDashboard links to it, but clicking will 404. **Requires your approval per guardrail.** |

---

### Plan to Complete the 3 Remaining Items

**1. Update `ProfessionalReadinessModal.tsx`**
- Import `fetchReferences` and `fetchScreenings` from dataFetchers
- Import `hasRequiredReferences` and `hasPassedScreening` from completionCheckers
- Add `hasReferences` and `hasScreeningPassed` to `readinessChecks` state
- Fetch and check references + screening in `checkStatus()`
- Add 2 new checklist items in the modal UI (References and Screening)
- Update `allReady` to include the new checks

**2. Add route in `AppRoutes.tsx`**
- Add `<Route path="/admin/caregiver-screening" element={<ProfessionalScreeningPage />} />`
- Place it alongside existing admin routes
- **This requires your explicit approval per project guardrail**

**3. Minor: Add sourceMap entries in `EnhancedProfessionalNextStepsPanel.tsx`**
- Add `'Add References': 'professional_step_references'` and `'Awaiting Interview': 'professional_step_screening'` to the anonymous user sourceMap

