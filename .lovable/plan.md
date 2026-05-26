## Problem

`/blog/*` shows toasts "Comment failed to post" and the heart button fails to toggle. Console shows:

> Access to fetch at '…/functions/v1/submit-blog-comment' from origin '…lovableproject.com' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: It does not have HTTP ok status.

Same error for `/functions/v1/toggle-blog-reaction`.

## Root cause

Both edge functions import CORS headers from a non-existent module path:

```ts
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
```

`@supabase/supabase-js` has no `/cors` subpath export. The import resolves to `undefined`, so the OPTIONS preflight response (`new Response('ok', { headers: corsHeaders })`) has no `Access-Control-Allow-Origin` / `-Headers` / `-Methods`. The browser rejects the preflight and never sends the real POST.

## Fix (scoped, edge-function-only)

In both `supabase/functions/submit-blog-comment/index.ts` and `supabase/functions/toggle-blog-reaction/index.ts`:

1. Remove the bad import.
2. Define `corsHeaders` locally:

```ts
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
```

No other behavior changes. Edge functions auto-deploy.

## Verify

- Submit a test comment on `/blog/know-someone-who-needs-care-trinidad-tobago` — expect success toast and pending state.
- Click the heart — expect count to increment and stay toggled.
- Confirm no CORS error in console for either endpoint.

## Out of scope

No DB changes, no UI changes, no auth changes, no other functions touched. The video-studio work is paused per your request.
