# Fix: stop chasing CORS headers one at a time

## Root cause
Each retry surfaces a new disallowed header (`x-app-version`, now `x-client-env`, likely more behind it). The Supabase JS client + Lovable preview attach several custom headers we cannot fully enumerate.

## Change
In both `submit-blog-comment` and `toggle-blog-reaction` edge functions, dynamically reflect the headers the browser asks for in the preflight:

```ts
function buildCorsHeaders(req: Request) {
  const requested = req.headers.get('access-control-request-headers');
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
      requested ?? 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
  };
}
```

Use `buildCorsHeaders(req)` in the OPTIONS response and in every JSON response (success + error). This guarantees the allow-list always matches what the browser sent, ending the whack-a-mole.

## Verify
On `/blog/know-someone-who-needs-care-trinidad-tobago`: tap the heart and submit a comment. Expect success toast, no CORS error in console.

## Scope
Only those two edge functions. No DB, UI, auth, or other functions touched.
