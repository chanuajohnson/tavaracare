## Three fixes: enforce read-only on care plan, mirror banners on Professional Dashboard, add Pricing card to Admin Dashboard

### 1. Enforce read-only in the care-plan UI (limited-access users)

DB-level RESTRICTIVE policies (`deny_writes_when_limited_*`) are already in place from the earlier migration, so any actual write would fail server-side. The bug is purely UX: edit/delete buttons are still rendered and clickable, so the user clicks "Edit" and the form opens — confusing and a trust failure ("Movement is freedom" / "Earn trust in every interaction").

Fix at the UI layer using the existing `useReadOnlyGuard()` hook (already returns `isReadOnly`, `readOnlyProps`, `tooltip`, and `guard()` wrapper). For each edit/delete entry point on the care plan:

- `src/components/care-plan/PlanDetailsTab.tsx` — Edit button: spread `readOnlyProps`, hide entirely when `isReadOnly` (cleaner than disabled here since the section is purely informational).
- `src/components/care-plan/CareTeamTab.tsx` — "Add team member", "Remove" — hide / disable.
- `src/components/care-plan/EnhancedScheduleTab.tsx` — "Add shift", "Edit shift", "Delete shift", drag handles — disable + tooltip.
- `src/components/care-plan/MedicationsTab.tsx` — already partial; verify all edit/delete/add buttons are guarded.
- `src/components/care-plan/DocumentsTab.tsx` — upload, delete buttons.
- `src/components/meal-planning/MealPlanner.tsx` & `EditMealDialog.tsx` — add/edit/delete (some already guarded).
- `src/components/care-plan/PayrollTab.tsx` / `PayrollEntriesTable.tsx` — already guarded.
- `src/pages/family/care-management/CreateCarePlanPage.tsx` and any "Edit Care Plan" route page — short-circuit at top: if `isReadOnly`, redirect back to `/dashboard/family` with a toast.

Pattern applied per component:
```tsx
const { isReadOnly, readOnlyProps, guard } = useReadOnlyGuard();
// hide:    {!isReadOnly && <Button onClick={handleEdit}>Edit</Button>}
// disable: <Button {...readOnlyProps} onClick={guard(handleEdit, 'Edit')}>Edit</Button>
```

This mirrors the same DB-side `is_account_limited` check, so UI and database agree.

### 2. Mirror the two banner cards above the Professional Dashboard heading

Family dashboard (`src/pages/dashboard/family.tsx`) currently renders, above `<FamilyDashboard />`:
- `<LimitedAccessBanner />`
- `<PaymentRecordsBanner />`

Professional dashboard (`src/pages/dashboard/ProfessionalDashboard.tsx`) currently has `<ProfessionalPaymentRecordsCard />` buried inside the grid (line 154). Refactor so caregivers see the same hierarchy as families:

a. **Promote `LimitedAccessBanner` into a shared location** — move/re-export from `src/components/shared/LimitedAccessBanner.tsx` (the body is role-agnostic; copy already says "Your dashboard"). Keep the existing family import path working via re-export to avoid touching family code.

b. **Create `ProfessionalPaymentRecordsBanner`** — thin wrapper that mirrors the visual treatment of `PaymentRecordsBanner` (compact strip with Plan Start / Plan End pills + payment ticker) but pulls data via the existing `useUnifiedMatches` flow already used inside `ProfessionalPaymentRecordsCard`. Renders nothing if the caregiver has no assigned family.

c. **Mount both above the H1** in `ProfessionalDashboard.tsx`, between `<DashboardHeader />` and the heading `motion.div`:
```
<LimitedAccessBanner />
<ProfessionalPaymentRecordsBanner />
<motion.div>... Professional Dashboard h1 ...</motion.div>
```

d. Remove the duplicate `<ProfessionalPaymentRecordsCard />` from inside the grid (line 154) so it isn't shown twice.

### 3. Add "Pricing Catalog" card to Admin Dashboard

In `src/pages/admin/AdminDashboard.tsx`, in the action-card grid (after the `Unit Economics` button at ~line 273), add:

```tsx
<Button
  onClick={() => navigate('/admin/pricing-catalog')}
  className="h-20 flex flex-col items-center justify-center gap-2"
  variant="outline"
>
  <Tag className="h-6 w-6" />
  <span className="...">Pricing Catalog</span>
</Button>
```

Import `Tag` from `lucide-react` and add the handler.

---

### Files to edit
- `src/pages/dashboard/ProfessionalDashboard.tsx` — mount banners above heading, remove duplicate card
- `src/pages/admin/AdminDashboard.tsx` — add Pricing Catalog button
- `src/components/care-plan/PlanDetailsTab.tsx` — guard Edit
- `src/components/care-plan/CareTeamTab.tsx` — guard add/remove
- `src/components/care-plan/EnhancedScheduleTab.tsx` — guard add/edit/delete shift
- `src/components/care-plan/DocumentsTab.tsx` — guard upload/delete
- `src/components/care-plan/MedicationsTab.tsx` — verify/extend guards
- `src/pages/family/care-management/CreateCarePlanPage.tsx` — redirect on read-only
- `src/pages/family/care-management/CarePlanDetailPage.tsx` — pass `isReadOnly` through if any tab needs it
- `src/components/family/dashboard/LimitedAccessBanner.tsx` — re-export from shared

### Files to create
- `src/components/shared/LimitedAccessBanner.tsx` (moved body)
- `src/components/professional/ProfessionalPaymentRecordsBanner.tsx`

### Out of scope
- No DB schema or RLS changes (already in place; this is UX alignment).
- No changes to `App.tsx`, registration, or auth routing.
- No changes to admin views — admins remain unaffected because `is_account_limited` is false for them.
