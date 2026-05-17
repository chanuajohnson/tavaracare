## Goal

Give every published blog post a built-in audio player so readers can listen instead of reading. Player shows total duration, current time, play/pause, stop, and a seek bar. Audio is generated once per post (on first request), cached, and re-served instantly afterwards.

## User experience

On `BlogPostPage`, directly under the article header (above the markdown body) we add a compact `BlogAudioPlayer` card:

```text
┌─────────────────────────────────────────────────┐
│ 🎧  Listen to this article          12:48 total │
│ [▶ Play] [■ Stop]  ──────●────────────  03:21   │
│ Narrated by Sarah · ElevenLabs                  │
└─────────────────────────────────────────────────┘
```

- First click on Play: shows "Preparing audio…" spinner while the edge function generates + uploads the MP3 (only happens once per post per voice).
- Subsequent visits / users: audio is already cached in Supabase Storage, streams instantly.
- Play / Pause toggle, Stop (resets to 0:00), seek bar (click to scrub), playback speed dropdown (1x / 1.25x / 1.5x).
- Player is sticky-optional: stays inline; we are NOT adding a floating mini-player in this pass (can come later).

## Architecture

```text
Browser ──GET──► blog_audio row?
   │                │
   │      hit ◄─────┘ (has audio_url + duration)
   │      └──► <audio src=audio_url> play
   │
   └─ miss ──POST──► edge fn `blog-tts-generate`
                       │
                       ├─ load blog_posts row (title + body)
                       ├─ strip markdown → plain text
                       ├─ ElevenLabs TTS (eleven_turbo_v2_5, voice Sarah)
                       ├─ upload MP3 → storage bucket `blog-audio/<post_id>/<voice>.mp3`
                       ├─ probe duration (estimate from text length, refined client-side on loadedmetadata)
                       └─ upsert blog_audio { post_id, voice_id, audio_url, duration_seconds, char_count, generated_at }
                       returns { audio_url, duration_seconds }
```

Regeneration: when the admin updates a post body, we mark the cached audio as stale (compare `blog_posts.updated_at` vs `blog_audio.generated_at`); the player shows a small "Audio out of date — regenerate" hint for admins only, with a button that re-invokes the edge function with `force: true`.

## Database

New migration: `blog_audio` table.

```sql
create table public.blog_audio (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  voice_id text not null default 'EXAVITQu4vr4xnSDxMaL', -- Sarah
  audio_url text not null,
  duration_seconds numeric not null,
  char_count integer not null,
  generated_at timestamptz not null default now(),
  unique (post_id, voice_id)
);
alter table public.blog_audio enable row level security;

create policy "Public can read audio for published posts"
on public.blog_audio for select using (
  exists (
    select 1 from public.blog_posts p
    where p.id = blog_audio.post_id
      and p.status = 'published'
      and p.published_at <= now()
  )
);
-- writes only via edge function (service role); no insert/update policy for anon.
```

New storage bucket `blog-audio` (public read).

## Edge function: `supabase/functions/blog-tts-generate/index.ts`

- Accepts `{ slug | post_id, force?: boolean, voice_id?: string }`.
- Auth: public POST (rate-limited by IP), but `force=true` requires an admin JWT.
- Loads post, returns cached row if present and not stale and `!force`.
- Otherwise: strip markdown (remove `#`, links → text, blockquote markers, table pipes, code fences), prepend `${title}. ${description}.`, cap at 4500 chars (ElevenLabs single-request limit; longer posts use request stitching across 2-3 chunks then concat MP3 bytes).
- Calls ElevenLabs `text-to-speech/{voice}?output_format=mp3_44100_128` with `eleven_turbo_v2_5`.
- Uploads to `blog-audio/<post_id>/<voice_id>.mp3`, upserts `blog_audio` row.
- Returns `{ audio_url, duration_seconds, cached: boolean }`.

Estimated duration = chars / 14 (ElevenLabs averages ~14 chars per second of speech). Refined to true duration once the `<audio>` element fires `loadedmetadata`, and we PATCH the row from the client via a second edge endpoint `blog-tts-confirm-duration` (admin-only) — or simpler: trust the client-side `audio.duration` for display and skip the round-trip. **Decision: skip the round-trip; estimate server-side, replace with real value client-side once metadata loads.**

## Frontend

New files:
- `src/hooks/useBlogAudio.ts` — `useBlogAudio(postId, slug)` returns `{ audioUrl, durationEstimate, isPreparing, prepare(), error }`. On mount: queries `blog_audio` directly via supabase-js (RLS allows). On `prepare()`: invokes the edge function and refetches.
- `src/components/blog/BlogAudioPlayer.tsx` — the player UI. Uses a single `<audio ref>` element (not visible), custom controls built from existing shadcn `Button`, `Slider`, `Progress`. Tracks `isPlaying`, `currentTime`, `duration`, `playbackRate`. Cleans up on unmount.
- `src/lib/blog/formatTime.ts` — `mm:ss` formatter.

Edited:
- `src/pages/blog/BlogPostPage.tsx` — render `<BlogAudioPlayer post={post} />` between the header block and the markdown body. No other changes.
- `src/pages/admin/AdminBlogEditorPage.tsx` — small "Regenerate audio" button in the sidebar for admins (calls edge fn with `force: true`).

No changes to routing, navigation, layout, auth, or chat flow. Strictly additive UI + one new table + one new edge function.

## Voice & cost notes

- Default voice: **Sarah (`EXAVITQu4vr4xnSDxMaL`)** — warm, calm, fits Tavara editorial voice.
- Model: `eleven_turbo_v2_5` — low latency, ~1/3 the credit cost of multilingual_v2, quality is excellent for spoken-word articles.
- An average 2000-word Tavara post (~12000 chars) ≈ 14 min audio ≈ 12k characters billed. Generated once, cached forever per post version. Marginal cost per additional listener: zero.
- Requires `ELEVENLABS_API_KEY` secret (will be added if not already present).

## Open questions (small, won't block the plan)

1. **Voice choice**: Sarah by default, or do you want George (male, British, mature — often a good fit for editorial)? Easy to swap.
2. **Multiple voices per post**: nice-to-have later (let reader pick voice). For now: one voice per post.
3. **Auto-play**: off (always require user click — better UX, lower bandwidth).

## Files

**New**
- `supabase/migrations/<ts>_blog_audio.sql`
- `supabase/functions/blog-tts-generate/index.ts`
- `src/hooks/useBlogAudio.ts`
- `src/components/blog/BlogAudioPlayer.tsx`
- `src/lib/blog/formatTime.ts`

**Edited**
- `src/pages/blog/BlogPostPage.tsx` (one component insertion)
- `src/pages/admin/AdminBlogEditorPage.tsx` (regenerate button)
- `src/integrations/supabase/types.ts` (auto-regenerated after migration)
- `supabase/config.toml` (register new function, public verify_jwt = false)

**Secrets**
- `ELEVENLABS_API_KEY` (will prompt to add if missing)
