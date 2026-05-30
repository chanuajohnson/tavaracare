## Goal

Two things, both feeding the Media Library so admins never re-generate the same look twice:

1. **AI baselines for the 16 real-life style anchors** — each anchor in `public/blog-style-refs/` gets one AI-generated 1200x630 cover saved into `blog_media_assets`, so the picker shows an on-brand AI variant we can legally use anywhere (covers, social, ads) instead of the raw personal photo.
2. **Auto-AI on upload** — when an admin uploads a cover via the editor, we keep their upload AND automatically generate one AI-styled variant from it, uploading both into `blog-assets` and cataloguing both rows in `blog_media_assets`.

---

## Part 1 — AI baselines for the 16 anchors

### One-off backfill script: `scripts/generate_anchor_ai_baselines.ts`

- Loops every entry in `BLOG_STYLE_ANCHORS` (`src/lib/blog/styleAnchors.ts`).
- For each anchor:
  1. Calls `generate-marketing-image` edge function with `referenceImageUrl = https://tavara.care/blog-style-refs/{id}.jpg`, `prompt = buildStyledImagePrompt(anchor.subject, anchor)`, 1200x630, jpeg.
  2. Converts returned data URL to a buffer and uploads to the `blog-assets` bucket at `covers/anchor-ai/{id}-{timestamp}.jpg` via `uploadBlogAsset`-equivalent server call.
  3. Inserts a `blog_media_assets` row with:
     - `source = 'anchor_ai'` (new value, extends filter chips)
     - `anchor_id = anchor.id`
     - `prompt = anchor.subject`
     - `tags = ['anchor-baseline', anchor.id, ...anchor.topics]`
     - `width=1200, height=630, mime_type='image/jpeg'`
  4. Skips an anchor if a row with `source='anchor_ai'` + `anchor_id` already exists (idempotent re-runs).
- Run from the dev sandbox once with `bun scripts/...`. No UI for it — it's a backfill.

### Library chip update

`BlogMediaLibrary.tsx`: add `"anchor_ai"` to the `Filter` type and chip row (label "Anchor AI"), styled like `generated` (primary tint). Existing rows untouched.

---

## Part 2 — Auto-AI variant on every upload

### `AdminBlogEditorPage.tsx` — `handleCoverUpload`

After the existing upload + catalogue-as-`uploaded` succeeds, fire a non-blocking follow-up:

1. Re-read the just-uploaded file (we already have the `File`).
2. Pick an anchor with `pickAnchorForPost(slug, title, description, category)` so the AI variant inherits the post's natural style cues.
3. Convert the upload to a data URL and pass it as `referenceImageUrl` to `generate-marketing-image` with `buildStyledImagePrompt(\`Tavara-styled variant of admin upload for: ${title}\`, anchor)`, 1200x630.
4. Upload result via `uploadBlogAsset(file, 'covers/auto-ai')`.
5. Insert a second `blog_media_assets` row with `source='generated'`, `prompt=\`Auto-AI variant of upload: ${file.name}\``, `anchor_id`, `tags=[slug, category, anchor.id, 'auto-from-upload']`.
6. Show a toast "AI variant added to library" on success. Failure is warn-logged only — never blocks the human's chosen upload.

The admin's original upload remains the post's `cover_image_url`. The AI variant just sits in the library for reuse.

### Out of scope

- No edge-function changes (`generate-marketing-image` already supports `referenceImageUrl`).
- No DB migration — `blog_media_assets.source` is a free-text column, so `'anchor_ai'` is additive.
- No changes to `BlogCoverGenerator` flow.
- No changes to `BlogCard` rendering (Part 1 unrelated).

---

## Technical notes

- **Cost guardrail (Part 1):** 16 calls to gpt-image, one-time. Script logs per-anchor cost line and a final total. Re-runs are no-ops thanks to the idempotency check.
- **Cost guardrail (Part 2):** one extra image generation per upload. We expose nothing to end-users; only admins trigger uploads.
- **Privacy:** anchor AI baselines are what go into social/repurpose flows; the raw personal photos in `public/blog-style-refs/` stay only as generation references and admin thumbnails, never linked from the library.
- **Filter chip ordering:** `All • Anchor AI • Generated • Uploaded • Seeded`.
