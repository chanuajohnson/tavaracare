

## Plan: Fix Weekly NIS Calculation and Process Payment Dialog

### What I Found in the Database

Angela's entries for the week of March 30 – April 5, 2026:

```text
Date       | Rate   | Gross  | Status
Mar 30     | $35/hr | $280   | PAID (processed before weekly logic existed)
Mar 31     | $35/hr | $280   | PAID (processed before weekly logic existed)
Apr 1      | $25/hr | $200   | pending (DUPLICATE - 2 entries with same date!)
Apr 1      | $25/hr | $200   | pending (DUPLICATE)
Apr 2      | $25/hr | $200   | pending
Apr 3      | $25/hr | $200   | pending
```

**Why the dialog shows $800 and "NIS Not Applicable":**
1. The weekly query only fetches **pending** entries (4 entries × $200 = $800)
2. It ignores the 2 already-paid entries ($560) from the same ISO week
3. The NIS API call is **silently failing** (caught and swallowed), so it defaults to "not applicable" even though $800 > $200
4. April 1 has a duplicate entry
5. April 1-3 entries are at $25/hr instead of $35/hr (rate mismatch)

### Root Causes to Fix

**1. NIS weekly total must include ALL entries for the week, not just pending**
T&T law requires NIS on total weekly earnings. If $560 was already paid earlier in the week, the remaining $800 must still be calculated against the full $1,360 weekly total. Only the NIS for the pending entries gets recorded on those entries.

**2. NIS API failure is silently swallowed**
Both the dialog preview and the payment processing catch NIS errors and continue with "not applicable." This is misleading. The dialog should show an error state like "NIS calculation failed — check connection" instead of pretending it's not applicable.

**3. Dialog needs week context**
User cannot see which week is being processed. The dialog should show the week range (e.g., "Week of Mon Mar 30 – Sun Apr 5") and list the entries being included.

**4. No way to select/filter by week**
User should be able to pick a week or see entries grouped by week in the payroll table.

### Implementation

#### A. Fix `fetchWeeklyPendingEntries` in `payrollService.ts`
- Fetch ALL entries for the caregiver in the same ISO week (all statuses), not just pending
- Calculate `weeklyTotal` from all entries (paid + pending)
- Return both `allWeekEntries` (for NIS total) and `pendingEntries` (for processing)
- Return the week range dates (weekStart, weekEnd) for display
- Return already-paid amounts so the dialog can show context

#### B. Fix `processWeeklyPayrollPayment` in `payrollService.ts`
- Use the full weekly total (including already-paid entries) for the NIS API call
- Only update and distribute NIS across the **pending** entries being processed
- Subtract NIS already applied to paid entries in the same week (if any) to avoid double-counting

#### C. Fix NIS error handling in `ProcessPaymentDialog.tsx`
- Stop swallowing NIS errors silently
- Add an `nisError` state that shows: "NIS calculation failed. Payment will proceed without NIS deductions. You can retry or process anyway."
- Show the week range: "Week of Mon Mar 30 – Sun Apr 5"
- Show breakdown: "Already paid this week: $560 | Pending: $800 | Weekly total: $1,360"
- Show individual entry dates in the preview

#### D. Fix NIS error handling in `processWeeklyPayrollPayment`
- When NIS API fails, show a clear warning toast instead of silently proceeding
- Give the user the option to retry or proceed without NIS

#### E. Edge function verification
- Test the `nis-payroll-proxy` edge function to confirm it's deployed and the `NUACHA_API_KEY` secret is set
- If the function is not deployed, deploy it
- Add better error logging in the edge function

### Files to Change

| File | Change |
|------|--------|
| `src/services/care-plans/work-logs/payrollService.ts` | Fix weekly query to include all statuses for NIS total; only process pending entries |
| `src/components/care-plan/payroll/ProcessPaymentDialog.tsx` | Show week range, entry breakdown, NIS error state instead of silent "not applicable" |
| `supabase/functions/nis-payroll-proxy/index.ts` | Verify deployment; add error logging |

### Data Issues to Address
- **Duplicate April 1 entry**: will note this for the user to clean up manually or add dedup logic
- **Rate mismatch ($25 vs $35)**: the approved work logs set the rate; this is upstream data, not a payroll bug

### What the Dialog Will Look Like After

```text
Process Weekly Payment
──────────────────────
Angela Newton Collymore
Week: Mon Mar 30 – Sun Apr 5, 2026

Already paid this week:     $560.00 (2 entries)
Pending entries to process: $800.00 (4 entries)
Weekly total for NIS:       $1,360.00

NIS Class 14
  Employee NIS deduction:   -$XX.XX
  Employer NIS liability:    $XX.XX
  Net pay (this batch):      $XXX.XX

[Payment Date: April 13th, 2026]
[Cancel] [Process 4 Entries]
```

