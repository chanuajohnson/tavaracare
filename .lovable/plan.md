# Reusable Media Library for generated covers

## What's happening today

The "Generate from prompt" tool already uploads the chosen image to the `blog-assets` Supabase storage bucket (`uploadBlogAsset(file, "covers")`) and writes that URL into `blog_posts.cover_image_url`. The file IS persisted — but only the post it was generated from knows about it. There's no index, no thumbnail grid, no way to reuse the same image on a different post or grab it for a social repost.

## Goal

Every generated cover gets catalogued the moment it's saved, and shows up in a Media Library the admin can browse from any post (and later, from any social-post tool).

## Implementation

### 1. New table `blog_media_assets` (migration)

Tracks every generated/uploaded image with metadata so it's searchable and reusable.

Fields (besides standard id/created_at/updated_at):
- `storage_path` text — path inside `blog-assets` bucket
- `public_url` text — full public URL
- `width`, `height` int
- `mime_type` text
- `source` text — `generated` | `uploaded` | `seeded`
- `prompt` text nullable — the prompt used (for generated)
- `anchor_id` text nullable — which style anchor was used
- `post_id` uuid nullable — the post it was first attached to
- `tags` text[] — slug, topic keywords, "social", etc.
- `created_by` uuid — admin who created it

RLS: admin-only select/insert/update/delete (uses existing `has_role(auth.uid(), 'admin')`).
Grants: `authenticated` + `service_role`.

### 2. Catalogue on save

In `BlogCoverGenerator.useThisImage()`, after `uploadBlogAsset` succeeds, also insert a row into `blog_media_assets` with the prompt, anchor, post id, and `source='generated'`. Failure to catalogue does NOT block the save — it just logs a warning, so a storage hiccup never breaks the existing flow.

### 3. Backfill the 6 already-regenerated covers

One-time insert in the same migration: register each of the 6 `public/blog-covers/<slug>.jpg` files (and their corresponding posts) as `source='seeded'` rows so the library isn't empty on day one.

### 4. New component `BlogMediaLibrary.tsx`

Modal grid of all assets, newest first, with:
- Search by prompt / tag / slug
- Filter chips: All / Generated / Uploaded / Seeded
- Click an asset → "Use as cover for this post" (writes URL to current post's `cover_image_url`) and "Copy URL" (for social reposts)

Mounted from `AdminBlogEditorPage.tsx` next to the existing Upload / Generate buttons as a third button: **"Pick from library"**.

### 5. Storage bucket

`blog-assets` already exists (the current uploader uses it). No bucket change needed — just confirm it's public so URLs work in OG share previews and social reposts.

## Out of scope (call out, not building)

- A standalone `/admin/media` page — the library is modal-only for now, surfaced where the admin actually needs it (the editor). Easy to promote later.
- Tag auto-suggestion from the prompt — keep it manual / slug-based for v1.
- Deletion UI — admins can delete via Supabase dashboard until we add it; preserves accidental-delete protection.

## Verification

1. Generate a new cover on any post → confirm a row lands in `blog_media_assets` and the file exists in `blog-assets/covers/`.
2. Open a different post → click "Pick from library" → that same image is selectable → save → confirm new post's `cover_image_url` matches.
3. Copy URL from library → paste into a browser → image loads (proves it works for social reposts).
4. Check the 6 backfilled seeded covers appear in the grid.

## Files touched

- New migration: `blog_media_assets` table + RLS + grants + 6 seed inserts.
- Edit: `src/components/admin/blog/BlogCoverGenerator.tsx` — insert metadata row after upload.
- New: `src/components/admin/blog/BlogMediaLibrary.tsx` — modal grid + search/filter.
- Edit: `src/pages/admin/AdminBlogEditorPage.tsx` — mount "Pick from library" button.
