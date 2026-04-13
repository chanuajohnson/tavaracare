
## Plan: Fix the real NIS failure now

### What the issue actually is
This is not a Nuacha problem and not a payroll math problem.

The browser is blocking the request before `nis-payroll-proxy` can run.

From your screenshot, the exact error is:
```text
Request header field x-app-version is not allowed by Access-Control-Allow-Headers in preflight response
```

I checked the code and found the mismatch:

- `src/integrations/supabase/client.ts` sends these global headers on function calls:
  - `x-app-version`
  - `x-client-env`

- `supabase/functions/nis-payroll-proxy/index.ts` currently allows only:
  - `authorization, x-client-info, apikey, content-type`

So the preflight CORS check fails in the browser, and that is why you still get:
```text
Failed to send a request to the Edge Function
```

### What I will change

#### 1. Fix CORS in the NIS edge function
**File:** `supabase/functions/nis-payroll-proxy/index.ts`

Update the function’s CORS headers so they allow the headers the Tavara app is actually sending.

I will add:
- `x-app-version`
- `x-client-env`

And I’ll make the function consistent with the other working edge functions by also including:
- `Access-Control-Allow-Methods: POST, OPTIONS`
- proper CORS headers on every response path

Recommended allowed headers:
```text
authorization, x-client-info, apikey, content-type, x-app-version, x-client-env
```

If needed, I may also include the Supabase runtime headers used by newer clients for extra safety:
```text
x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version
```

#### 2. Redeploy the edge function
After updating the CORS headers, I will redeploy:
- `nis-payroll-proxy`

This is required because the current deployed version is the one rejecting the browser preflight.

#### 3. Verify the recalculation flow end to end
I will verify that:
- clicking **Recalculate NIS** no longer throws the browser CORS error
- the edge function actually receives the request
- the weekly NIS recalculation succeeds
- the affected week updates from `$0.00 / $0.00` to the proper weekly NIS values
- the monthly summary rolls those corrected weekly values up properly

### Expected result after the fix
For the affected paid week, the flow should become:

```text
Browser preflight passes
-> nis-payroll-proxy receives request
-> proxy calls Nuacha
-> weekly NIS returns successfully
-> payroll_entries are updated
-> weekly summary shows non-zero Employee NIS / Employer NIS
-> monthly summary totals update correctly
```

### Files involved
- `supabase/functions/nis-payroll-proxy/index.ts` — fix CORS headers and redeploy
- `src/integrations/supabase/client.ts` — read-only confirmation only; this is where `x-app-version` and `x-client-env` are being sent
- `src/services/care-plans/work-logs/payrollService.ts` — read-only confirmation only; recalculation logic is already calling the NIS service correctly

### Important note
The weekly grouping and monthly rollup are not the cause of this failure.  
The blocker is specifically the CORS mismatch on the edge function.
