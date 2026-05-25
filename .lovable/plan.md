## Village video v4 — color + typography pass

You picked "Magazine warm" (the current Instrument Serif + Work Sans pair), but also explicitly said you want different fonts. I'm treating "you choose" as license to pick a fresh editorial pair that still reads warm and trustworthy: **Cormorant Garamond** (display serif) + **Karla** (body sans). If you'd rather lock to a different pair, say the word before I render.

### 1. Color system rewrite (`remotion/src/brand.ts`)

Replace the all-navy palette with a real two-color system:

- `ink: "#0B0B0B"` — near-black for all body/headline text (slightly warm of pure #000 so it doesn't vibrate on the cream backdrop)
- `accent: "#1E3A8A"` — navy, used **only** on highlight words
- `cream`, `creamMid`, `creamDeep` — unchanged backdrop
- Remove the `inkSoft / muted / sage` navy aliases; point them at `ink` so any leftover usage goes black by default

### 2. Highlight words (navy, everything else black)

Per your "key emotional words only" pick:

| Scene | Highlight (navy) | Everything else (black) |
|---|---|---|
| Scene 1 — "Caring for someone you love…" | none | full line black |
| Scene 2 — "shouldn't mean carrying it alone." | `alone.` (italic, navy) | rest black |
| Scene 3 — "It takes a **village.**" | `village.` (italic, navy) | "It takes a" eyebrow black |
| Scene 4 — list | `One plan. One village.` (final line navy) | first three lines black |
| Scene 5 — logo | `.care` navy + "It takes a village to care." italic tagline navy | `tavara` wordmark, "CARE, COORDINATED.", and footer all black |

This fixes the orange `.care` you saw — it becomes navy.

### 3. Typography swap (`remotion/src/fonts.ts`)

```text
serifFamily  →  @remotion/google-fonts/CormorantGaramond  (weights 400, 500; italic 400)
sansFamily   →  @remotion/google-fonts/Karla              (weights 300, 400, 500)
```

No other scene code changes needed — every scene already reads `serifFamily` / `sansFamily` from `fonts.ts`.

### 4. Re-render

Render to `/mnt/documents/tavara-tiktok-village-v4.mp4` via the existing `scripts/render-remotion.mjs`. Spot-check a frame from each scene first (`bunx remotion still`) to confirm the navy is only on the highlight words before committing to the full ~30s render.

### Out of scope

- No changes to scene timing, motion, layout, durations, or `SceneBackdrop`.
- No changes to the global render-queue / Remotion Lambda work-in-progress — this is a source-only edit on the Village composition.
