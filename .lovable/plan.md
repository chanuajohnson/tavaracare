## What you're asking

Render the two queued scripts in `video_scripts` so their rows flip to `render_status='ready'` with a downloadable MP4 in the `video-renders` bucket.

```
queued: d3469acc-...  "Need a village for care?"  (2026-05-26 01:56)
queued: f4b0f91b-...  "Need a village for care?"  (2026-05-26 01:54)
ready:  c7559279-...  "Untitled village script"   already done
```

## Important caveat — read before approving

The current Remotion composition (`remotion/src/MainVideo.tsx`) uses **hardcoded scene content**. It does NOT read scene copy from the `video_scripts` row identified by `VIDEO_SCRIPT_ID`. The env var is only used by `render-remotion.mjs` to choose which DB row to upload to and flip to `ready`.

So if I render both queued rows right now, both will get the **same MP4** (the hardcoded village script), just stored under each row's storage path. The titles in DB stay as the AI-generated "Need a village for care?" but the visual content is the legacy hardcoded copy.

If that's fine for now (you just want the queued rows resolved so the Download buttons work), proceed with the plan below. If you actually want each queued row rendered with **its own AI-generated scenes**, that's a separate, larger piece of work — making `MainVideo` parametric, fetching the row's `scenes` JSON in the render script, and passing it as `inputProps` to `renderMedia`. Say the word and I'll plan that instead.

## Plan (assumes "render them as-is for now")

1. For each queued script id:
   - Run `node remotion/scripts/render-remotion.mjs` with env:
     - `VIDEO_SCRIPT_ID=<id>`
     - `VIDEO_SLUG=<slug-of-title>`
     - `SUPABASE_URL` (already in env)
     - `RENDER_UPLOAD_TOKEN` (already in env)
   - The script bundles, renders 9s @ 1080x1920, remuxes with `+faststart`, POSTs to the `upload-video-render` edge function, which uploads to `video-renders/{id}/{slug}.mp4` and updates the row to `render_status='ready'`.
2. Verify both rows by querying `video_scripts` for `render_status` and `rendered_url`.
3. Report the public URLs so you can hit Download on each row in `/admin/video-studio` and confirm.

Each render takes roughly 60-120 seconds in the sandbox, so this is two sequential renders (~3-4 min total). I'll run them one after the other and confirm at each step.

## What this does NOT do

- Does not change `MainVideo.tsx`, `Root.tsx`, scene components, or the render script.
- Does not change the edge function or any UI.
- Does not parametrize the composition (that's the larger follow-up I flagged above).
- Does not touch the existing `ready` row.
