## Plan: Fix Generate Caption CORS failure

The screenshot shows the remaining failure is not the OPTIONS status anymore. The browser is rejecting the preflight because the request includes `x-app-version`, but the edge function's `Access-Control-Allow-Headers` does not allow that header.

## Changes to make

1. Update `supabase/functions/generate-social-caption/index.ts`
   - Add `x-app-version` to `Access-Control-Allow-Headers`.
   - Keep `Access-Control-Allow-Methods: POST, OPTIONS`.
   - Keep the early `OPTIONS` return with HTTP 204.
   - Keep CORS headers on every success and error response.

2. Redeploy `generate-social-caption`
   - Deploy the updated edge function so the live preview receives the new preflight headers.

## Verification

1. Click Generate again on `/admin/blog/062d8677-0799-435d-af04-10c546137326`.
2. Confirm the console no longer shows:
   - `Request header field x-app-version is not allowed by Access-Control-Allow-Headers`
3. If generation still fails after CORS is cleared, the next visible error should be the real function response, such as auth, admin role, AI credits, or gateway response, instead of a browser CORS block.