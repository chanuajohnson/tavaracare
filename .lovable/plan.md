## Three bugs to fix

### 1. "AI generation failed" — CORS preflight blocks `x-app-version`
Console shows: `Request header field x-app-version is not allowed by Access-Control-Allow-Headers in preflight response` for `generate-video-script`.

`supabase/functions/generate-video-script/index.ts` imports `corsHeaders` from `npm:@supabase/supabase-js@2/cors` (a non-existent path that resolves to a default that omits `x-app-version`). The Supabase JS client now sends `x-app-version`, so every call dies in preflight.

Fix: define a local `corsHeaders` constant in that edge function:
```ts
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-app-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
```
Audit the other video-studio edge functions (`render-video-script`, etc.) and apply the same fix where they import from the same bad path.

### 2. Download MP4 button "scrolls to top, nothing downloads"
In `src/pages/admin/VideoStudioPage.tsx` the Download button sits inside a clickable row (`onClick={() => handleLoadScript(s)}`). `e.stopPropagation()` is present but the button has no explicit `type`, and when `handleDownload` throws (or `rendered_url` is empty after a fresh queue without an upload) the click bubbles into a re-render that resets scroll. Also, `fetch(s.rendered_url)` against the Supabase storage URL can be blocked by storage CORS for cross-origin XHR, returning an opaque/failed response that the user perceives as "nothing happened."

Fix:
- Add `type="button"` to the Download button and the Delete button.
- Add `e.preventDefault()` alongside `stopPropagation()`.
- In `handleDownload`, if `fetch` fails (CORS or network), fall back to opening `s.rendered_url` directly in a new tab with `window.open(s.rendered_url, "_blank", "noopener")` so the user still gets the file.
- Show a clearer toast on success ("Download started") and on the "no render yet" case.

No backend/storage CORS changes — fallback handles it.

### 3. Downloaded MP4 won't play in QuickTime
QuickTime only plays H.264 MP4 with `yuv420p` pixel format and a `faststart`-positioned moov atom. The current render script (`remotion/scripts/render-remotion.mjs`) uses `codec: "h264"` but doesn't pin pixel format or faststart, so Remotion's default can produce a file QuickTime rejects (plays in Chrome/VLC fine, which matches "video preview works in the Files panel but not in QuickTime").

Fix: in the render script, pass:
```ts
pixelFormat: "yuv420p",
x264Preset: "medium",
muted: true,
```
and post-process with ffmpeg to move the moov atom:
```bash
ffmpeg -i out.mp4 -c copy -movflags +faststart out.faststart.mp4
```
Wire this into the render script so the final file written to `/mnt/documents/` is always QuickTime-compatible. Re-render `tavara-tiktok-village-v5` and replace it.

## Files touched
- `supabase/functions/generate-video-script/index.ts` (+ any sibling video functions using the same broken cors import)
- `src/pages/admin/VideoStudioPage.tsx`
- `remotion/scripts/render-remotion.mjs`

## Out of scope
- Changing storage bucket CORS policy (fallback `window.open` avoids it)
- Refactoring the script-row click target
