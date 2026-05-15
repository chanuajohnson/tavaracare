Tricia's banners aren't appearing because the wrong file was edited. The active route `/dashboard/professional` is wired in `AppRoutes.tsx` to `@/pages/dashboards/ProfessionalDashboard` (plural `dashboards/`). The previous change mounted `<LimitedAccessBanner />` and `<ProfessionalPaymentRecordsBanner />` in `src/pages/dashboard/ProfessionalDashboard.tsx` (singular `dashboard/`), which is no longer routed and thus never renders.

DB confirms Tricia (`56922ef7-...`) is `account_status='limited'`, `role='professional'`, and has an active `care_team` row in `caregiver_assignments` (`care_plan_id=4848aec5-...`, `family_user_id=7d850934-...`), so both banners have valid data to render once placed in the correct file.

### Fix
Edit only `src/pages/dashboards/ProfessionalDashboard.tsx`:
1. Import `LimitedAccessBanner` from `@/components/shared/LimitedAccessBanner`.
2. Import `ProfessionalPaymentRecordsBanner` from `@/components/professional/ProfessionalPaymentRecordsBanner`.
3. Mount both, in that order, immediately after `<DashboardHeader breadcrumbItems={breadcrumbItems} />` and before the `<h1>Professional Dashboard</h1>`, mirroring the family layout.
4. If a duplicate `<ProfessionalPaymentRecordsCard />` exists in the grid below, remove it (verify during edit).

### Cleanup
- Leave the stale `src/pages/dashboard/ProfessionalDashboard.tsx` alone for now (out of scope; deleting it risks breaking unknown imports — none currently import it but a follow-up task can prune it).

### Verification
- Confirm `/dashboard/professional` for Tricia shows the amber LimitedAccessBanner and the payment-records ticker for the assigned family above the H1.
- Non-limited professionals still see only the payment ticker (banner is null when status≠limited).
- Professionals with no `care_team`/active assignment see neither (ticker returns null when no `family_user_id`).