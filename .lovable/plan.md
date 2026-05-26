## Goal

Take the 3 rows currently sitting in `video_scripts` with `render_status='queued'` and produce real MP4s in the `video-renders` storage bucket, with each row flipped to `render_status='ready'` and `rendered_url` populated. The existing render pipeline (`remotion/scripts/render-remotion.mjs` + `upload-video-render` edge function) is wired correctly, but the Remotion scenes are currently hardcoded to one specific script. We need to make them read script data, then loop over the queued rows.

## Queued scripts to render

1. **Registering for Tavara** — `26a9e011…` — "How to register"
2. **Care for your loved ones** — `e69223bb…` — landing video
3. **Diamond Vale Family Care** — `a0dccdfa…` — locations video

(Confirmed via DB query against `video_scripts` where `render_status='queued'`.)

## What changes

### 1. Parameterize the Remotion composition

- `remotion/src/MainVideo.tsx` — accept a `scenes` prop matching the `village-8s` template schema:
  ```
  { scene1: string, scene2: string, scene3: { eyebrow, word },
    scene4: string[], scene5: { tagline, footer } }
  ```
  Pass through to scene components.
- `remotion/src/scenes/Scene1Line1.tsx` and `Scene2Line2.tsx` — accept `text` prop, split on `\n` for the two-line layout instead of hardcoded copy.
- `remotion/src/scenes/Scene3Village.tsx` — accept `eyebrow` and `word` props.
- `remotion/src/scenes/Scene4List.tsx` — accept a `bullets: string[]` prop, render N staggered lines (last bullet in accent color).
- `remotion/src/scenes/Scene5Logo.tsx` — accept `tagline` and `footer` props (footer rendered as small line under the lockup).
- `remotion/src/Root.tsx` — register the composition with `defaultProps` and a `calculateMetadata` (or just static defaultProps) so the existing template still renders standalone.

Visual design, animations, fonts, brand colors, durations — all unchanged.

### 2. Make the render script script-aware

- Update `remotion/scripts/render-remotion.mjs` to:
  - Read `VIDEO_SCRIPT_ID` from env, fetch that row from Supabase using the service role key, and pass `inputProps: { scenes }` into `selectComposition` + `renderMedia`.
  - Use the row's `title` (slugified) as `VIDEO_SLUG` when not explicitly provided.
  - Keep the existing upload-to-edge-function path so each render finishes by flipping the row to `ready`.

### 3. Render & upload all 3 queued scripts

- Add a small driver script `remotion/scripts/render-queue.mjs` that queries `video_scripts` for `render_status='queued'` and invokes the render pipeline once per row (sequentially, to stay within sandbox memory).
- Run it once. Each render takes ~30-60s, so 3 scripts ≈ 2-3 minutes total.
- Verify each row ends with `render_status='ready'` and a populated `rendered_url`, and that the Script library in `/admin/video-studio` shows "ready" + working Download MP4 buttons.

### 4. Secrets check

The `upload-video-render` function requires `RENDER_UPLOAD_TOKEN`. I will confirm it's set before running; if it isn't I'll stop and ask you to add it (same token both sides). `SUPABASE_SERVICE_ROLE_KEY` is auto-available to edge functions.

## What does NOT change

- No DB schema changes, no new migrations.
- No UI changes to `/admin/video-studio` — the existing Script library already polls `render_status` and surfaces the Download MP4 button.
- The `upload-video-render` edge function stays as-is.
- No routing, auth, or registration code is touched.

## Risk / rollback

- Scene parameterization is additive (default props preserve current behavior), so the standalone `bunx remotion render` still works.
- If a single script fails to render, the driver continues with the next one and reports which IDs succeeded/failed. Failed rows stay `queued` and can be retried.
