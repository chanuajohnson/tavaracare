## Real CORS culprit: `x-client-env`

The previous fix added the `x-app-version` and `x-supabase-client-*` headers, but the browser console in your screenshot shows a different blocked header:

> Request header field **`x-client-env`** is not allowed by Access-Control-Allow-Headers in preflight response.

That's why "Generate draft" still fails with "Failed to send a request to the Edge Function" — the preflight is rejected before the function runs.

## Fix

Add `x-client-env` (and, defensively, `x-client-version`) to `Access-Control-Allow-Headers` in `supabase/functions/blog-ai-draft/index.ts`. Final allow-list:

```
authorization, x-client-info, x-client-env, x-client-version, apikey, content-type,
x-app-version, x-supabase-client-platform, x-supabase-client-platform-version,
x-supabase-client-runtime, x-supabase-client-runtime-version
```

One-line CORS change, no other logic touched. After deploy, "Generate draft" should reach the function.

## Files

- `supabase/functions/blog-ai-draft/index.ts` — extend `corsHeaders["Access-Control-Allow-Headers"]` only.

No DB, no UI, no other function changes.
