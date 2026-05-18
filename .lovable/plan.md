## What's already done (verified this turn)

1. **GSC** — `sc-domain:tavara.care` verified; sitemap submitted via API (HTTP 204).
2. **Alt text** — all 9 `<img>` tags in `src/` already have meaningful alt attributes. Nothing to fix.
3. **Blog** — 10 posts published in DB (goal was 4).
4. **Prerender + sitemap** — 16 routes prerendered; sitemap covers marketing routes + 4 `/care/*` + 4 `/services/*` + 7 blog posts.

## One gap to close

`public/sitemap.xml` lists **7 blog URLs** but DB has **10 published posts**. The 3 newest posts are not discoverable via sitemap → Google won't crawl them promptly.

## Change

Sync `public/sitemap.xml` to current published posts.

- Query `blog_posts` where `status='published'` for slug + published_at
- Update the `<url>` entries for `/blog/<slug>` in `public/sitemap.xml` so all 10 are present, each with correct `<lastmod>`
- Keep all non-blog entries untouched
- Resubmit sitemap to GSC after deploy (one curl, ~5 sec)

Optionally: add a tiny `scripts/generate-blog-sitemap.ts` that regenerates the blog section from Supabase on `prebuild`, so this never drifts again. Recommend doing this only if you want — otherwise manual sync now is fine.

## Out of scope

- No URL Inspection API per-URL submits (Google removed bulk request-indexing; sitemap is the supported path).
- No alt-text edits (audit clean).
- No new blog content (goal exceeded).
- No SSR work.

## Verification

After edit + deploy: `curl -sI https://tavara.care/sitemap.xml`, grep for the 3 new slugs, resubmit sitemap PUT to GSC, confirm 204.
