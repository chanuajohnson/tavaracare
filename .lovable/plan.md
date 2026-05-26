Replace the **Upload MP4** button on each script row in `/admin/video-studio` with a **Download MP4** button that fetches the rendered file from the Tavara build sandbox and saves it to the admin's computer.

### Problem
The current button uploads a local file into Supabase Storage. You want the opposite: pull the freshly rendered MP4 (currently sitting at `/mnt/documents/tavara-tiktok-village-v5.mp4` in the build sandbox) down to your machine straight from the row.

### Constraint
The browser cannot read `/mnt/documents/...` directly — that path only exists inside the Lovable build sandbox. The download has to come from somewhere reachable over HTTPS. Two viable sources:

1. **`s.rendered_url`** — once a render has been uploaded to the `video-renders` bucket, this is a public URL. Already used by the existing tiny "download" text link.
2. **No `rendered_url` yet** (status `queued`) — there is nothing to download from the browser. The artifact in chat is the only copy.

### Plan
1. **`src/pages/admin/VideoStudioPage.tsx`** — replace the Upload button block with a **Download MP4** button:
   - If `s.rendered_url` exists: button is enabled. On click, fetch the URL as a blob and trigger a browser download with filename `${slug(s.title)}.mp4` (uses `URL.createObjectURL` + a temporary `<a download>`). This bypasses Chrome's "open in tab" behavior that the current plain anchor causes.
   - If `s.rendered_url` is empty: button is disabled with tooltip text "Render not uploaded yet".
   - Remove the small "download" text anchor (now redundant).
   - Remove the file-input upload pathway entirely (the `triggerUpload`, `handleUploadFile`, hidden `<input type="file">`, `uploadingId`, `uploadTargetRef`, `fileInputRef` additions from the previous turn). Keep imports clean — drop `Upload` from lucide-react, add `Download`.

2. **No DB / storage / edge function changes.** No migration.

### Out of scope
- Pulling files directly out of the build sandbox (`/mnt/documents`) into the browser — not architecturally possible without an upload step first.
- Any change to how renders get produced.

### How you'll use it after this change
1. Ask the chat to render queued scripts (produces the artifact in chat).
2. Download the artifact from the chat once, then upload it to the bucket manually (or I can re-add an upload affordance later if you want both).
3. From then on, the Download MP4 button on the row pulls it down anywhere you want.

If you'd rather keep BOTH buttons (Upload AND Download) side-by-side, say "keep upload too" and I'll do that instead.
