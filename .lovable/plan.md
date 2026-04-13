

## Plan: Fix NIS Edge Function + Monthly Summary Improvements

### Problem 1: "Failed to send a request to the Edge Function"
The `nis-payroll-proxy` edge function boots but never receives requests from the client. The logs show only boot/shutdown events with zero request logs. This is a deployment issue — the function needs to be redeployed.

**Fix:** Redeploy `nis-payroll-proxy` edge function. No code changes needed — the function code is correct.

### Problem 2: Monthly Summary shows $0 for NIS columns
The existing weekly entries in the database have `employee_contribution: 0` and `employer_contribution: 0` because they were processed when the edge function was failing. After fixing Problem 1, clicking "Recalculate NIS" will backfill the correct values. The monthly summary already aggregates these values — once they're non-zero, the monthly view will show correct totals.

### Steps

1. **Redeploy edge function** — `nis-payroll-proxy` to fix client connectivity
2. **Verify** the function responds to requests by checking logs after deployment
3. **Test** "Recalculate NIS" button on the Mar 30–Apr 5 week to confirm it successfully calls the API and updates the $0 values to Class 10 ($19.80 employee / $41.25 employer)

### Files Modified
| File | Change |
|------|--------|
| `supabase/functions/nis-payroll-proxy/index.ts` | Redeploy (no code change needed) |

### Expected Result
After redeployment and clicking "Recalculate NIS":
- Weekly NIS Summary shows: Class 10, Employee $19.80, Employer $41.25
- Monthly Summary updates to show correct NIS totals instead of $0.00

