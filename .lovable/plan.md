

## Plan: Rename "Payroll" → "Care Payments" in user-facing copy

### Audit findings — user-visible strings only

| File | Line | Current text | Context |
|---|---|---|---|
| `src/components/care-plan/PayrollTab.tsx` | 117 | TabsTrigger: **"Payroll Entries"** | Tab label inside care plan |
| same | 178 | CardTitle: **"Payroll Entries"** | Card heading |
| `src/components/care-plan/payroll/PayrollEntriesTable.tsx` | 189 | empty state: *"No **payroll** entries found."* | Empty list message |
| same | 224 | code comment: *"Month-first grouped **payroll**"* (not user-visible — leave) | — |
| same | 227 | TableCaption: *"**Payroll** entries grouped by month → week (Mon–Sun)"* | Table caption |
| same | 593 | AlertDialogTitle: *"Delete Pending **Payroll** Entries?"* | Confirm dialog title |
| same | 599 | dialog body: *"...delete N pending **payroll** entr(y/ies)..."* | Confirm dialog body |
| same | 633 | dialog body: *"...revert this **payroll** entry back to pending..."* | Undo dialog body |
| `src/pages/family/care-management/CarePlanDetailPage.tsx` | 156 | TabsTrigger: **"Payroll & Hours"** | Care plan detail tab |
| `src/pages/family/care-management/CareManagementPage.tsx` | 212 | CardDescription: *"...schedule, team, and **payroll**"* | Page intro |
| same | 216 | body: *"...team coordination, and **payroll** tracking."* | Page intro |
| `src/components/admin/UnitEconomicsTable.tsx` | 80 | Badge: *"No **payroll** this month"* | Per-client status |
| same | 169 | heading: *"Caregiver Breakdown (**payroll** month totals)"* | Expanded row |
| same | 194 | body: *"No **payroll** data for this month."* | Empty state |
| `src/pages/admin/UnitEconomicsPage.tsx` | 217 | warning: *"...no **payroll** entries for {month}..."* | Top-of-page warning |
| same | 234 | label: *"{month} (**payroll** month)"* | Section subtitle |
| `src/components/family/PostTrialConversionModal.tsx` | 189 | bullet: *"**Payroll** management"* | Marketing modal |
| same | 242 | bullet: *"All **payroll** & admin"* | Marketing modal |
| `src/services/care-plans/work-logs/approvalService.ts` | 60 | toast: *"Work log approved and **payroll** entry created..."* | Success toast |

### Replacement rules

| Old | New |
|---|---|
| "Payroll Entries" (tab/card title) | "Care Payments" |
| "Payroll & Hours" (tab) | "Care Payments & Hours" |
| "Delete Pending Payroll Entries?" | "Delete Pending Care Payments?" |
| "No payroll entries found." | "No care payments found." |
| "Payroll entries grouped by month..." | "Care payments grouped by month..." |
| "pending payroll entry/entries" | "pending care payment(s)" |
| "this payroll entry" (undo dialog) | "this care payment" |
| "schedule, team, and payroll" | "schedule, team, and care payments" |
| "payroll tracking" | "care payment tracking" |
| "No payroll this month" (badge) | "No care payments this month" |
| "Caregiver Breakdown (payroll month totals)" | "Caregiver Breakdown (care payment month totals)" |
| "No payroll data for this month." | "No care payment data for this month." |
| "no payroll entries for {month}" | "no care payments for {month}" |
| "(payroll month)" | "(care payment month)" |
| "Payroll management" / "All payroll & admin" (marketing) | "Care payment management" / "All care payments & admin" |
| toast "payroll entry created" | "care payment created" |

### Files to edit (8)

1. `src/components/care-plan/PayrollTab.tsx` — 2 strings (lines 117, 178)
2. `src/components/care-plan/payroll/PayrollEntriesTable.tsx` — 5 strings (lines 189, 227, 593, 599, 633)
3. `src/pages/family/care-management/CarePlanDetailPage.tsx` — 1 string (line 156)
4. `src/pages/family/care-management/CareManagementPage.tsx` — 2 strings (lines 212, 216)
5. `src/components/admin/UnitEconomicsTable.tsx` — 3 strings (lines 80, 169, 194)
6. `src/pages/admin/UnitEconomicsPage.tsx` — 2 strings (lines 217, 234)
7. `src/components/family/PostTrialConversionModal.tsx` — 2 strings (lines 189, 242)
8. `src/services/care-plans/work-logs/approvalService.ts` — 1 toast (line 60)

### Files / things explicitly NOT touched (intentional)

- **File names & component names**: `PayrollTab.tsx`, `PayrollEntriesTable.tsx`, `PayrollFilters.tsx`, `PayrollStatusBadge.tsx`, `payrollService.ts`, `usePayrollData`, `usePayrollFilters`, `WeeklyPayrollData`, etc. — these are code identifiers, not visible to users.
- **DB tables/columns**: `payroll_entries`, `payroll_month`, etc. — schema integrity.
- **TabsTrigger `value="payroll"`** props — these are internal route/state keys; the visible label is the *children* text only.
- **Government PDF generators** (`ni184Generator.ts`, `ni187Generator.ts`) — comments only, not user-visible.
- **Receipt PDF text** — verified: no "Payroll" text appears in generated receipt content.
- **Edge function names** (`nis-payroll-proxy`) — internal API identifier.
- **Comments and console logs** — non-user-facing.

### Verification after build

1. Open a care plan → tab reads **"Care Payments & Hours"**, inner tab **"Care Payments"**, card title **"Care Payments"**.
2. Family `/family/care-management` page → card description says *"…schedule, team, and care payments"*.
3. Empty state on care payments table → *"No care payments found."*
4. Delete pending entries dialog → title **"Delete Pending Care Payments?"**, body uses *"care payment(s)"*.
5. Undo payment dialog → *"…revert this care payment back to pending…"*.
6. `/admin/unit-economics` → "No care payments this month" badge, *"Caregiver Breakdown (care payment month totals)"*, *"(care payment month)"* subtitle.
7. Approve a work log → toast reads *"Work log approved and care payment created..."*.
8. PostTrialConversionModal bullets read **"Care payment management"** and **"All care payments & admin"**.

