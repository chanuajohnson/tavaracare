# Fix Tavara Village video — orange → navy on accent words

Scrap the lavender-blue idea. Accent words get **navy `#1E3A8A`** — same brand navy already used elsewhere. The previous render had me using lighter/inconsistent tones on the accents; this locks every accent to the official navy so it reads as one deliberate brand color.

## What changes

### `remotion/src/brand.ts`
- `INK = #1E3A8A` (navy) — unchanged, used for body text.
- `ACCENT = #1E3A8A` (navy) — replaces the old coral `#C44A2E`. Same hex as INK on purpose: one brand color, full strength, no muddy variants.
- Remove any remaining coral/red references.

### Accent treatments stay distinct via TYPE, not color
Variety comes from the typography choices already in place — italic serif, small caps eyebrow, scale jumps — not from a second color:

| Scene | Element | Color | Style cue |
|---|---|---|---|
| 1 | Body | navy | serif, large |
| 2 | Body | navy | serif, large |
| 3 | Eyebrow `IT TAKES A` | navy | uppercase, letter-spaced, small |
| 3 | `village.` | navy | italic serif, oversized |
| 4 | Bullets | navy | sans, medium |
| 5 | `tavara.care` | navy | serif wordmark |
| 5 | `CARE, COORDINATED.` | navy | uppercase, letter-spaced, small |
| 5 | `It takes a village to care.` | navy | italic serif |
| 5 | Footer | navy at 70% opacity | sans, small |

The only tonal break is the footer line at reduced opacity so it sits back from the lockup.

### Text content
**Unchanged.** All copy currently on screen stays exactly as is.

### Video Studio preview
Update `src/pages/admin/VideoStudioPage.tsx` static frames to drop the lighter blue accents — all type renders in navy, matching the MP4.

### Re-render
Output to `/mnt/documents/tavara-tiktok-village-v3.mp4`.

## Out of scope
- No copy, layout, font, or timing changes.
- No changes to AI generator or DB schema.
- v2 file kept; v3 is the new artifact.
