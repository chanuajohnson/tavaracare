

## Plan: Date-range picker for receipts + remove all "Pay" language → "Care"

### Part A — User-selectable week/month for receipts

The previous plan picked the week/month based on the row you clicked. You want to **choose** which week or month explicitly.

**New UX in `WorkLogActions.tsx`** — replace the single Receipt icon with a dropdown:
```
[ 📄 ▾ ]
   ├─ Daily Care Receipt (this shift)
   ├─ Weekly Care Receipt…        → opens week picker dialog
   ├─ Monthly Care Receipt…       → opens month picker dialog
   └─ Custom Date Range…          → opens from/to picker dialog
```

**New component**: `src/components/care-plan/payroll/ReceiptRangePickerDialog.tsx`
- Mode = `week` | `month` | `custom`
- **Week mode**: shadcn `Calendar` in single-date mode; auto-snaps to the ISO week (Mon–Sun) of the picked date and shows a preview (e.g. "Apr 13 – Apr 19, 2026"). Defaults to the row's week.
- **Month mode**: native month/year selector (Select for month + Select for year); shows preview (e.g. "April 2026"). Defaults to the row's month.
- **Custom mode**: shadcn `Calendar` in `range` mode (from + to).
- Footer shows: caregiver name, count of work logs that fall in range, total hours, total amount preview.
- Buttons: **Cancel** | **Generate Care Receipt**.

**Wiring** (`WorkLogsTable.tsx`):
- Add `handleOpenRangeDialog(workLog, mode)` → opens dialog with caregiver context.
- On confirm → filters `workLogs` by `care_team_member_id` + `start_time ∈ [from, to]` (excludes rejected) → calls new service.
- 0 logs → toast warning. 1 log → falls back to single receipt. ≥2 → consolidated receipt.

**New service function** in `receiptService.ts`:
```ts
generateConsolidatedWorkLogsReceipt(
  workLogs: WorkLog[],
  opts: { from: Date; to: Date; label: string }  // e.g. "Weekly", "Monthly", "Apr 1–10"
): Promise<string>
```
Mirrors existing `generateConsolidatedReceiptContent` but for `WorkLog[]`. Per-day breakdown table + totals.

### Part B — Rename "Pay" → "Care" everywhere user-facing

Confirmed audit (case-insensitive search of `src/`):

| File | Line | Current | New |
|---|---|---|---|
| `receiptService.ts` | 78 | `'Pay Receipt'` (PDF title) | `'Care Receipt'` |
| `receiptService.ts` | 144 | `'Gross Pay'` (footer row) | `'Gross Amount'` |
| `receiptService.ts` | 151 | `'Net Pay After NIS'` | `'Net Amount After NIS'` |
| `receiptService.ts` | 245 | `'Consolidated Pay Receipt'` | `'Consolidated Care Receipt'` |
| `WorkLogActions.tsx` | (button title) | `"Generate Receipt"` | `"Generate Care Receipt"` |
| Any tooltip mentioning "pay receipt" | — | rename to "care receipt" | |

**Out of scope (kept, by your prior rules)**:
- ❌ `pay_period_start`, `pay_period_end`, `payment_status` — DB columns, internal only, NOT renamed
- ❌ `PayrollEntry` type name — internal, NOT renamed
- ❌ "Care Payments" tab label — already correctly named in prior loop
- ❌ "Caregiver Compensation Pass-through" — line item in Unit Economics, untouched
- ❌ Net pay/gross pay terminology in payroll DB or NIS gov forms (NI 184/187 are statutory) — untouched

### Files to change (5)

1. `src/components/care-plan/payroll/table/WorkLogActions.tsx` — replace icon button with `DropdownMenu` (4 items); add `onGenerateRangeReceipt(workLog, 'week'|'month'|'custom')` prop; update button title.
2. `src/components/care-plan/payroll/table/WorkLogTableRow.tsx` — forward new prop.
3. `src/components/care-plan/payroll/WorkLogsTable.tsx` — add range-dialog state + filter handler; mount new dialog; wire to existing `ShareReceiptDialog`.
4. `src/components/care-plan/payroll/ReceiptRangePickerDialog.tsx` — **NEW**. Week/Month/Custom date selection with live preview of matching logs.
5. `src/services/care-plans/receiptService.ts` — add `generateConsolidatedWorkLogsReceipt` + rename "Pay" → "Care"/"Amount" in user-facing PDF strings only.

### Out of scope

- "Care Payments" tab name and other already-renamed labels stay.
- DB columns and statutory NIS form labels stay.
- No bulk "all caregivers" receipt at this time.

