## Root cause

The browser preflight to `generate-video-script` is rejected:

> Request header field `x-client-env` is not allowed by Access-Control-Allow-Headers in preflight response.

The Supabase JS client adds `x-client-env` (alongside `x-client-info`, `apikey`, `authorization`, `content-type`) on every `functions.invoke` call. The edge function's `Access-Control-Allow-Headers` doesn't list it, so the preflight 4xx's and the POST never fires. The UI then shows the generic toast "AI generation failed. Try a different topic."

This is purely a CORS header allow-list issue in the edge function — the AI logic itself is fine.

## Fix — one edge function, one line

### `supabase/functions/generate-video-script/index.ts`
Add `x-client-env` to the `Access-Control-Allow-Headers` list in `corsHeaders`:

```
"Access-Control-Allow-Headers":
  "authorization, x-client-info, apikey, content-type, x-app-version, x-client-env",
```

Nothing else in the function changes. The OPTIONS handler already returns `corsHeaders`, so the preflight will start passing immediately after redeploy.

### Verify
1. Redeploy `generate-video-script`.
2. On `/admin/video-studio`, enter a topic and click **Generate copy**. The preflight should return 204 with the updated allow-list, the POST should hit the function, and the 5-scene JSON should populate the editor.
3. Confirm no `x-client-env` CORS error in the console for that request.

## Out of scope
- No changes to the Download flow, `upload-video-render`, the render script, or `VideoStudioPage.tsx`.
- No changes to any other edge function (none of the others are being called from this page right now). If a future CORS-blocked function shows up, we apply the same one-line allow-list fix there.
