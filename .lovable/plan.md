Remove the tagline and footer text from Scene 5 (the final logo slide) so it shows only the `tavara.care` wordmark and the "CARE, COORDINATED." small-caps line.

### Changes
1. **`remotion/src/scenes/Scene5Logo.tsx`** — delete the rendering of `It takes a village to care.` (italic navy tagline) and `All coordinated by your care coordinator. Tavara.` (ink footer). Keep wordmark + "CARE, COORDINATED."
2. **`src/pages/admin/VideoStudioPage.tsx`** — in the Scene 5 frame of the static preview, remove the two corresponding `<div>`s that render `scenes.scene5.tagline` and `scenes.scene5.footer` so the preview matches.
3. **Re-render** the village MP4 via `node remotion/scripts/render-remotion.mjs` to `/mnt/documents/tavara-tiktok-village-v5.mp4` and deliver as an artifact.

### Out of scope
- Leaving the data fields (`scene5.tagline`, `scene5.footer`) in the `Scenes` type and DB — keeping them avoids touching the script editor / saved rows; they're simply not rendered.
- Uploading to the `video-renders` bucket (still blocked on service-role access).
