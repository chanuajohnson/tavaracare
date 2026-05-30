## Show cover images on blog cards

The `/blog` index currently renders `BlogCard` with only category, title, description, and author — no cover image. Every post has a `cover_image_url` (the ones you generate via BlogCoverGenerator + the seeded covers), so we just need to render it.

### Change

**`src/components/blog/BlogCard.tsx`** — add a 16:9 cover image at the top of the card when `post.cover_image_url` exists.

- Wrap in `aspect-[16/9]` container with `overflow-hidden rounded-t-lg bg-muted`
- `<img src={post.cover_image_url} alt={post.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform" />`
- If no cover, render nothing (no placeholder) so older posts without images degrade gracefully
- Keep all existing card content (category badge, reading time, title, description, author row) unchanged

### How the images are created (for your cofounder)

1. Admin opens `/admin/blog/:id` → **BlogCoverGenerator** panel
2. Picks a style anchor (`src/lib/blog/styleAnchors.ts`) — e.g. "held hands", "front door", "kitchen window"
3. Clicks generate → calls `generate-marketing-image` edge function → OpenAI gpt-image-2 (1200x630, blog-cover style)
4. "Use this image" uploads the PNG to the `blog-assets` Supabase bucket and writes the public URL to `blog_posts.cover_image_url`
5. Also catalogues it in `blog_media_assets` (the new media library) so it can be reused on other posts or for social reposts via the "Pick from library" button

### Out of scope

- No placeholder for posts missing a cover (you can backfill them from the media library)
- No layout change to the index grid
- No OG/social meta changes (already wired separately)
