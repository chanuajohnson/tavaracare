# Fix: blog comment + reaction blocked by CORS (x-app-version header)

## Root cause
Browser console shows:
> Request header field **x-app-version** is not allowed by Access-Control-Allow-Headers in preflight response.

The Supabase client in this project attaches an `x-app-version` header to every function call. Our previous CORS fix only allowed `authorization, x-client-info, apikey, content-type`, so the preflight `OPTIONS` rejects the POST → "Failed to send a request to the Edge Function" / "Could not register your like".

## Change
Update `Access-Control-Allow-Headers` in both edge functions to include `x-app-version` (and a few standard ones the Supabase JS client commonly sends).

**Files:**
- `supabase/functions/submit-blog-comment/index.ts`
- `supabase/functions/toggle-blog-reaction/index.ts`

**New value:**
```
'Access-Control-Allow-Headers':
  'authorization, x-client-info, apikey, content-type, x-app-version, x-supabase-api-version'
```

No other logic changes. Edge functions auto-deploy.

## Verify
On `/blog/know-someone-who-needs-care-trinidad-tobago`:
1. Submit the comment "I cannot wait to complete this registration." → expect success toast, no CORS error.
2. Click the heart → count increments, stays toggled.
3. Console shows no `Access-Control-Allow-Headers` preflight error.

## Out of scope
No DB, UI, auth, or other function changes. Video-studio work stays paused.
