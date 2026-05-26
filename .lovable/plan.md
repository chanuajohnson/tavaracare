## Why the Download button does nothing

I queried `video_scripts` and only one row exists:
- `render_status = queued`
- `rendered_url = null`

So the button is **`disabled`** (per `disabled={!s.rendered_url}`). Disabled buttons swallow clicks silently — they don't fire `onClick`, so `e.stopPropagation()` never runs. The click registers on the **row** behind the button, which fires `handleLoadScript(s)` and loads that script into the editor card at the top of the page. To you that looks like "it scrolled to the top and nothing downloaded." It didn't scroll — the editor card above just refreshed with the loaded script.

Underneath that, the real problem is: **no render ever lands in storage.** `render-remotion.mjs` writes the MP4 to `/mnt/documents/` on the build sandbox and never uploads it to the `video-renders` bucket or sets `rendered_url` in the DB. So every queued script stays at `rendered_url = null` forever, which is why the button is always disabled.

## Fix — three small, scoped changes

### 1. `remotion/scripts/render-remotion.mjs` — upload + flip the DB row
After the faststart remux pass, if env vars `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `VIDEO_SCRIPT_ID` are set:
- Upload `FINAL_OUT` to `video-renders/{scriptId}/{slug}.mp4` (bucket already exists and is public).
- Get the public URL.
- `update video_scripts set rendered_url = <publicUrl>, render_status = 'ready' where id = <scriptId>`.
- Log the public URL.

If those env vars aren't set, behave exactly as today (just write the local MP4). This keeps the existing one-shot render workflow intact.

I'll re-run the script for the one queued row (`c7559279-...`) so the user has a real `rendered_url` to test the Download button against.

### 2. `src/pages/admin/VideoStudioPage.tsx` — never let the row swallow the download click
Two small UX fixes on the per-row Download button:
- Remove `disabled={!s.rendered_url ...}`. Keep it visually muted via `variant="outline"` + opacity when there's no render, but **always handle the click** so the row's `handleLoadScript` never fires from a download attempt. `handleDownload` already toasts `"No render attached yet."` when `rendered_url` is null — that becomes visible feedback instead of the silent row-load.
- Wrap the Download button + Delete button in a small `<div onClick={(e) => e.stopPropagation()}>` so any click inside that action cluster never bubbles to the row.

No change to `handleDownload`'s fetch → blob → fallback `window.open` logic. That part is correct; it just never had a non-null URL to work with.

### 3. Verify
- Re-render the one queued script with the upload path on, confirm `rendered_url` is set in `video_scripts` and the file is in `video-renders/`.
- In the UI, the row's Download button becomes active, downloads `<slug>.mp4` to the browser, and clicking it does **not** scroll or reload the editor.

## Out of scope
- No changes to `App.tsx`, auth, registration, or any chat-flow files.
- No bucket policy changes (`video-renders` is already public).
- No change to the AI generate-copy path (already fixed).
