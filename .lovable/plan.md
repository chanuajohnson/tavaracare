## Goal
Resolve the current Generate Caption failure shown in the browser console. The remaining blocker is CORS preflight rejection because the browser is now sending `x-client-env`, but `generate-social-caption` does not include it in `Access-Control-Allow-Headers`.

## Root cause
The edge function currently allows:

```text
authorization, x-client-info, apikey, content-type, x-app-version
```

The screenshot shows the failing preflight now includes:

```text
x-client-env
```

Because that header is not allowed, the browser blocks the request before the function can generate the caption.

## Implementation plan

1. Update `supabase/functions/generate-social-caption/index.ts`
   - Add `x-client-env` to `Access-Control-Allow-Headers`.
   - Also add the common Supabase client runtime headers so this does not fail again if the client sends additional SDK metadata headers:
     - `x-supabase-client-platform`
     - `x-supabase-client-platform-version`
     - `x-supabase-client-runtime`
     - `x-supabase-client-runtime-version`
   - Keep `Access-Control-Allow-Methods: POST, OPTIONS`.
   - Keep the early `OPTIONS` response.
   - Keep CORS headers on every success and error response.

2. Redeploy the `generate-social-caption` edge function
   - The source change alone is not enough. The deployed function must be updated for the live preview to receive the new CORS headers.

3. Verify the fix
   - Test the deployed function preflight with headers including `x-client-env`.
   - Confirm the response includes `x-client-env` in `Access-Control-Allow-Headers`.
   - Ask you to click Generate again.
   - If CORS clears but generation still fails, the next error will be the real backend response, for example admin role, AI credits, rate limit, or AI gateway response, rather than a browser CORS block.

## Files to change

- `supabase/functions/generate-social-caption/index.ts`

No frontend changes are needed for this specific error.