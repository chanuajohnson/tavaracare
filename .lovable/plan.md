

## Plan: Fix NIS to Calculate on Weekly Earnings, Not Per-Day

### The Problem
NIS (National Insurance) in Trinidad & Tobago is based on **weekly** earnings. Currently, the system calculates NIS per individual work log at approval time. Angela earns $200/day (8h x $25/hr), which is at the $200 threshold, so each day is marked "NIS: Not applicable." But her **weekly** total is $1,000 -- NIS absolutely applies.

### The Fix
Move NIS calculation from the **approval** step to the **payment processing** step. When you click "Process Payment," the system should:

1. Look up all pending payroll entries for the same caregiver in the same week
2. Sum their gross pay to get weekly earnings
3. Call the NIS API with the weekly total
4. Distribute the NIS deductions across the entries being processed
5. Update each entry with its share of NIS before marking as paid

This matches T&T law: NIS is calculated weekly, not per shift.

### What Changes

**`src/services/care-plans/work-logs/payrollService.ts`** -- `processPayrollPayment`
- Before marking as paid, query all payroll entries for the same caregiver in the same ISO week
- Sum gross pay across all entries in that week
- Call `calculateNIS({ weekly_earnings: totalWeeklyPay })`
- Distribute employee/employer contributions proportionally across entries
- Update each entry with NIS fields, then mark as paid

**`src/services/care-plans/work-logs/approvalService.ts`**
- Remove the per-entry NIS calculation at approval time
- Still store `gross_pay` but leave NIS fields as defaults (will be filled at payment)

**`src/components/care-plan/payroll/ProcessPaymentDialog.tsx`**
- Show a summary: "Weekly earnings for [caregiver]: $X. NIS will be calculated on this total."
- Show the NIS breakdown (employee deduction, employer liability) before confirming

**`src/components/care-plan/payroll/PayrollEntriesTable.tsx`**
- Add a "Process Week" or "Process All Pending" button so you can batch-process all of Angela's pending entries for a week at once, rather than one by one

**`src/components/care-plan/PayrollTab.tsx`**
- Pass additional props/callbacks to support batch processing

### How You'll Use It (After Implementation)

1. Go to Payroll & Hours tab (where you are now)
2. Select Angela's pending entries for the week (or click "Process Week")
3. The system sums the week: 5 days x $200 = $1,000
4. Calls NIS API: $1,000/week = Class 12, employee contribution ~$32.40, employer ~$67.80
5. Shows you the breakdown in the Process Payment dialog
6. You confirm, entries are marked paid with NIS recorded

### Technical Detail
- Weekly grouping uses ISO week (Monday-Sunday) based on `pay_period_start`
- NIS employee contribution is split proportionally across entries (e.g., 5 entries each get 1/5)
- Employer contribution is recorded similarly for liability tracking
- Existing paid entries with NIS already calculated are not recalculated

