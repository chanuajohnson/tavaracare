
## Plan: Document Schedule → Payroll → Payslip Flow and Fix Remaining “Unknown” Caregiver Names

### What’s already in the product today

#### 1. Schedule features
From the care plan Schedule tab and professional schedule view, the app currently supports:

- Weekly/day-based shift viewing
- Shift cards with:
  - shift title
  - time range
  - family name
  - care plan title
  - assigned caregiver
- Add Shift
- Edit Shift
- Delete Shift
- Share schedule via WhatsApp
- Emergency/open shift creation with reason
- Professional “Log Hours” action directly from their own shift
- Daily Care Checklist / Daily Logs tied to schedule dates
- Caregiver filter on the family care-plan schedule view

#### 2. Work log features
The work log flow currently supports:

- Logging hours from a scheduled shift
- Duplicate prevention:
  - if a work log already exists for a shift, the form becomes read-only
- Time entry
- Notes
- Expense entry
- Rate type selection:
  - regular
  - overtime
  - shadow
  - custom multiplier
- Submission provenance tracking:
  - `submitted_by_user_id`
  - `submitted_by_role`
- Professional view now hides Approve/Reject and shows status display instead

#### 3. Payroll features
The Payroll & Hours tab currently supports:

- Two sections:
  - Work Logs
  - Payroll Entries
- Work log review table with:
  - caregiver
  - date
  - hours
  - pay rate
  - total pay
  - expenses
  - status
- Admin/family approval of pending work logs
- Rejection with reason
- Automatic payroll entry generation after approval
- Payroll entry table with:
  - caregiver
  - work dates
  - regular/overtime/holiday hours
  - base rate
  - expenses
  - total amount
  - status
  - entered on
  - paid on
- Process Payment action with payment date
- Filters for:
  - search
  - date range
  - status
  - caregiver

#### 4. Payslip / receipt generation features
There is no separate “payslip engine” by name, but the product already has receipt generation that acts like a payslip/earnings statement:

- Single pay receipt generation from:
  - a work log
  - a payroll entry
- Consolidated receipt generation for multiple payroll entries
- Receipt sharing dialog
- Receipt download/data URI generation
- Multi-select payroll entries for bulk consolidated receipt creation
- Placeholder “Download All Selected”
- Placeholder “Add to Calendar” for payment dates

### What is still broken

Your screenshots and the code both point to one remaining issue:

- The schedule cards can resolve some caregiver names correctly
- But the Professional schedule/work-log/payroll flow still falls back to `Unknown` in some places
- This is happening specifically for other caregivers like Denise Narcis / Angela Newton, even though they are already visible elsewhere in the same care plan

### Root cause I confirmed in code

There are two separate name-resolution systems, and only one of them was fixed:

#### A. Schedule-side shifts
`src/hooks/useCarePlanShifts.tsx`
- already has fallback logic for missing caregiver profiles using:
  - `get_public_professional_profiles`
- this is why some shift cards can now show names correctly

#### B. Work logs / payroll / receipt-side records
These still use older direct profile queries:

- `src/services/care-plans/work-logs/workLogCore.ts`
- `src/services/care-plans/work-logs/payrollService.ts`
- `src/services/care-plans/receiptService.ts`

Those files do this pattern:
- fetch work log / payroll row
- get caregiver ID
- query `profiles` directly
- if the profile query fails or returns nothing, show `Unknown`

That means the schedule view and payroll/work-log view are not using the same fallback strategy.

### Required implementation

#### 1. Centralize caregiver name resolution for work logs and payroll
Create or reuse one shared resolver so all of these use the same logic:

Resolution order:
1. joined caregiver profile from the row
2. fallback from care team member data already loaded for that care plan
3. RPC fallback via `get_public_professional_profiles`
4. only then show `Unknown`

This should be applied to:
- `fetchWorkLogs`
- `fetchPayrollEntries`
- receipt generation lookups

#### 2. Use care team members as a local fallback in the professional flow
In the professional care plan context, we already load care team members.
That means if a work log or payroll row has:
- `care_team_member_id`
- or caregiver_id via care team member

we should resolve the display name from the care team membership before falling back to `Unknown`.

This is likely the missing step causing:
- Denise to show in one part of schedule
- but Unknown in work logs/payroll
- Angela to show as Unknown even though she is on the same care plan

#### 3. Strengthen professional calendar display
Update `src/components/professional/ProfessionalCalendar.tsx` so the displayed caregiver label for shift/work-log-related UI uses a helper like:

```text
1. "You" if shift.caregiverId === current user
2. shift.caregiverDetails.full_name
3. matching care team member professionalDetails.full_name
4. RPC-resolved caregiver name
5. "Unassigned" only if no caregiver exists
```

That prevents assigned shifts from appearing as unassigned/unknown.

#### 4. Align payroll tables and receipt generation with the same names
Update:
- `src/components/care-plan/payroll/table/WorkLogTableRow.tsx`
- `src/components/care-plan/payroll/PayrollEntriesTable.tsx`
- `src/services/care-plans/receiptService.ts`

So the caregiver name shown in:
- work logs table
- payroll entries table
- generated receipt / payslip

is the same resolved caregiver name, not a separate direct-profile lookup.

### Files to update

- `src/services/care-plans/work-logs/workLogCore.ts`
- `src/services/care-plans/work-logs/payrollService.ts`
- `src/services/care-plans/receiptService.ts`
- `src/components/professional/ProfessionalCalendar.tsx`
- possibly a small shared helper file under `src/services/care-plans/` or `src/utils/`

### Expected result after implementation

For both “Care plan for Mum” and “Peltier’s Care Plan 2025”:

- Denise Narcis will show where work logs/schedule detail currently says `Unknown`
- Angela Newton will show where work logs/schedule detail currently says `Unknown`
- professionals will still only see:
  - “You” for their own assigned shift
  - real teammate names for other assigned shifts
- payroll rows and generated pay receipts/payslip-style documents will use the same caregiver names consistently

### Technical notes
- I will not touch protected routing or registration files
- This is a scoped fix inside schedule/professional/payroll services only
- No database schema change is required for this remaining name-resolution fix
- The issue is now a frontend/service resolution mismatch, not missing care plan data

### After the fix, I will verify
1. Work Logs click from Tricia’s profile hub still lands on Schedule
2. “Care plan for Mum” shows Denise instead of Unknown
3. “Peltier’s Care Plan 2025” shows Angela Newton instead of Unknown
4. Payroll & Hours rows use the same caregiver names
5. Generated pay receipt/payslip uses the same caregiver names too
