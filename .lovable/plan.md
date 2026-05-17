## Problem

Editing the "Senior Care Costs" post and clicking **Publish now** stamps `published_at` with the current time, which is why the post jumped to today's date and to the top of `/blog`.

Source: `src/pages/admin/AdminBlogEditorPage.tsx` line 204:
```tsx
onClick={() => persist("published", new Date().toISOString())}
```
This override is applied unconditionally — even on posts that were already published months ago.

## Fix (single file, presentation only)

In `src/pages/admin/AdminBlogEditorPage.tsx`:

1. **"Publish now" button** — only stamp the current time on the *first* publish. If the post is already published (or already has a `published_at`), keep the existing date.
   ```tsx
   onClick={() => {
     const firstPublish = !existing?.published_at;
     persist("published", firstPublish ? new Date().toISOString() : undefined);
   }}
   ```
   Passing `undefined` lets `persist` fall through to whatever is in the `publishedAt` field (which is already pre-filled from `existing.published_at` on load), so the original date is preserved.

2. **"Save draft" button** — same risk in reverse: keep the existing `published_at` rather than nulling it. Current code already passes `undefined` for the date, so no change needed — verified.

3. Add a small UI affordance so admins know what's happening: change the button label to **"Re-publish"** when `existing?.status === "published"`, and show a hint under the publish-date field: *"Editing keeps the original publish date. Change the date manually if you want to bump it."*

## What this does NOT change

- The publish-date input field stays editable — admins who *want* to bump the date can still do so explicitly.
- Scheduled / draft flows untouched.
- No database migration. No change to the blog post body.
- Sort order on `/blog` will return to the original date once the post is re-saved (or I can run a one-off `UPDATE` to restore the prior `published_at` if you tell me the date it should be).

## Follow-up question

Do you want me to also restore the *previous* `published_at` on the Senior Care Costs post (so it drops back down the list immediately), or just fix the editor behavior going forward? If yes, tell me the date it should revert to — I don't have the prior value cached.
