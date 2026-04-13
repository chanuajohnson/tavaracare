

## Plan: Add Work Log Delete + Fix Paid Payroll Entry Visibility

### Problems Found

1. **No delete button on work logs** — `WorkLogActions.tsx` only shows Approve/Reject/Receipt. Family and professionals have no way to delete a work log. No `deleteWorkLog` service function exists anywhere.

2. **Paid payroll entries appear to "vanish"** — The paid entries ARE in the database (verified: 5 paid entries for Angela), but once paid, the "Process Payment" button disappears and there's no indication of what was done (NIS details, payment date, etc.). The entries show in the table but there's no expanded detail view for paid entries. Additionally, the NIS data on those entries is all zeros — the NIS calculation likely failed silently during processing.

3. **No undo for paid entries** — Once processed, there's no way to reverse a payment or mark it back as pending.

### Changes

**1. Add "Delete Work Log" capability**

| File | Change |
|------|--------|
| New migration | RLS policy: family can DELETE from `work_logs` WHERE status = 'pending' AND care plan belongs to them. Professional can DELETE their own pending work logs. |
| `src/services/care-plans/work-logs/workLogApprovalService.ts` (or new file) | Add `deleteWorkLog(workLogId)` — deletes the work log and any linked pending payroll entry |
| `src/hooks/payroll/usePayrollData.ts` | Add `handleDeleteWorkLog` function, pass it down |
| `src/components/care-plan/payroll/table/WorkLogActions.tsx` | Add a red Trash icon button for pending work logs (family view). For professional view, show delete only on their own pending logs. |
| `src/components/care-plan/payroll/WorkLogsTable.tsx` | Accept and pass `onDelete` prop |
| `src/components/care-plan/PayrollTab.tsx` | Wire delete handler through to WorkLogsTable |

**2. Show payment details for paid payroll entries**

| File | Change |
|------|--------|
| `src/components/care-plan/payroll/PayrollEntriesTable.tsx` | For paid entries, replace the missing "Process Payment" button with a "View Details" button or expandable row showing: payment date, NIS class, employee/employer contributions, net pay. This info is already in the data — just not displayed when status is `paid`. |

**3. Add "Undo Payment" for paid entries (mark back to pending)**

| File | Change |
|------|--------|
| New migration | RLS policy: family can UPDATE `payroll_entries` payment_status from 'paid' back to 'pending' for their care plans |
| `src/services/care-plans/work-logs/payrollService.ts` | Add `undoPayrollPayment(payrollId)` — resets payment_status to 'pending', clears payment_date and NIS fields |
| `src/hooks/payroll/usePayrollData.ts` | Add `handleUndoPayment` |
| `src/components/care-plan/payroll/PayrollEntriesTable.tsx` | Add "Undo" button next to paid entries with confirmation dialog |

### Summary of UI Changes

**Work Logs tab:**
- Pending work logs get a red trash icon (with confirmation dialog) — available to family always, and to professionals for their own logs

**Payroll Entries tab:**
- Paid entries now show a "View Details" info section with payment date, NIS breakdown
- Paid entries get an "Undo Payment" button that reverts to pending (with confirmation)
- "Process Payment" button remains visible only for pending entries (no change)

### Safety
- Delete only works on pending work logs (enforced by RLS + application code)
- Undo payment resets NIS fields so they can be recalculated on next processing
- All destructive actions require confirmation dialogs

