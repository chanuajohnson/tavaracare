## Fix harsh blog narration — full restore

The "harsh" sound is the browser's `speechSynthesis` fallback. It only kicks in because ElevenLabs is returning a blocked/quota response for every new post (only one old post has a cached MP3). Plan restores ElevenLabs as primary, adds a warm OpenAI TTS middle layer, tunes the browser fallback, and backfills existing posts.

### 1. Diagnose + restore ElevenLabs (primary)
- In `supabase/functions/blog-tts-generate/index.ts`, add a one-time `/v1/user` check that logs subscription status + character count on failure so we can see whether the key is exhausted vs blocked.
- Return the real ElevenLabs error reason in the `provider_unavailable` response (e.g. `quota_exceeded`, `detected_unusual_activity`) so the admin UI can surface it.
- If `ELEVENLABS_API_KEY` is exhausted or locked, prompt user to paste a fresh key via the secrets tool. Once valid, every new post auto-caches an MP3 (current happy path).

### 2. Add OpenAI TTS fallback via Lovable AI Gateway
- New middle layer in `blog-tts-generate`: if ElevenLabs returns blocked/429/quota, call `https://ai.gateway.lovable.dev/v1/audio/speech` with `gpt-4o-mini-tts`, voice `nova` (warm female, closest to current Sarah). Cache the resulting MP3 to the same `blog-audio` bucket and `blog_audio` row, tagged `voice_id = 'openai-nova'`.
- Only if BOTH providers fail does the function return `provider_unavailable` + `fallback_text` for browser TTS.

### 3. Tune browser `speechSynthesis` fallback (last resort)
In `src/components/blog/BlogAudioPlayer.tsx`:
- Wait for `voiceschanged` before speaking (Chrome bug — voices load async).
- Pick best available voice in this order: `Samantha`, `Google UK English Female`, `Microsoft Aria Online`, `Microsoft Jenny Online`, `Karen`, `Moira`, then any `en-*` female, then default.
- Set `utter.rate = 0.95`, `utter.pitch = 1.0`, `utter.volume = 1.0`.
- Chunk text at sentence boundaries (~200 chars each) and queue utterances — avoids Chrome's 15-sec cutoff that causes the clipped/harsh effect.

### 4. Admin backfill button
- New `src/components/admin/BlogAudioBackfillButton.tsx` on `/admin/blog-analytics`: loops all published `blog_posts`, calls `blog-tts-generate` with `force: true`, shows progress (`3 / 24 generated`). Skips posts that already have a valid `blog_audio` row unless "force regenerate all" is checked.

### Files touched
- `supabase/functions/blog-tts-generate/index.ts` — diagnostic + OpenAI fallback layer
- `src/components/blog/BlogAudioPlayer.tsx` — voice picker, rate/pitch, sentence chunking, voiceschanged wait
- `src/components/admin/BlogAudioBackfillButton.tsx` — new
- `src/pages/admin/BlogAnalyticsPage.tsx` (or wherever the analytics page lives) — mount the button

### Not changed
- `useBlogAudio.ts` shape, `blog_audio` table, storage bucket, RLS, UTM generator (separate feature).

### Open question for you
ElevenLabs key may simply be exhausted on the free tier (only 1 cached post, all newer attempts falling back). Want me to:
(a) build all four layers now, then check the key and tell you if it needs rotating, **or**
(b) check the key first, and if it's just exhausted, only do steps 3 + 4 (browser tuning + backfill) once you top up?

(a) is more resilient long-term; (b) is the minimum fix.