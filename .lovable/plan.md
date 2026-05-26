## Problem

Regenerate succeeded — `Audio ready · 11:32:50` — but `Done — 0 words timed`. Audio file uploaded fine, but `word_timings` saved as `[]`, so the karaoke highlight on the public page will not work.

The edge function calls ElevenLabs `/v1/text-to-speech/{voice}/with-timestamps` and expects:
```
{ audio_base64, alignment: { characters, character_start_times_seconds, character_end_times_seconds }, normalized_alignment }
```
We're getting `audio_base64` (audio works) but `alignment` / `normalized_alignment` are arriving empty or under different keys, so `deriveWordTimings` returns `[]`.

## Plan

### Step 1 — Add diagnostic logging to the edge function (one deploy)
In `supabase/functions/blog-tts-generate/index.ts`, right after `const payload = await ttsRes.json()`:
- Log `Object.keys(payload)` and the shape of `payload.alignment` / `payload.normalized_alignment` (lengths only, not full arrays).
- Keep behavior identical otherwise so we don't burn another ElevenLabs credit unnecessarily.

### Step 2 — Make the parser tolerant of all known response shapes
Update `deriveWordTimings` + its caller so it accepts the three shapes ElevenLabs has used across model/endpoint versions:
1. `{ characters, character_start_times_seconds, character_end_times_seconds }` (current)
2. `{ chars, char_start_times_seconds, char_end_times_seconds }` (older variant)
3. Per-char arrays nested under `payload.alignment.alignment` (turbo variants sometimes double-wrap)

Pick whichever has a non-empty `characters`-like array.

### Step 3 — Surface the failure clearly in the admin card
In `BlogAudioRegenButton.tsx`, when the function returns success but `word_timings.length === 0`, show an amber warning instead of a green "Done" — so we don't silently ship audio without timings again. Already partly there (`Regenerated (no word timings returned)`), just promote it visually.

### Step 4 — One more Regenerate click to verify
Click **Regenerate audio** once. Open the edge function logs to read what alignment keys ElevenLabs actually returned. If step 2's tolerant parser already picked them up, we'll see `Done — N words timed` and the karaoke highlight will work on the public page. If logs reveal a totally new shape, patch the parser to match in a tiny follow-up.

## Out of scope
- Bulk backfill button
- Public-page highlight rendering (already implemented, just needs timings to render)
- Voice / model change

## Files touched
- `supabase/functions/blog-tts-generate/index.ts` (logging + tolerant parser)
- `src/components/admin/BlogAudioRegenButton.tsx` (clearer "no timings" warning)

Total: ~30 lines across 2 files, no schema changes, no new tables, no routing changes.