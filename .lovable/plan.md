# TikTok video — what I'll make

**Format:** 8 seconds, 1080x1920 (9:16 vertical), 30fps, MP4 — TikTok-safe (min 3s, they prefer 9-15s for reach).

**Most impactful concept for Tavara on TikTok:**
A quiet, emotional "It takes a village" piece. TikTok rewards human pause + a clear line. Slick brand-ad style underperforms; raw, typographic, emotional outperforms.

## Storyboard (8s / 240 frames)

1. **0.0–1.5s** — Black frame. Soft type fades in: *"Caring for someone you love…"*
2. **1.5–3.0s** — Type shifts up. Second line: *"…shouldn't mean carrying it alone."*
3. **3.0–5.0s** — Cut to soft warm gradient (Tavara cream + sage). Large serif word **"village."** scales in with subtle drift.
4. **5.0–7.0s** — Three short stacked lines stagger in: *A coordinated care team. / Daily logs you can trust. / One number to call.*
5. **7.0–8.0s** — Logo lockup: **tavara.care** + tagline *"Care, coordinated."*

## Visual direction

- Palette: warm cream `#F5F0E8`, deep ink `#1A1A1A`, sage accent `#87A878`, soft clay `#C4654A` (sparingly).
- Type: Instrument Serif (display) + Work Sans (body) via `@remotion/google-fonts`.
- Motion: slow blur-in + gentle upward drift. No spinning, no neon, no stock-ad energy. Editorial / cinematic minimal.
- Vertical-safe margins so nothing gets clipped by TikTok UI (caption, like button, profile).

## Language guardrails applied

No "hire," "agency," "staff," "client." Uses "loved one," "care team," "coordinated." No em-dashes. No AI buzzwords. No pricing on the public clip.

## Build steps

1. Scaffold `remotion/` project (Bun, Remotion + transitions + google-fonts, fix musl compositor binary, symlink ffmpeg/ffprobe).
2. Create vertical Composition (1080x1920, 30fps, 240 frames).
3. Build 5 scene components under `src/scenes/` + a persistent warm-gradient background layer.
4. Wire with `<TransitionSeries>` using soft fades.
5. Spot-check frames ~45, ~120, ~210 with `bunx remotion still`.
6. Render to `/mnt/documents/tavara-tiktok-village.mp4` via the programmatic render script (muted, chrome-for-testing).
7. Deliver as `<presentation-artifact>` so you can download and upload to TikTok.

## What I won't do

- No edits to app code, routing, registration, dashboards, or pricing surfaces.
- No auto-publish to TikTok (you said manual post).
- No voiceover / no music (TikTok lets you add trending audio on upload, which performs better than baked-in audio).

Approve and I'll build + render.
