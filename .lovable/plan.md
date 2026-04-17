

## Plan: Smart, dynamic filenames for downloaded Care Receipts

### Goal
Replace generic `receipt-1716a4ea (1).pdf` with descriptive names like:
- **Daily**: `2026-DN-Receipt-April13.pdf`
- **Weekly/Monthly/Custom range**: `2026-DN-Receipt-April13-19.pdf`
- **Cross-month range**: `2026-DN-Receipt-April28-May04.pdf`
- **Cross-year range** (rare): `2026-DN-Receipt-Dec30-2027-Jan05.pdf`

### Filename pattern

```
{YYYY}-{INITIALS}-Receipt-{Month}{startDay}[-{endDay} | -{Month2}{endDay}].{ext}
```

Components:
- **YYYY** — 4-digit year of the start date
- **INITIALS** — caregiver initials (uppercase, max 3 chars). Source priority:
  1. `workLog.caregiver_name` / consolidated `caregiverName` → first letter of each word
  2. Fallback to `professionalDetails.full_name` lookup
  3. Final fallback: `CG` (CareGiver)
- **Month** — full month name (e.g. `April`, not `Apr`) — matches the user's example
- **startDay / endDay** — zero-padded 2-digit day (`13`, `19`, `04`)
- **ext** — `pdf` or `jpg`

Sanitisation: strip any character not in `[A-Za-z0-9-]` to keep cross-OS-safe.

### Where it applies

Two download paths today:

| Location | Current filename | New filename |
|---|---|---|
| `ShareReceiptDialog.tsx` line 60 — `receipt-${workLog.id.slice(0, 8)}.pdf` | `receipt-1716a4ea.pdf` | smart name |
| `WorkLogsTable.tsx` consolidated/range path (download button after generation) | same generic | smart name |
| Any future JPG export (currently PDF-only — extend the helper to support `.jpg` for future use) | — | smart name |

### Implementation — 2 files

**1. NEW: `src/utils/receiptFilename.ts`** — single source of truth
```ts
export interface ReceiptFilenameInput {
  caregiverName?: string | null;
  startDate: Date;
  endDate?: Date | null;   // omit or === startDate → daily
  extension?: 'pdf' | 'jpg'; // default 'pdf'
}
export function buildReceiptFilename(input: ReceiptFilenameInput): string;
```
Pure function, fully unit-testable. Handles:
- Daily (no endDate or same-day) → `2026-DN-Receipt-April13.pdf`
- Same-month range → `2026-DN-Receipt-April13-19.pdf`
- Cross-month range → `2026-DN-Receipt-April28-May04.pdf`
- Cross-year range → `2026-DN-Receipt-Dec30-2027-Jan05.pdf`
- Missing caregiver name → uses `CG`
- Sanitisation of weird characters in names

**2. `src/components/care-plan/payroll/ShareReceiptDialog.tsx`**
- Accept new optional props: `caregiverName?: string`, `rangeStart?: Date`, `rangeEnd?: Date`
- Replace line 60's `link.download = ...` with `buildReceiptFilename({...})`
- Backward compatible: if range props not supplied, derive `startDate` from `workLog.start_time` (daily case)

**3. `src/components/care-plan/payroll/WorkLogsTable.tsx`** (caller for ranged receipts)
- When opening `ShareReceiptDialog` after a Weekly/Monthly/Custom generation, pass `caregiverName`, `rangeStart`, `rangeEnd` so the dialog builds the right filename.

### What stays the same
- ✅ `ShareReceiptDialog` UI, share/copy/email behavior — untouched
- ✅ Receipt PDF content & layout — untouched
- ✅ Daily-receipt flow still works without code changes at call sites that don't pass range props (defaults to start_time)
- ✅ No DB / route / auth changes

### Out of scope
- JPG export feature (helper supports `.jpg` extension but no JPG export UI is being added now)
- Renaming server-side stored receipt files (this only changes the download filename in the browser)

