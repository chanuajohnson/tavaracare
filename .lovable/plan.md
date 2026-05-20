## Fix CORS preflight on `generate-social-caption`

**Root cause:** The edge function's `OPTIONS` handler returns `corsHeaders` that only include `Access-Control-Allow-Origin` and `Access-Control-Allow-Headers`. It's missing `Access-Control-Allow-Methods`, and the response body `"ok"` may be sent without the right shape. The browser logs `Response to preflight request doesn't pass access control check: It does not have HTTP ok status` — meaning the OPTIONS response is failing (likely the function is crashing before reaching the OPTIONS return, or the headers are rejected).

**Scope:** `supabase/functions/generate-social-caption/index.ts` only.

**Changes:**
1. Expand `corsHeaders` to include:
   - `Access-Control-Allow-Origin: *`
   - `Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type`
   - `Access-Control-Allow-Methods: POST, OPTIONS`
2. Ensure the `OPTIONS` branch returns `new Response(null, { status: 204, headers: corsHeaders })` — handled before any other code that could throw.
3. Confirm every `return new Response(...)` (success + all error branches) already spreads `corsHeaders`. They do, but verify after edit.
4. Redeploy the function via `supabase--deploy_edge_functions`.

**Out of scope:** No changes to `SocialSharePanel.tsx`, schema, or other functions.

**Verification:**
1. Deploy function.
2. Open a post at `/admin/blog/:id`, click **Generate** → no CORS error in console; caption appears or a clean toast error (401/402/429) shows.
3. Check edge function logs for the actual invocation to confirm it ran.
