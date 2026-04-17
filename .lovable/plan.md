

## Plan: Rename "wages/salary" → "caregiver compensation" across user-facing copy

### Audit findings

**User-facing copy** (the only places that should change):

| File | Lines | Current text |
|---|---|---|
| `src/components/admin/UnitEconomicsTable.tsx` | 54 | tooltip: *"Direct Care Costs: caregiver **wages** + employer NIS..."* |
| same | 127 | label: *"Caregiver **Wages** Pass-through"* |
| same | 130 | sublabel: *"Actual **wages** from payroll"* |
| same | 207 | breakdown: *"**Wages**: $..."* |
| `src/components/admin/OperatingCostConfig.tsx` | 146 | warning: *"Never label as \"**wages**\" or \"**salary**\" — Tavara is a coordination platform..."* |
| `src/components/shared/PlatformPositioningDisclaimer.tsx` | 63 | *"Caregiver **wages** flow as a transparent pass-through..."* |
| `src/pages/support/FAQPage.tsx` | 33 | *"It does not cover caregiver **wages** — those flow directly..."* |
| `src/hooks/admin/useUnitEconomics.ts` | 495 | code comment only (not user-visible) |
| `src/hooks/admin/operatingCostFramework.ts` | 16, 98, 200 | code comments + `notes` field on training stipend item ("never as wages") |

**What we will NOT touch** (intentional — these are correct, legal, or external):

- `src/services/care-plans/work-logs/payrollService.ts` — `getWageEarnings()` is internal NIS-API math (the official NIS classification term *is* "wages" per government rules). Renaming would misalign with NI 184/187 forms.
- `src/services/care-plans/reports/ni184Generator.ts` — `SALARY` constant maps to the **government PDF column header** "Salary for Period". Cannot rename.
- `src/types/jobOpportunity.ts`, `src/components/professional/JobListings.tsx`, `src/integrations/supabase/types.ts`, `src/adapters/jobOpportunityAdapter.ts`, `supabase/functions/update-job-data/index.ts` — these are about **external job listings** (employer-posted job ads with salary ranges), not Tavara caregiver compensation. Leave untouched.
- DB columns (`gross_pay`, etc.), function names like `calculatePayrollEntry`, `payroll_entries` table, "Payroll" tab label — these are correct accounting terms, not "wages/salary".

### Replacement rules

| Old | New |
|---|---|
| "Caregiver Wages Pass-through" | "Caregiver Compensation Pass-through" |
| "Caregiver wages flow as a transparent pass-through" | "Caregiver compensation flows as a transparent pass-through" |
| "It does not cover caregiver wages" | "It does not cover caregiver compensation" |
| tooltip "caregiver wages + employer NIS" | "caregiver compensation + employer NIS" |
| breakdown row "Wages: $X" | "Compensation: $X" |
| sublabel "Actual wages from payroll" | "Actual compensation from payroll" |
| warning *"Never label as \"wages\" or \"salary\""* | *"Never label as \"wages\" or \"salary\" in caregiver-facing materials"* — keep as-is, this is a legal anti-pattern reminder *to admins*; renaming would erase the reminder's purpose. **Leave unchanged.** |

### Files to edit (5)

1. `src/components/admin/UnitEconomicsTable.tsx` — 4 string updates (lines 54, 127, 130, 207)
2. `src/components/shared/PlatformPositioningDisclaimer.tsx` — 1 update (line 63)
3. `src/pages/support/FAQPage.tsx` — 1 update (line 33)
4. `src/hooks/admin/useUnitEconomics.ts` — 1 comment update (line 495, optional consistency)
5. `src/hooks/admin/operatingCostFramework.ts` — 2 comment updates (lines 16, 98, optional consistency)

### Files explicitly NOT touched
- `OperatingCostConfig.tsx` line 146 (anti-pattern reminder text — must keep "wages/salary" wording)
- All NIS/payroll service files, NI 184/187 generators, government form constants
- All job-opportunity files (external employer postings)
- DB schemas, types, payroll tab labels

### Verification after build
1. `/admin/unit-economics` → expand a client row → breakdown shows "Compensation:" not "Wages:"
2. `/admin/unit-economics` → tooltip on **Direct Care** column reads "caregiver compensation + employer NIS..."
3. `/support/faq` → coordination-fee answer reads "caregiver compensation"
4. PlatformPositioningDisclaimer (shown on multiple pages) reads "Caregiver compensation flows..."
5. `/admin/unit-economics` → Operating Cost config still shows the "Never label as wages/salary" warning on training stipend (intentional, unchanged)

