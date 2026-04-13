

## Plan: Auto-Update Payroll Entries When Work Log Rates Change

### Problem
When you edit a work log's base rate (e.g., changing from $25/hr to $35/hr) and save, the linked payroll entry keeps the old rate ($25/hr, $200 total). The payroll entry is a one-time snapshot created at approval time and never syncs back.

### Root Cause
In `approvalService.ts`, when a work log is approved, `calculatePayrollEntry()` reads the current rates and inserts a payroll entry. After that, no mechanism exists to propagate rate changes from `work_logs` to `payroll_entries`.

### Solution: Database Trigger + Application-Level Sync

**1. Database trigger (migration)** — Create a PostgreSQL trigger on `work_logs` that fires `AFTER UPDATE` and automatically recalculates the linked pending payroll entry whenever `base_rate`, `rate_multiplier`, or `rate_type` changes on the work log.

The trigger function will:
- Only fire when rate-related columns actually change (`base_rate`, `rate_multiplier`, `rate_type`)
- Only update payroll entries with `payment_status = 'pending'` (never touch paid entries)
- Recalculate `regular_rate`, `gross_pay`, `total_amount`, and `net_pay_after_nis` using the new rates
- Leave hours, expenses, and other fields unchanged

```text
work_logs UPDATE (base_rate/rate_multiplier changed)
  → trigger: update_payroll_on_rate_change()
    → UPDATE payroll_entries SET regular_rate, gross_pay, total_amount, net_pay_after_nis
       WHERE work_log_id = NEW.id AND payment_status = 'pending'
```

**2. Application-level sync in `useWorkLogRate.ts`** — After `saveRates()` successfully updates the work log, also call a service function to refresh any pending payroll entry linked to that work log. This provides immediate UI feedback without waiting for a page reload.

**3. Service function in `payrollService.ts`** — Add `syncPayrollEntryWithWorkLog(workLogId)` that fetches the work log's current rates and updates the linked pending payroll entry. Called from `saveRates()` and also usable standalone.

### Files to Change

| File | Change |
|------|--------|
| New migration | Trigger `update_payroll_on_rate_change` on `work_logs` table |
| `src/services/care-plans/payrollService.ts` | Add `syncPayrollEntryWithWorkLog(workLogId)` |
| `src/hooks/payroll/useWorkLogRate.ts` | Call sync after `saveRates()` succeeds |

### Safety
- Trigger only affects `pending` payroll entries — paid entries are never modified
- If no payroll entry exists for the work log, the trigger does nothing
- The trigger handles the case where rates are updated outside the app (e.g., direct DB edit)

