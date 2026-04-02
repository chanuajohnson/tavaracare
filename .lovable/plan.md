

## Fix: Add `x-client-env` to Edge Function CORS Headers

### Root Cause

The Supabase client in `src/integrations/supabase/client.ts` sends a custom header `x-client-env` (line 49). The edge function's `Access-Control-Allow-Headers` does not include it, so the browser rejects the preflight OPTIONS request.

### Change

**File: `supabase/functions/transcribe-screening/index.ts`**

Add `x-client-env` to the `corsHeaders` constant's `Access-Control-Allow-Headers` value. The updated header string:

```
"authorization, x-client-info, apikey, content-type, x-client-env, x-app-version, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version"
```

Single line change. The edge function will auto-redeploy.

