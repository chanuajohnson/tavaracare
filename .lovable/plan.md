# Karaoke word highlight in the blog audio player

Drop the video-render pipeline. Instead, make the existing "Listen to this article" player highlight each word in the post body as it's spoken — you screen-record the page to get short video clips.

## What changes

**1. Capture word-level timings during TTS generation**
Extend `supabase/functions/blog-tts-generate/index.ts` to call ElevenLabs' `/text-to-speech/{voice}/with-timestamps` endpoint instead of the plain TTS endpoint. The response includes a per-character `alignment` block (`characters[]`, `character_start_times_seconds[]`, `character_end_times_seconds[]`). Group characters into words on whitespace → array of `{ word, start, end, charStart, charEnd }`.

**2. Store the timings**
Add `word_timings jsonb` column to existing `blog_audio` table (no new table). Backfill happens naturally on next generation; old rows without timings just don't highlight (graceful fallback).

**3. Highlight in the player**
`BlogAudioPlayer` already tracks `currentTime`. When `word_timings` is present:
- Maintain a `currentWordIndex` derived from `currentTime` (binary search the timings array each `timeupdate`).
- Emit the index via a lightweight context/store (e.g. `BlogReadingContext`) scoped to the post page.

**4. Render the highlight on the article body**
`BlogPostPage` renders the body through `ReactMarkdown`. Add a custom `text` renderer in `markdownComponents` that:
- Splits the text node into words, wraps each in `<span data-word-index={globalIdx}>`.
- Each span subscribes to the reading context; when `globalIdx === currentWordIndex` it gets a highlight class (e.g. soft accent background + slightly bolder weight); when `< currentWordIndex` it stays "read" tone (muted); unstarted words are normal.
- Auto-scrolls the active word into view (`scrollIntoView({ block: 'center', behavior: 'smooth' })`) with throttling so the screen recording follows along.

Global word indexing is built once per render by walking the text in source order and matching against the timings array. The narration text used for TTS (title + description + stripped body) must be matched against the rendered body — easiest: store the exact `narration_text` alongside `word_timings`, then the renderer matches body words to a sub-range of that array (skip the title/description prefix words). Falls back to no-highlight on mismatch.

**5. Admin control**
In `/admin/blog` (or wherever the existing "Regenerate audio" button lives), the same button now regenerates with timings. Add a small "Highlight: on/off" toggle on the player itself for the reader — defaults on when timings exist.

## What stays untouched

- Routing, auth, registration flows, chat engine — none touched.
- Existing `blog_audio` rows keep working; missing `word_timings` just disables highlight.
- No new tables, no new edge function, no Remotion, no GitHub Actions, no video rendering.
- `BlogAudioPlayer` UI stays the same; only adds timing-driven state.

## Out of scope (say so if you want any of these later)

- Pre-rendering MP4 videos (the earlier Remotion/GH-Actions plan).
- Auto-clipping the post into 15–30s excerpts.
- Burned-in captions for downloaded videos.

## Files touched

- `supabase/functions/blog-tts-generate/index.ts` — switch to `with-timestamps`, derive word timings, persist them.
- Migration: `alter table blog_audio add column word_timings jsonb, add column narration_text text`.
- `src/components/blog/BlogAudioPlayer.tsx` — expose `currentTime`/`currentWordIndex` via context.
- New `src/components/blog/BlogReadingContext.tsx`.
- `src/pages/blog/BlogPostPage.tsx` — wrap article in provider; add `text` renderer to `markdownComponents` that wraps words in spans.
- `src/index.css` — `.blog-word-active` / `.blog-word-read` styles using semantic tokens.

Approve and I'll ship it as one migration + the code changes. Screen recording then gives you the short clips with the karaoke effect, no render infra needed.
