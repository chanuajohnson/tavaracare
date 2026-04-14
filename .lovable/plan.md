

## Plan: Align Payroll Records with Government NIS Forms (NI 184 & NI 187)

### What the Government Forms Require

**NI 184 (Statement of Contribution Paid/Due)** — per-employee detail:
- Employee NIS Number
- Employee Name (surname first)
- Date of Birth
- Date Employed / Last Date Worked
- Salary for Period
- Weekly contribution values (Week 1-5 breakdown)
- Total contributions brought forward

**NI 187 (Summary of Contributions Due/In Arrears)** — employer-level summary:
- Employer Trade Name, Registration Number, Service Centre Code
- Pay period (from/to)
- Number of employees
- Contributions due, penalty, interest, total, amount paid, balance
- Section F: monthly breakdown if period exceeds one month

### What We're Missing Today

**Currently stored**: `nis_class`, `nis_applicable`, `employee_contribution`, `employer_contribution`, `net_pay_after_nis` on `payroll_entries`. Weekly NIS calculations via the Nuacha API proxy.

**Not stored anywhere**:
1. **Employee NIS Number** — critical identifier for government filings
2. **Date of Birth** — required on NI 184
3. **Date Employed** — required on NI 184
4. **Employer details** — trade name, NIS registration number, service centre code, address, phone
5. **Weekly contribution breakdown per employee** — NI 184 needs Week 1-5 columns per month
6. **Monthly NIS summary totals** — for NI 187 Section B/F

### Do We Need to Revisit the Nuacha API?

**No, the API itself is fine.** The Nuacha API correctly returns NIS class, employee/employer contributions based on weekly earnings. What we need is better **data capture and reporting** around the API results. The calculation engine works; we just need to:
- Store the weekly breakdown per employee per month (we already calculate weekly, we just don't aggregate for reporting)
- Add the missing identity fields so we can populate the forms

### Implementation Plan

#### 1. Database: Add Missing Fields

**`care_team_members` table** — add employee-level NIS fields:
- `nis_number` (text) — National Insurance number
- `date_of_birth` (date) — for NI 184
- `date_employed` (date) — for NI 184
- `is_nis_registered` (boolean, default false) — flag for NIS applicability

**New `employer_settings` table** — one row per family/employer:
- `id`, `family_id` (references profiles)
- `trade_name` (text)
- `employer_registration_number` (text) — 5-digit NIS employer reg
- `service_centre_code` (text)
- `address` (text)
- `phone` (text)

#### 2. UI: Care Team Member Card — NIS Fields

On `CareTeamMemberCard.tsx`, add editable fields:
- NIS Number input
- Date of Birth picker
- Date Employed picker
- NIS Registered toggle

#### 3. UI: Employer Settings Section

Add an "Employer / NIS Settings" section accessible from the Care Plan or a settings page where the family admin enters:
- Trade Name, Employer Registration Number, Service Centre Code, Address, Phone

#### 4. NI 184 Report Generator

Create a service that, given a care plan and a contribution period (month):
- Queries all care team members with `is_nis_registered = true`
- Pulls their payroll entries for that month, grouped by ISO week
- Populates the NI 184 columns: NIS number, name, DOB, date employed, salary for period, Week 1-5 contributions, total
- Generates a downloadable PDF matching the NI 184 layout

#### 5. NI 187 Report Generator

Create a service that, given a contribution period:
- Sums all employee+employer contributions for the period
- Populates: contributions due, number of employees, employer details
- For periods exceeding one month, generates Section F monthly breakdown
- Generates a downloadable PDF matching the NI 187 layout

#### 6. Bank Transfer Recording (from prior plan)

Add `bank_transfer_ref`, `bank_transfer_date`, `bank_transfer_notes` to `payroll_entries` — this feeds into the NI 187 "Amount Paid" and "Method of Payment" sections.

### Files to Create/Modify

| File | Change |
|------|--------|
| **Migration** | Add `nis_number`, `date_of_birth`, `date_employed`, `is_nis_registered` to `care_team_members`; create `employer_settings` table; add bank transfer columns to `payroll_entries` |
| `src/components/care-plan/CareTeamMemberCard.tsx` | NIS fields UI (NIS number, DOB, date employed, NIS toggle) |
| `src/services/care-plans/team/` | `updateNISRegistration` + `updateEmployeeNISDetails` functions |
| `src/components/care-plan/settings/EmployerSettingsForm.tsx` | New component for employer NIS details |
| `src/services/care-plans/reports/ni184Generator.ts` | NI 184 PDF report generator |
| `src/services/care-plans/reports/ni187Generator.ts` | NI 187 PDF report generator |
| `src/components/care-plan/payroll/NISReportsSection.tsx` | UI to select period and download NI 184 / NI 187 |
| `src/types/careTypes.ts` | Add NIS fields to CareTeamMember interface |

### Implementation Order
1. Database migrations (employee NIS fields + employer settings + bank transfer columns)
2. Care team member NIS fields UI
3. Employer settings form
4. NI 184 report generator
5. NI 187 report generator
6. Reports download UI in the Payroll tab

