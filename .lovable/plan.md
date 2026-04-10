

## Plan: Add Professional Submission Review to Admin Onboarding Checklist

### What This Does
Adds inline data review cards to the Professional tab of the admin onboarding checklist, mirroring how the Family tab shows registration data, care assessment, and legacy story. When an admin selects a professional, the "Pre-Screening Review" section will display:

1. **Registration Data** — Name, professional type, years of experience, certifications, care types, availability, hourly rate, background check status, location, contact info
2. **Uploaded Documents** — List of all documents the professional uploaded (ID, certificates, background check proof, training certs) with document type and file name
3. **References** — All submitted references with name, relationship, years known, status (pending/verified/flagged)
4. **Screening Results** — Head nurse interview outcomes with status, rating, recommendation, interviewer name

### File Changes

| File | Change |
|------|--------|
| `src/components/admin/onboarding/ProfessionalSubmissionReview.tsx` | **New** — Component that fetches and displays professional profile, documents, references, and screening data in styled cards (blue for registration, green for documents, orange for references, purple for screening) |
| `src/components/admin/onboarding/professionalOnboardingSections.ts` | Add `showProfessionalData: true` to the `pre_screening` section |
| `src/components/admin/onboarding/onboardingSections.ts` | Add `showProfessionalData?: boolean` to the `OnboardingSectionDef` interface |
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Update `ChecklistTabContent` to accept a `showProfessionalData` prop, render `ProfessionalSubmissionReview` when the section has `showProfessionalData: true` and a professional is selected |

### Data Sources (all existing tables, no DB changes needed)

- `profiles` — professional_type, years_of_experience, certifications, care_types, care_schedule, hourly_rate, background_check, etc.
- `professional_documents` — document_type, file_name, uploaded files
- `professional_references` — reference_name, reference_relationship, years_known, status
- `professional_screening` — screening_type, status, rating, recommendation, interviewer_name

### Technical Details

- Follows exact same pattern as `FamilySubmissionReview`: fetches data via `Promise.all`, renders cards with `renderField`/`renderArrayField` helpers
- Uses same color-coded card style (blue border for registration, green for documents, orange for references, purple for screening)
- The `ChecklistTabContent` component already supports `showFamilyData` — we add a parallel `showProfessionalData` prop using the same conditional rendering pattern
- No database migration needed — all data already exists

