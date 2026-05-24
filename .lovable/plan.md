Three independent fixes for the issues you flagged.

## 1. Quiz completions not logged in the leaderboard

**Root cause:** `FamilyReadinessQuizPage.tsx` uses a single `<PageViewTracker>` whose `actionType` flips from `readiness_quiz_view` to `readiness_quiz_completed` when results show. But `PageViewTracker`'s tracking `useEffect` only re-runs when the URL path/search changes — not when `actionType` changes. So the `readiness_quiz_completed` event is never sent, and the leaderboard's "Quiz done" column stays at 0.

**Fix:** In `FamilyReadinessQuizPage.tsx`, fire the completion event explicitly via `useTracking()` in a `useEffect` that runs once when `showResult` becomes `true`. Use a ref to guard against duplicates. Include the inbound UTM params (`utm_campaign`, `utm_referrer_content`, etc.) read off the URL so the leaderboard's `slugFromCampaign` mapping still works. Keep the existing `PageViewTracker` for the `view` event.

## 2. Hero text cut off at top on mobile

**Root cause:** `src/pages/Index.tsx` line 420 — the hero section is locked to `h-[calc(100vh-56px)]` on mobile with content vertically centered. The H1 ("Find a Caregiver — Care Coordination for Families & Communities") wraps to 4 lines at `text-4xl`, plus subtitle + paragraph + 3 role buttons + readiness pill. On short phones (and with browser chrome) this overflows above and below the viewport, clipping the top of the H1.

**Fix:** Change the hero section to `min-h-[calc(100vh-56px)] md:min-h-screen h-auto` (instead of fixed `h-`) so content can extend and scroll naturally, and change the content overlay from `justify-center` to `justify-start` with safe top padding (`pt-20 md:pt-0` and `md:justify-center`). Also reduce the H1 on the smallest screens (`text-3xl sm:text-4xl md:text-6xl lg:text-7xl`) so the first line isn't pushed off-screen. No copy changes.

## 3. Blog audio "Failed to send a request to the Edge Function"

**Root cause investigation:** Edge function logs show only a successful `OPTIONS` preflight and no `POST` — the actual invocation never reaches the function. `ELEVENLABS_API_KEY` is set and `verify_jwt = false`. The most common cause of this exact error string (thrown by `supabase-js` `functions.invoke`) is the gateway/network failing the POST after preflight, typically when the call is fired from a page context that has a stale/invalid Supabase session token attached, or when the request body serialization is rejected.

**Fix scope (frontend only, no function changes yet):**
- In `useBlogAudio.ts`, harden the `prepare()` call: catch the supabase-js `FunctionsFetchError` separately and retry once after a short delay before surfacing the toast. Also include both `post_id` and `slug` in the invoke body (the function accepts either) so a single missing field can't be the cause.
- In `BlogAudioPlayer.tsx`, suppress the inline `error` paragraph + the duplicate sonner toast — show only one user-facing message. Replace the technical "Failed to send a request to the Edge Function" string with "Audio is taking longer than usual — tap play to retry."
- Do not auto-call `prepare()`; keep it gated behind the play button (already the case). This avoids the toast firing on first page load.

If after this the function still doesn't receive the POST, the next step is a server-side investigation (logging the raw request inside the function and checking Supabase project-level CORS settings) — that would be a follow-up turn.

## Files to edit

- `src/pages/family/FamilyReadinessQuizPage.tsx` — add explicit completion tracking on `showResult`
- `src/pages/Index.tsx` — hero section sizing + H1 responsive scale (lines ~420, 467-474)
- `src/hooks/useBlogAudio.ts` — retry-once + dual-key body
- `src/components/blog/BlogAudioPlayer.tsx` — single error surface + friendlier copy

## Out of scope

- Editing `PageViewTracker` itself (used widely; safer to fix at the call site)
- Editing the `blog-tts-generate` edge function
- Any change to leaderboard query, blog CTAs, or quiz scoring
