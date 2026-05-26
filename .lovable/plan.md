## Two things

### 1. Render the queued video script
One row is currently `queued`:
- `c7559279-3124-477d-b6b4-e4d51720322e` — "Untitled village script" (content matches the default village scenes that `MainVideo.tsx` already renders).

Steps:
- Run `node remotion/scripts/render-remotion.mjs` to produce `/mnt/documents/tavara-tiktok-village-queued-c7559279.mp4`.
- Upload that MP4 to the existing public `video-renders` Supabase storage bucket at path `village/c7559279-3124-477d-b6b4-e4d51720322e.mp4` using a tiny one-shot Node script with `SERVICE_ROLE_KEY`.
- Update `video_scripts` row: `render_status = 'ready'`, `rendered_url = <public URL>`.
- Verify by re-querying and by spot-checking the file plays.

Note: `MainVideo.tsx` is currently hardcoded to the default village copy, not parameterized from the script row. The queued row's scenes match the defaults so the output is correct. If future queued scripts diverge, parameterizing MainVideo is a separate task — out of scope here.

### 2. Fix the Preview (9:16) on /admin/video-studio
Right now the preview renders everything in `#1E3A8A` (navy) Georgia and doesn't reflect the actual v4 design. Rewrite the `Preview` + `Frame` components in `src/pages/admin/VideoStudioPage.tsx` to match the real Remotion output:

Design tokens (mirror `remotion/src/brand.ts`):
- Background: cream radial gradient `#F5F0E8 → #ECE4D6 → #D9CDB8` (already close, keep)
- Body text: `#0B0B0B` (ink, near-black)
- Highlight color: `#1E3A8A` (navy) — used ONLY on emotional words, always italic when serif

Fonts: load `Cormorant Garamond` (400, italic) + `Karla` (400, 500) via a `<link>` in `index.html` or a one-time `<style>` tag injected by the Preview component. Use:
- `Cormorant Garamond` for all serif text
- `Karla` for eyebrow / footer / small caps

Per-scene rendering:
- **Scene 1** — full block, Cormorant 22px, `ink`, centered, line-height 1.15. No navy.
- **Scene 2** — Cormorant 22px `ink`, but the final word (last token after splitting on whitespace, e.g. "alone.") rendered italic in `accent` navy.
- **Scene 3** — `eyebrow` in Karla 9px tracked 0.3em uppercase `ink`; `word` in Cormorant italic 52px `accent` navy.
- **Scene 4** — 4 stacked lines Karla 12px `ink` left-aligned; the **last** line in Cormorant italic 13px `accent` navy ("One plan. One village.").
- **Scene 5** — wordmark "tavara" Cormorant 26px `ink` + ".care" Cormorant 26px `accent` navy (rendered as one line by splitting tavara.care on the dot); "CARE, COORDINATED." Karla 7px tracked 0.35em uppercase `ink`; tagline Cormorant italic 11px `accent` navy; footer Karla 7px `ink` opacity 0.7.

Implementation notes:
- Keep the `Frame` size (180×320, 9:16-ish) so the existing layout doesn't shift.
- Add a single `useEffect` that injects the Google Fonts `<link>` once if not already present (avoids touching `index.html`).
- No prop/API changes — `Preview` still takes the same `scenes` object.

### Out of scope
- Parameterizing `MainVideo.tsx` from DB-stored scenes
- Auto-render queue worker / scheduled function
- Any backend changes beyond updating the one queued row after upload
