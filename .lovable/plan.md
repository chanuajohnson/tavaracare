## What's actually happening

Your "play didn't work" isn't a TTS bug — the blog page itself is crashing before the audio player renders.

**Console evidence:**
```
[PROVIDER-ERROR] TavaraStateProvider failed:
FunctionsFetchError: Failed to send a request to the Edge Function
```

`TavaraStateProvider` wraps the app. When its edge function call fails, its error boundary shows the red **"Service Unavailable"** screen you're seeing — which replaces the entire blog post, including the new `<BlogAudioPlayer>`. So Play was never clickable.

Separately, the new `blog-tts-generate` function has **zero invocation logs**, confirming nothing ever reached it.

## Plan

### 1. Stop `TavaraStateProvider` from nuking the whole page
The provider should fail gracefully — log + degrade — not throw to the nearest error boundary and replace public content like blog posts.

- Find which edge function `TavaraStateProvider` is calling and why it's returning `FunctionsFetchError` (most likely: not deployed, CORS missing, or 5xx).
- Make the provider's fetch failure **non-fatal**: catch the error, set state to `degraded`, render `children` normally. Only show "Service Unavailable" if a feature actually needs that state.
- Public routes (`/blog/*`, marketing pages) should never depend on this provider succeeding.

### 2. Verify the audio player path end-to-end (once the page renders again)
- Confirm `blog-tts-generate` is deployed and reachable (curl test).
- Confirm `useBlogAudio` surfaces errors visibly in the player UI (toast + inline message) instead of silently doing nothing — so a future failure shows "Couldn't generate audio" instead of a dead Play button.
- Confirm the first Play call writes a row into `blog_audio` and uploads an MP3 to the `blog-audio` bucket.

### 3. Player UX hardening
- Show a clear "Preparing audio…" state on first click (already in hook — verify it actually displays).
- Show an inline error if generation fails (429 / 402 / 5xx from ElevenLabs).

## Technical scope

Files I'd touch (pending your approval):
- `src/components/providers/TavaraStateProvider` (or wherever that provider lives) — make failure non-fatal
- `src/hooks/useBlogAudio.ts` — surface errors to UI
- `src/components/blog/BlogAudioPlayer.tsx` — render error state
- No changes to routing, auth, registration flows, or the chat system

No DB migration needed — table + bucket already exist.

## Open question for you

Do you want me to:
- **(A)** Just make `TavaraStateProvider` fail-soft so the blog page renders and you can test Play, **then** debug the provider's own backend separately, or
- **(B)** Also dig into why that provider's edge function is failing in this same pass?

A is faster and unblocks the audio feature today. B is more thorough.