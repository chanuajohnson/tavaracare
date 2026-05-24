## Plan to restore blog audio playback

The screenshot shows the browser blocking the `blog-tts-generate` edge function before audio generation starts. The preflight request fails because the frontend Supabase client sends `x-app-version`, but the audio edge function only allows `authorization, x-client-info, apikey, content-type`.

### What I will change

1. **Update `supabase/functions/blog-tts-generate/index.ts` CORS headers**
   - Add the headers the current Supabase client sends:
     - `x-app-version`
     - `x-client-env`
     - Supabase runtime/client platform headers used by newer clients
   - Keep `POST` and `OPTIONS` support unchanged.

2. **Keep the existing audio behavior intact**
   - No changes to the blog audio UI.
   - No changes to blog routes or navigation.
   - No changes to ElevenLabs generation logic, caching, or storage upload.

3. **Validate the fix**
   - Confirm the edge function source now allows the request headers that caused the CORS failure.
   - The expected result is that clicking play can reach `blog-tts-generate`, generate or fetch the cached MP3, and then play it in the existing audio player.

### Technical details

Current failure:

```text
Request header field x-app-version is not allowed by Access-Control-Allow-Headers in preflight response.
```

Cause:

```text
src/integrations/supabase/client.ts sends:
x-client-env, x-app-version

supabase/functions/blog-tts-generate/index.ts currently allows only:
authorization, x-client-info, apikey, content-type
```

Fix:

```text
Access-Control-Allow-Headers should include:
authorization, x-client-info, apikey, content-type, x-app-version, x-client-env, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version
```