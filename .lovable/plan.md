## Goal
Let admins delete media library items with a required "why rejected" reason, and store those rejections so the AI generation prompts can learn (avoid repeating rejected patterns per anchor).

## Part 1 — Schema
Add migration:
- New table `public.blog_media_rejections`:
  - `id uuid pk`, `asset_id uuid` (nullable — asset is deleted), `storage_path text`, `public_url text`, `source text`, `anchor_id text`, `prompt text`, `tags text[]`, `post_id uuid`, `reason text not null`, `reason_category text` (enum-ish: `off-brand`, `wrong-subject`, `low-quality`, `unsafe`, `duplicate`, `other`), `rejected_by uuid`, `created_at timestamptz default now()`.
  - GRANTs (authenticated + service_role), RLS: admins only via `has_role(auth.uid(),'admin')` for select/insert.
- Index on `(anchor_id, created_at desc)` for fast lookup when building prompts.

## Part 2 — Delete + reason UI (`BlogMediaLibrary.tsx`)
- Add a small "Delete" (trash) icon button to each card next to the URL copy button.
- Clicking opens an AlertDialog with:
  - Category select (the 6 categories above).
  - Free-text reason (required, min 5 chars).
  - Confirm / Cancel.
- On confirm:
  1. Insert row in `blog_media_rejections` capturing all asset metadata + reason.
  2. Delete object from `blog-assets` storage (`storage_path`).
  3. Delete row from `blog_media_assets`.
  4. Optimistic remove from local state + toast.

## Part 3 — Feed rejections back into generation
Update `src/lib/blog/generateAiVariant.ts`:
- Before calling `generate-marketing-image`, query the last ~10 rejections for the same `anchor.id` (only `reason_category` + short `reason` snippets).
- Build an "avoid" clause appended to the prompt, e.g.:
  `Avoid these previously rejected patterns for this anchor: "too dark, cropped subject" (low-quality); "doesn't show caregiver" (wrong-subject); ...`
- Pass through to the edge function as part of the prompt string (no edge function changes needed).

## Part 4 — Visibility (optional, lightweight)
- Add a tiny "Why rejected" count badge next to the "AI baselines" button showing total rejections for the active anchor filter (helps admins see learning signal). Skip if it adds complexity — Part 1–3 are the core ask.

## Out of scope
- No changes to `BlogCoverGenerator`, `BlogCard`, `AdminBlogEditorPage` upload flow, or the edge function.
- No bulk delete (one-at-a-time with reason keeps signal high-quality).
