

## Plan: Add Professional Onboarding Checklist System with Tabbed Admin View

### Summary

Three deliverables:
1. **Admin page gets tabs**: "Family" (current) and "Professional" (new) tabs at the top of `AdminOnboardingChecklistPage.tsx`
2. **New professional onboarding section definitions**: A new `professionalOnboardingSections.ts` file mirroring the family sections but tailored for professional onboarding
3. **New professional-facing checklist page**: `/professional/onboarding-checklist` (authenticated) and updated public guide with professional tab at `/onboarding-guide`
4. **Database**: New `professional_onboarding_checklists` table (migration) with `professional_id` column, mirroring `onboarding_checklists` structure

### Database Change

Create a migration for a new table `professional_onboarding_checklists`:
- `id` uuid PK
- `professional_id` uuid FK to `profiles.id`, unique
- `checked_items` jsonb
- `notes` jsonb
- `started_at` timestamptz
- `updated_at` timestamptz
- RLS enabled with policies matching the existing `onboarding_checklists` pattern

This is needed because the existing `onboarding_checklists` table has `family_id` with a unique constraint — we cannot reuse it for professionals.

### File Changes

| File | Change |
|------|--------|
| `src/components/admin/onboarding/professionalOnboardingSections.ts` | **New file** — Professional-specific section definitions (e.g., Pre-Screening Review, Document Verification, Platform Walkthrough, Training Modules, Assignment Process, Daily Checklist SOP, Rates & Payment, Communication & Support, Next Steps) |
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Add `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` wrapping the current family content in a "Family" tab and a new "Professional" tab. The Professional tab mirrors the family tab but uses `professionalOnboardingSections`, loads professionals (role=professional), and reads/writes `professional_onboarding_checklists` |
| `src/pages/professional/ProfessionalOnboardingChecklistPage.tsx` | **New file** — Read-only checklist view for authenticated professionals, mirroring `FamilyOnboardingChecklistPage.tsx` but using professional sections and `professional_onboarding_checklists` table |
| `src/pages/public/OnboardingGuidePage.tsx` | Add tabs: "Family Guide" (current) and "Professional Guide" (new), each showing their respective section definitions |
| `src/components/routing/AppRoutes.tsx` | Add route `/professional/onboarding-checklist` pointing to `ProfessionalOnboardingChecklistPage` |
| `src/components/professional/ProfessionalShortcutMenuBar.tsx` | Add "Onboarding Progress" quick-access link |
| Migration SQL | Create `professional_onboarding_checklists` table with RLS |

### Professional Onboarding Sections (Draft)

1. **Pre-Screening Review** — Review background check, references, screening session status
2. **Document Verification** — Certifications, ID, insurance, training certificates
3. **Platform Walkthrough** — Login, professional dashboard, assignments, schedule
4. **Care Plan & Assignment Training** — How assignments work, care plan details, care team
5. **Daily Checklist SOP** — Shift check-in/out, daily log, medication admin, incident reports
6. **Medication & Meal Protocols** — Medication dashboard, meal plan access, dietary requirements
7. **Rates, Payment & Policies** — Rate tiers, holiday/overtime, payment schedule, change orders
8. **Communication & Support** — WhatsApp groups, coordinator contact, escalation procedures
9. **Next Steps & First Assignment** — Confirm availability, first assignment, 48hr check-in

### Technical Details

- Uses existing `Tabs` component from `@/components/ui/tabs`
- Admin tab state managed via local state (no URL params needed)
- Professional sections follow same `OnboardingSectionDef` interface — reuses `iconName`, `items[]`, etc.
- The public guide page tabs let anyone view either the family or professional onboarding overview
- Professional shortcut menu bar gets a ClipboardCheck icon link to `/professional/onboarding-checklist`

