

## Fix: AI Summary CORS + Wrong Gateway URL

### Two Problems

1. **CORS block**: The Supabase JS client sends headers like `x-app-version`, `x-supabase-client-platform`, etc. that are not listed in the edge function's `Access-Control-Allow-Headers`. The preflight `OPTIONS` response rejects the request before it even runs.

2. **Wrong AI gateway URL**: The function calls `https://api.lovable.dev/v1/chat/completions` — the correct URL is `https://ai.gateway.lovable.dev/v1/chat/completions`.

### Fix (single file change)

**File: `supabase/functions/transcribe-screening/index.ts`**

1. Update `corsHeaders` to include all Supabase client headers:
```ts
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-app-version, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
```

2. Fix the AI gateway URL from `https://api.lovable.dev/v1/chat/completions` to `https://ai.gateway.lovable.dev/v1/chat/completions`

3. Add better error logging when the AI response is not ok, so failures are visible in edge function logs instead of silently swallowed.

No other files need to change. The edge function will be auto-deployed after the code update.

