

## Plan: Fix Unit Economics Dashboard — Subscriptions & Data

### Root Cause Analysis

**Issue 1: Both families show "No subscription" and $0 revenue**
This is an **RLS (Row Level Security) problem**. The `user_subscriptions` table has a policy: `auth.uid() = user_id` — meaning only the subscription owner can read their own record. When the admin loads the Unit Economics page, the query to `user_subscriptions` returns **zero rows** because the admin is not Chanua or Ana Maria. Chanua's subscription already exists in the database but is invisible to the admin.

**Issue 2: Ana Maria Aimey has no subscription**
She needs a `user_subscription` record linking her to the Family Care plan, same as Chanua.

**Issue 3: Angela's caregiver breakdown numbers are inflated**
The database has **25 payroll entries** for Angela within the 4-week window (all created on April 13), when there should be **5** (one per weekday for 1 week). This causes the dashboard to show 50 hrs/wk and $1,750/wk instead of the correct 40 hrs/wk and $1,400/wk. This is a data quality issue from how the entries were created — not a code bug. The expected correct weekly numbers for $35/hr × 8hrs × 5 days are:
- Hours/wk: **40**
- Pay/wk: **$1,400**
- Employer NIS/wk: **$150.60**
- Employee NIS/wk: **$75.30**

### Changes

**1. Database Migration: Add admin RLS policy on `user_subscriptions`**
Add a SELECT policy allowing admins to read all subscription records:
```sql
CREATE POLICY "Admins can view all subscriptions"
ON public.user_subscriptions FOR SELECT
TO authenticated
USING (public.is_current_user_admin());
```

**2. Database Migration: Create subscription for Ana Maria Aimey**
Link user `9874b53e-ea23-4ccb-abed-ddbb0367edf5` to the existing "Family Care" plan ($499/week):
```sql
INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, end_date, payment_method)
SELECT '9874b53e-ea23-4ccb-abed-ddbb0367edf5'::uuid, sp.id, 'active', now(), now() + interval '1 year', 'manual'
FROM subscription_plans sp WHERE sp.name = 'Family Care' AND sp.price = 499.00 LIMIT 1;
```

**3. No code changes needed**
The hook logic already correctly maps "Family Care" to $499/wk revenue. Once the RLS policy is fixed, both families will display their subscription and $499/wk revenue.

### Expected Result After Fix

| Client | Plan | Revenue/wk | Status |
|--------|------|-----------|--------|
| Chanua Johnson | Family Care | $499 | Visible (was hidden by RLS) |
| Ana Maria Aimey | Family Care | $499 | Visible (new subscription) |

### Note on Payroll Data
The 25 duplicate payroll entries for Angela inflate the caregiver breakdown. This is existing data — if you want me to clean it up to the correct 5 entries (1 week, Mon-Fri), I can do that as a separate step.

