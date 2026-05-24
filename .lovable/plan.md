## Two bugs found

### 1. Diamond Vale 404 — route lives at `/care/diamond-vale`, not `/locations/diamond-vale`

All location pages are registered under `/care/*` (e.g. `/care/arima`, `/care/tobago`, `/care/port-of-spain`). But `NotFound.tsx` advertises the suggested paths as `/locations/diamond-vale`, which is the wrong prefix. The preview iframe is loading `/locations/diamond-vale` and 404'ing.

The friendly intuition ("locations") is reasonable — the sitemap should support both. Fix:

- **`src/components/routing/AppRoutes.tsx`** — add alias routes for all five location pages so both `/locations/<slug>` and `/care/<slug>` resolve to the same component:
  - `/locations/port-of-spain`, `/locations/san-fernando`, `/locations/arima`, `/locations/tobago`, `/locations/diamond-vale`
  - Canonical share URL stays `/care/diamond-vale` (already in sitemap, already in memory rules, already what the share blurb uses). Aliases just stop the 404 for anyone who guesses `/locations/*`.

No changes to canonical slugs, sitemap, or share copy.

### 2. Blog audio: "Audio is taking longer than usual. Tap play to retry."

`useBlogAudio.prepare()` invokes the `blog-tts-generate` edge function and awaits the response. First-time generation for a fresh post (the Diamond Vale referral post has never been narrated) takes longer than the Supabase functions.invoke fetch window, so the client sees a fetch error and shows the retry copy — but the edge function is still running and will eventually write to `blog_audio`.

Edge-function logs confirm repeated boots/shutdowns at the time of the user's attempt with no errors logged, consistent with a client-side timeout rather than a generation failure.

Fix in **`src/hooks/useBlogAudio.ts`** only (no edge-function changes):

1. After `invokeOnce()` throws a fetch/network/timeout error, do not surface the error immediately. Instead, poll `blog_audio` for this `post_id` every 2s for up to 90s.
2. If a row appears, set it as the audio and return success (the user just sees a longer "preparing" state, then playback works).
3. Only after the poll window expires with no row do we set the friendly "taking longer than usual, tap play to retry" error.
4. Keep the existing one-shot retry for the truly transient case (instant fetch failure within first ~1s).

This is a minimal frontend-only resilience improvement — no edge function, schema, or design changes.

## Out of scope

- No changes to `AuthProvider`, `App.tsx`, registration flows, or chat flow files.
- No changes to canonical URLs, sitemap, OG/share copy, or the Diamond Vale page content.
- No changes to the `blog-tts-generate` edge function itself.

## Files touched

1. `src/components/routing/AppRoutes.tsx` — add 5 alias `<Route>` lines under `/locations/*`.
2. `src/hooks/useBlogAudio.ts` — wrap the invoke in a poll-on-timeout pattern.
