

## Plan: Bulk Approve / Reject / Delete Work Logs

### Problem
With 20+ pending work logs for Angela's March month, approving or rejecting them one at a time is tedious. You need a "select all / select some" checkbox approach with bulk action buttons.

### Solution
Add row-level checkboxes to the Work Logs table, a "select all pending" checkbox in the header, and a bulk action toolbar that appears when items are selected. Actions: **Approve Selected**, **Reject Selected** (with a single reason dialog), and **Delete Selected**.

### UI Flow

```text
┌─────────────────────────────────────────────────────┐
│ [✓ 18 selected]  [✓ Approve All]  [✗ Reject All]  │
│                  [🗑 Delete Selected]               │
├──┬───────────┬──────────┬───────┬──────┬───────────┤
│☑ │ Angela    │ Mar 30   │ 8.0h  │ $280 │ pending   │
│☑ │ Angela    │ Mar 27   │ 8.0h  │ $200 │ pending   │
│☐ │ Angela    │ Mar 26   │ 8.0h  │ $280 │ approved  │
│  │ (approved rows cannot be selected for approve)   │
└──┴───────────┴──────────┴───────┴──────┴───────────┘
```

### Technical Details

**File: `src/components/care-plan/payroll/WorkLogsTable.tsx`**
- Add `selectedIds` state (Set of work log IDs)
- Add a "select all pending" checkbox in the table header
- Add a bulk action toolbar above the table when items are selected, with:
  - "Approve Selected" button (calls `onBulkApprove`)
  - "Reject Selected" button (opens reject dialog with shared reason)
  - "Delete Selected" button (with confirmation dialog)
- Count display: "X selected"
- Pass `selectedIds` and `onToggleSelect` to each `WorkLogTableRow`

**File: `src/components/care-plan/payroll/table/WorkLogTableRow.tsx`**
- Add checkbox column as the first cell
- Only show checkbox for pending work logs (non-pending rows get an empty cell)
- Checkbox controlled by parent's `selectedIds` set

**File: `src/services/care-plans/work-logs/approvalService.ts`**
- Add `bulkApproveWorkLogs(ids: string[])` — loops through IDs calling existing `approveWorkLog` sequentially, returns `{ approved: number, failed: number }`
- Add `bulkRejectWorkLogs(ids: string[], reason: string)` — loops through IDs calling existing `rejectWorkLog`, returns `{ rejected: number, failed: number }`
- Add `bulkDeleteWorkLogs(ids: string[])` — loops through IDs calling existing `deleteWorkLog`, returns `{ deleted: number, failed: number }`

**File: `src/hooks/payroll/usePayrollData.ts`**
- Add `handleBulkApproveWorkLogs(ids: string[])` — calls bulk service, reloads data, shows summary toast
- Add `handleBulkRejectWorkLogs(ids: string[], reason: string)` — same pattern
- Add `handleBulkDeleteWorkLogs(ids: string[])` — same pattern
- Return new handlers

**File: `src/components/care-plan/PayrollTab.tsx`**
- Pass new bulk handlers down to `WorkLogsTable`
- Hide bulk actions for professional view (they cannot approve/reject)

### Files to Create/Modify

| File | Change |
|------|--------|
| `src/services/care-plans/work-logs/approvalService.ts` | Add `bulkApproveWorkLogs`, `bulkRejectWorkLogs`, `bulkDeleteWorkLogs` |
| `src/hooks/payroll/usePayrollData.ts` | Add bulk action handlers |
| `src/components/care-plan/PayrollTab.tsx` | Pass bulk handlers to WorkLogsTable |
| `src/components/care-plan/payroll/WorkLogsTable.tsx` | Add checkboxes, bulk action toolbar, selection state |
| `src/components/care-plan/payroll/table/WorkLogTableRow.tsx` | Add checkbox column |

### Safety
- Only pending work logs can be selected for approve/reject
- Only pending work logs can be selected for delete
- Confirmation dialog before bulk reject (requires reason) and bulk delete
- Progress toast shows results: "Approved 18 of 18 work logs"
- Individual row actions remain available alongside bulk actions

