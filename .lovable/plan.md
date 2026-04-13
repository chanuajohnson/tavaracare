

## Plan: Add "Delete Selected" for Pending Payroll Entries

### Problem
Family users have no way to delete duplicate or incorrect pending payroll entries. The UI has checkboxes and selection, but no delete action. Additionally, RLS only grants admin users DELETE access to `payroll_entries`.

### What Will Change

**1. Database Migration — RLS policy for family DELETE on pending payroll entries**
- Add a policy: family can DELETE from `payroll_entries` WHERE `payment_status = 'pending'` AND the `care_plan_id` belongs to a care plan owned by the family (`care_plans.family_id = auth.uid()`)
- Add a policy: family can UPDATE `work_logs` status back to `pending` for work logs on their care plans (needed to reset the linked work log)

**2. Service function — `deletePayrollEntries` in `src/services/care-plans/work-logs/payrollService.ts`**
- Accepts an array of payroll entry IDs
- For each entry: fetch `work_log_id`, delete the payroll entry, then update the linked work log status back to `'pending'`
- Only operates on entries with `payment_status = 'pending'`
- Returns success/failure count

**3. UI — "Delete Selected" button in `PayrollEntriesTable.tsx`**
- When entries are selected AND at least one is `pending`, show a red "Delete Selected (N)" button in the bulk action bar (alongside existing Receipt/Download buttons)
- Clicking it opens an `AlertDialog` confirmation: "Delete N pending payroll entries? The linked work logs will be reset to pending so you can re-approve them."
- On confirm, calls `deletePayrollEntries`, shows toast, and triggers data refresh

**4. Hook update — `usePayrollData.ts`**
- Add `handleDeletePayrollEntries` function that calls the service and reloads data
- Pass it down through `PayrollTab` → `PayrollEntriesTable`

### Files to Change

| File | Change |
|------|--------|
| New migration | RLS: family DELETE on pending payroll_entries; family UPDATE work_logs for reset |
| `src/services/care-plans/work-logs/payrollService.ts` | Add `deletePayrollEntries(ids: string[])` |
| `src/hooks/payroll/usePayrollData.ts` | Add `handleDeletePayrollEntries` |
| `src/components/care-plan/PayrollTab.tsx` | Pass delete handler to PayrollEntriesTable |
| `src/components/care-plan/payroll/PayrollEntriesTable.tsx` | Add Delete Selected button with AlertDialog confirmation |

### Safety
- Only pending entries can be deleted (enforced both in code and RLS)
- Confirmation dialog required before deletion
- Work logs are reset to pending (not deleted), so they can be re-approved with correct data

