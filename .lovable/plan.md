

## Plan: Rename "Employer NIS" → "NIS Contribution (Caregiver)" in user-facing copy

### Audit findings

**User-facing copy** (will be renamed):

| File | Line | Current text | Context |
|---|---|---|---|
| `src/components/admin/UnitEconomicsTable.tsx` | 54 | tooltip: *"...caregiver compensation + **employer NIS** + reimbursable expenses..."* | Direct Care column header tooltip |
| same | 177 | column header: **"Employer NIS"** | Caregiver breakdown table |
| same | 187 | data cell value `cg.employerNis` (kept — variable name, not text) | — |
| same | 208 | breakdown row: *"**Employer NIS**: $X"* | Layer 1 cost breakdown |
| `src/components/care-plan/payroll/PayrollEntriesTable.tsx` | 316 | label: **"Employer NIS"** | Monthly payroll breakdown card |
| same | 482 | label: **"Employer NIS"** | Weekly payroll breakdown card |
| `src/components/care-plan/payroll/ProcessPaymentDialog.tsx` | 128 | label: *"**Employer NIS** (remaining):"* | Payment dialog summary |
| `src/services/care-plans/receiptService.ts` | 206 | PDF receipt text: *"**Employer NIS** Liability: $X (not deducted from worker pay)"* | Generated PDF receipt |

**What we will NOT touch** (intentional — internal/legal/code identifiers):

- `src/components/care-plan/settings/EmployerSettingsForm.tsx` lines 68, 71 — *"Employer / NIS Settings"* and *"employer NIS registration details"* refer to the **family's own employer registration with the government** (NI 184/187 filings). This is the legal employer-of-record concept, not a per-payroll cost label. Renaming would break the legal meaning.
- `src/services/care-plans/reports/ni184Generator.ts` & `ni187Generator.ts` — official government PDF forms; column headers must match form fields exactly.
- `src/services/care-plans/work-logs/payrollService.ts` — internal NIS calc service (variables `employerContribution`, `employer_contribution` are DB columns / API contracts).
- `src/types/careTypes.ts` line 163 — code comment for the `EmployerSettings` interface (refers to the legal settings entity).
- DB columns (`employer_contribution`), variable names (`employerNis`, `totalEmployerNIS`, `employerContribution`) — code identifiers, not user-visible.
- The phrase "not deducted from worker pay" stays in the PDF receipt — important transparency for caregivers.

### Replacement rule

| Old | New |
|---|---|
| `Employer NIS` | `NIS Contribution (Caregiver)` |
| `employer NIS` (mid-sentence) | `NIS contribution (caregiver)` |

### Files to edit (5)

1. **`src/components/admin/UnitEconomicsTable.tsx`** — 3 string updates (tooltip line 54, column header line 177, breakdown row line 208)
2. **`src/components/care-plan/payroll/PayrollEntriesTable.tsx`** — 2 string updates (lines 316, 482)
3. **`src/components/care-plan/payroll/ProcessPaymentDialog.tsx`** — 1 string update (line 128)
4. **`src/services/care-plans/receiptService.ts`** — 1 string update (line 206 — PDF receipt text)
5. *(no others)*

### Files explicitly NOT touched
- `EmployerSettingsForm.tsx`, `careTypes.ts` — refer to legal employer registration entity, not the per-pay line item
- All `payrollService.ts`, `ni184Generator.ts`, `ni187Generator.ts` — internal math, DB columns, government form alignment
- All variable names, DB columns, type/interface names — code identifiers untouched

### Verification after build
1. `/admin/unit-economics` → expand a client row → caregiver breakdown table column reads **"NIS Contribution (Caregiver)"**, Layer 1 breakdown shows *"NIS Contribution (Caregiver): $X"*, Direct Care tooltip uses lowercase *"nis contribution (caregiver)"*
2. Family payroll tab → monthly + weekly expanded breakdowns show **"NIS Contribution (Caregiver)"** label
3. Process Payment dialog → reads *"NIS Contribution (Caregiver) (remaining):"*
4. Generated payroll receipt PDF → reads *"NIS Contribution (Caregiver) Liability: $X (not deducted from worker pay)"*
5. Payroll → NIS Reports tab → still shows **"Employer / NIS Settings"** card (intentional, legal)

