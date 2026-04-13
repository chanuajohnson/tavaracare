

## Plan: Admin Care Logs Tab + Admin-Side Approval Checkbox

### Summary
Two changes: (1) Add a "Care Logs" tab to the admin UserDetailModal for family users showing nurse daily logs, medication administrations, and notes. (2) Add Service Commencement Approval and Readiness Approval checkboxes on the admin onboarding checklist page so admin can check them on behalf of families/professionals, recording who checked and when.

---

### Change 1: Add "Care Logs" Tab to Admin UserDetailModal

**File: `src/components/admin/UserDetailModal.tsx`**

- Add a new tab "Care Logs" (visible only for family users) alongside existing Profile, Journey, Matching, Reports, Nudge, Activity tabs
- When opened, fetch:
  - `daily_care_logs` where `family_id = user.id`, ordered by `shift_date` desc, limit 20
  - `medication_administrations` joined through `medications` → `care_plans` for the family, recent 20
  - Nurse names from `profiles` for the `professional_id` values
- Display two collapsible sections:
  - **Medication Administrations**: med name, dosage, time administered, administered by (name + role badge)
  - **Caregiver Shift Logs**: caregiver name, shift date/type, time in/out, checklist section progress (parsed from `checklist_data`), and notes
- This mirrors the `DailyCareQuickView` component pattern but shows historical data (not just today)

### Change 2: Admin-Side Approval Checkboxes on Onboarding Checklist

**File: `src/pages/admin/AdminOnboardingChecklistPage.tsx`**

Currently the "Family Feedback Summary" card shows the approval status as read-only. Change it to be actionable:

- In the Family tab's Feedback Summary card: add a checkbox that admin can check for `family_approval_confirmed`. When admin checks it, save with additional metadata:
  - `family_approval_confirmed: true`
  - `family_approval_date: now`
  - `family_approval_by: "admin"` (new field to distinguish admin-on-behalf vs self-approval)
- In the Professional tab's Feedback Summary card: same pattern for `professional_approval_confirmed`, saving `professional_approval_by: "admin"`
- When checked by admin, show "Approved by Admin on [date]" instead of just "Approved"
- Admin can also uncheck (toggle) to undo if needed

The existing save functions (`saveFamilyToSupabase`, `saveProfToSupabase`) already handle persisting `checkedItems` to the `onboarding_checklists` table, so admin just needs to update the JSONB keys.

---

### Files to modify

| File | Change |
|------|--------|
| `src/components/admin/UserDetailModal.tsx` | Add "Care Logs" tab with medication admin history + daily care log history for family users |
| `src/pages/admin/AdminOnboardingChecklistPage.tsx` | Make approval status actionable — admin can toggle family_approval_confirmed and professional_approval_confirmed on behalf of users, with "admin" attribution |

### No migration needed
Admin already has full access to all tables. Frontend-only changes.

