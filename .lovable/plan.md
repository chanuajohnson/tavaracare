

## Professional Vetting Pipeline — Full File Audit

### Every file that needs changes to add Steps 5 (References) and 6 (Screening), renumber existing steps 5→7 and 6→8, and wire up the new tables.

---

### Database (1 migration)

| # | File | What changes |
|---|------|-------------|
| 1 | **New migration SQL** | Create `professional_references` table, `professional_screening` table. Add `onboarding_stage` and `screening_cleared` columns to `profiles`. RLS policies for both new tables. |

---

### Core step definitions & completion logic (3 files)

| # | File | What changes |
|---|------|-------------|
| 2 | **`src/hooks/professional/stepDefinitions.ts`** | Insert step 5 "Submit 2 Professional References" and step 6 "Head Nurse Screening Interview" into `baseSteps`. Renumber old steps 5→7, 6→8. Update `getButtonText` for the two new step IDs. |
| 3 | **`src/hooks/professional/completionCheckers.ts`** | Add `hasRequiredReferences()` (queries `professional_references` for 2+ rows) and `hasPassedScreening()` (queries `professional_screening` for a passed head_nurse_interview). Update `checkStepAccessibility` so step 7 (matching) requires references + screening cleared. |
| 4 | **`src/hooks/professional/types.ts`** | Add `ProfessionalReference` and `ProfessionalScreening` interfaces. No step count change needed since `ProfessionalStep` is generic. |

---

### Hooks that define or consume step lists (3 files — each has its OWN hardcoded 6-step list)

| # | File | What changes |
|---|------|-------------|
| 5 | **`src/hooks/useEnhancedProfessionalProgress.ts`** | Update the inline `baseSteps` array (lines 173-230) to 8 steps. Add new stage `"vetting"` to stages array. Update `getButtonText`, completion logic for steps 5-6, and renumber steps 7-8. |
| 6 | **`src/components/tav/hooks/useProfessionalProgress.ts`** | Update inline step array (lines 47-108) from 6 to 8 steps. Update completion checking logic for each step ID. |
| 7 | **`src/hooks/useSpecificUserProfessionalProgress.ts`** | Uses `baseSteps` from stepDefinitions (will auto-pick up new steps), but completion switch/case logic needs new cases for steps 5 and 6, and renumbered cases for 7 and 8. |

---

### UI components that render steps (4 files)

| # | File | What changes |
|---|------|-------------|
| 8 | **`src/components/professional/EnhancedProfessionalNextStepsPanel.tsx`** | Add icons for new steps (e.g., `Users` for references, `Shield` for screening). Update `sourceMap` in `handleAnonymousStepClick`. May need to render the new "vetting" stage card. |
| 9 | **`src/components/professional/ProfessionalReadinessModal.tsx`** | Add readiness checks for references and screening status. Add action buttons to navigate to references form / show screening status. |
| 10 | **`src/components/tav/components/ProfessionalJourneyPreview.tsx`** | Consumes `useEnhancedProfessionalProgress` — will auto-reflect new steps, but stage icon mapping needs a case for the new `"vetting"` stage. |
| 11 | **`src/components/professional/ProfessionalJourneyStageCard.tsx`** | May need color/icon support for the new "vetting" stage if it uses a stage-to-color map. |

---

### Database function (1 RPC)

| # | File | What changes |
|---|------|-------------|
| 12 | **DB function `calculate_and_update_journey_progress`** | Change `professional_total_steps` from 6 to 8. Add step 5 (references count ≥ 2) and step 6 (screening passed) checks. Renumber steps 7-8. |

---

### Stored progress consumer (1 file)

| # | File | What changes |
|---|------|-------------|
| 13 | **`src/hooks/useStoredJourneyProgress.ts`** | Default `totalSteps` fallback on line 113 changes from `6` to `8`. |

---

### Registration trigger (1 file)

| # | File | What changes |
|---|------|-------------|
| 14 | **`src/pages/registration/ProfessionalRegistration.tsx`** | Calls `calculate_and_update_journey_progress` RPC — no code change needed (it's parameterized), but the RPC output will now reflect 8 steps. |

---

### Admin panel (2 files)

| # | File | What changes |
|---|------|-------------|
| 15 | **`src/components/admin/UserDetailModal.tsx`** | Consumes professional progress steps — will auto-reflect 8 steps. No direct changes unless we want to show reference/screening status inline. |
| 16 | **`src/pages/admin/AdminDashboard.tsx`** | Add "Caregiver Screening" quick-action button linking to new screening panel. |

---

### New components to create (3 files)

| # | File | Purpose |
|---|------|---------|
| 17 | **`src/components/professional/ProfessionalReferencesForm.tsx`** | Form for caregivers to submit 2 references (name, phone, email, relationship, years known). Shows status badges. |
| 18 | **`src/components/admin/ProfessionalScreeningPanel.tsx`** | Admin view: list professionals pending screening, schedule interviews, record outcomes, verify references. |
| 19 | **`src/pages/admin/ProfessionalScreeningPage.tsx`** | Page wrapper for the screening panel with breadcrumbs. Needs a route added. |

---

### Route (1 file — requires confirmation per guardrail)

| # | File | What changes |
|---|------|-------------|
| 20 | **`src/App.tsx`** | Add route for `/admin/caregiver-screening` → `ProfessionalScreeningPage`. **(Requires explicit approval per project guardrail.)** |

---

### Professional Profile Hub (1 file)

| # | File | What changes |
|---|------|-------------|
| 21 | **`src/components/professional/ProfessionalProfileHub.tsx`** | Add a "References" tab where professionals can view/submit their references using `ProfessionalReferencesForm`. |

---

### Summary: 21 touchpoints total

- **1** database migration (2 new tables + 2 new columns)
- **1** database function update (`calculate_and_update_journey_progress`)
- **3** core logic files (stepDefinitions, completionCheckers, types)
- **3** hooks with hardcoded step lists
- **4** UI components that render steps
- **3** new components/pages to create
- **1** stored progress fallback update
- **1** admin dashboard quick action
- **1** professional profile hub tab
- **1** route addition (needs your approval per guardrail)
- **2** files that auto-reflect changes (UserDetailModal, ProfessionalRegistration)

