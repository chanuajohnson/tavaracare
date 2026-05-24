## What is happening

The blog audio player is reaching the `blog-tts-generate` Edge Function, but that function is failing when it calls ElevenLabs. The current Edge Function logs show:

```text
ElevenLabs 401: detected_unusual_activity
Free Tier usage disabled
```

That means the browser player is not the main issue. The audio cannot be generated because the configured ElevenLabs key is being rejected by ElevenLabs.

## Plan

1. Update `supabase/functions/blog-tts-generate/index.ts`
   - Keep the existing cached-audio behavior.
   - Add a non-ElevenLabs fallback path using browser-native/system TTS friendly metadata when ElevenLabs returns 401, 403, quota, or unusual-activity errors.
   - Return a clear structured error/fallback response instead of a generic 500 when the paid TTS provider is blocked.
   - Preserve CORS headers on every response.

2. Update `src/hooks/useBlogAudio.ts`
   - Detect the structured provider-blocked response.
   - Avoid showing raw provider errors like `ElevenLabs 401` to families.
   - Return a controlled fallback state to the audio player.

3. Update `src/components/blog/BlogAudioPlayer.tsx`
   - If MP3 generation is unavailable, use the browser’s built-in `speechSynthesis` to read the article/page text aloud after the user taps Play.
   - Keep the same player controls where possible: play/pause/stop and speed.
   - Show a calm message that narration is available in-browser when generated audio is temporarily unavailable.

4. Validation
   - Confirm the play button no longer fails with `Edge Function returned a non-2xx status code`.
   - Confirm blog pages can read aloud even when ElevenLabs blocks generation.
   - Existing generated MP3 files, if present in `blog_audio`, will still play normally.