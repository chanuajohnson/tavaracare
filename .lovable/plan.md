## Goal

Replace the "ask the build assistant" workflow with a real Render button. An admin clicks Render anywhere on tavara.care, the video is rendered on Remotion Lambda in AWS, the MP4 lands in Supabase Storage, and `video_scripts.rendered_url` is filled in automatically.

## How it works (end-to-end)

```text
Admin clicks Render
       │
       ▼
[Edge fn: render-video-script]
   - marks script render_status = "queued"
   - calls Remotion Lambda renderMediaOnLambda(scenes, brand)
   - stores AWS renderId on the row
       │
       ▼
[Remotion Lambda in AWS]  ── renders MP4 ── writes to S3
       │
       ▼
[Edge fn: render-video-poll]  (called by frontend every 3s while in_progress)
   - asks Lambda for progress
   - on done: downloads S3 mp4, uploads to Supabase Storage bucket
              `video-renders/<script_id>.mp4`,
              sets render_status = "completed" + rendered_url
   - on error: render_status = "failed" + render_notes
       │
       ▼
Frontend shows progress %, then a Download / Preview link.
A global RenderQueue panel (mounted in the admin layout) lists all
in-flight + recent renders pulled from `video_scripts` via Supabase
Realtime, so the admin sees status from any page.
```

## What gets built

### 1. Remotion Lambda site (one-time setup, done by build assistant)
- Deploy the existing `remotion/` project as a Lambda "site" using `@remotion/lambda`.
- Deploy the render function itself (1.5 GB / 120 s).
- Store the resulting site URL + function name + AWS region as Supabase secrets.

### 2. Secrets (requested via secret form)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (e.g. `us-east-1`)
- `REMOTION_SERVE_URL` (filled in after the one-time site deploy)
- `REMOTION_FUNCTION_NAME` (same)

### 3. Database (small migration)
Add to `video_scripts`:
- `render_id text` — AWS Lambda render id
- `render_progress numeric` — 0..1
- `render_started_at timestamptz`
- `render_completed_at timestamptz`

Storage:
- Create public bucket `video-renders` for finished MP4s.

### 4. Edge functions
- `render-video-script` — POST `{ script_id }`. Validates admin via `has_role`. Reads scenes, kicks off `renderMediaOnLambda`, persists render_id + status.
- `render-video-poll` — POST `{ script_id }`. Calls `getRenderProgress`; on completion, copies the S3 mp4 into Supabase Storage and writes `rendered_url`.
- Both gated to admin only; both include CORS headers.

### 5. Frontend
- `useVideoRender(scriptId)` hook: triggers render, polls every 3 s while `queued` / `in_progress`, surfaces `{ status, progress, url, error }`.
- `RenderButton` component on each row of `/admin/video-studio` — shows "Render", spinner + %, then "Download MP4" + "Re-render".
- `GlobalRenderQueue` component mounted inside the existing admin layout (only renders when user has the admin role). Floating bottom-right panel listing all scripts currently `queued` or `in_progress`, plus the last 5 completed. Powered by a Supabase Realtime subscription on `video_scripts`, so it updates live no matter what admin page you're on.

### 6. Removal
- Delete the "ask the build assistant to render queued scripts" copy from the Video Studio page; replace with the live Render button + queue.

## Cost / ops notes
- Remotion Lambda billed per GB-second. A 25 s 1080p TikTok video at 1.5 GB ≈ US$0.01–0.03 per render. Lambda scales to zero.
- S3 storage for intermediates is trivial; finished MP4s live in Supabase Storage so existing CDN + auth rules apply.
- All admin routing, layout files, and registration flows are untouched per project guardrails. The new global panel mounts inside the existing admin layout component; no router changes.

## What I need from you to start
1. Approve this plan.
2. Be ready to paste an AWS access key + secret with permissions for Lambda + S3 in the region you choose (I'll create the IAM policy snippet for you to attach). I'll request these via the secure secrets form after approval.

After secrets are in, I'll run the one-time `deploySite` + `deployFunction` from the sandbox, save the resulting URLs as the last two secrets, and ship the UI in the same pass.