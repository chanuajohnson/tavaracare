Add an "Upload rendered MP4" control to `/admin/video-studio` so you can attach a locally-rendered video to a queued script row without managing a shared token.

### Changes
1. **`src/pages/admin/VideoStudioPage.tsx`** — for each script row whose `render_status` is `queued` or `failed` (and for `ready` rows, as "Replace"), add a small "Upload MP4" button next to the existing render/status controls. Clicking it opens a hidden `<input type="file" accept="video/mp4">`.
2. **Upload handler (in the same page)** — on file pick:
   - Validate type/size (≤ 100 MB, `video/mp4`).
   - Upload directly via the admin's authenticated session to Supabase Storage bucket `video-renders` at path `village/${scriptId}.mp4` using `supabase.storage.from('video-renders').upload(path, file, { upsert: true, contentType: 'video/mp4' })`.
   - Get the public URL with `getPublicUrl(path)`.
   - Update the `video_scripts` row: `render_status = 'ready'`, `rendered_url = publicUrl`, `rendered_at = now()`.
   - Toast success / error, then refresh the list.
3. **Storage bucket sanity check (no schema change expected)** — `video-renders` already exists from prior work. If RLS on `storage.objects` blocks admin uploads, add a migration with an admin-only insert/update policy on that bucket. Confirmed only at implementation time by reading current policies; no preemptive migration in this plan.
4. **Delete the unused edge function** `supabase/functions/upload-video-render/index.ts` since the token-based path is no longer needed.

### Out of scope
- Server-side rendering / queue worker. You still render locally with `node remotion/scripts/render-remotion.mjs`, then upload via the new button.
- Any change to the Remotion scenes, scripts, or video content.

### Technical notes
- Reuses the existing admin auth session — no new secret, no edge function, no service-role key on the client.
- File path is deterministic (`village/${scriptId}.mp4`) and uses `upsert: true` so re-uploads just replace.
