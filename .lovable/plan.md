## Audit findings

Searched the project for the removed slug `hoarding-overwhelm-aging-hidden-caregiving-challenge`. Three live references found, plus one behavioral gap:

1. **`public/llms.txt` (line 45)** — link points to the dead URL `/blog/hoarding-overwhelm-aging-hidden-caregiving-challenge`. AI crawlers reading this file would 404.
2. **`src/content/blog/posts.ts` (line 646)** — legacy seed source still uses the old slug. `scripts/seed_blog.ts` reads from this file, so a re-seed would re-introduce the dead slug into the DB. DB currently has the new slug `when-a-home-starts-feeling-heavy-aging-accumulation-caregiving`.
3. **`BlogPostPage.tsx` line 122** — unknown slugs currently `<Navigate to="/blog" replace />`. So `/blog/hoarding-overwhelm-...` (already crawled by Google from the previous sitemap) silently bounces to the blog index instead of the correct article. Soft 404 for SEO.

No other references found in `src/`, `public/`, `scripts/`, or `docs/`.

## Change

Three small edits, all presentation/content layer:

1. **`src/pages/blog/BlogPostPage.tsx`** — add a `BLOG_SLUG_REDIRECTS` map keyed on old slug → new slug. Before the not-found `Navigate` (line 122), check the map: if the current `slug` is in it, `<Navigate to={\`/blog/${newSlug}\`} replace />`. Seed with:
   ```
   "hoarding-overwhelm-aging-hidden-caregiving-challenge" → "when-a-home-starts-feeling-heavy-aging-accumulation-caregiving"
   ```
   Easy to extend in the future for any other slug rename.

2. **`public/llms.txt` line 45** — update the URL to `/blog/when-a-home-starts-feeling-heavy-aging-accumulation-caregiving`.

3. **`src/content/blog/posts.ts` line 646** — change the seed `slug` to `when-a-home-starts-feeling-heavy-aging-accumulation-caregiving` so the seed file matches the DB. (Keep the post content; only the slug field changes.)

## Hosting note (honest constraint)

Lovable hosting does not support real HTTP 301 redirects (no `_redirects`, `_headers`, or `netlify.toml`). The client-side `<Navigate>` in step 1 is the best we can do: Googlebot executes JS and follows it, users see the correct page. For social crawlers (LinkedIn/Slack/FB) hitting the old URL, they'll get the SPA shell with no preview — acceptable since the old URL was only live briefly and nobody links to it externally.

## Out of scope

- No sitemap edits (already synced).
- No new blog content.
- No 404 page redesign.
- No SSR migration.

## Verification

After edit + deploy:
- Visit `https://tavara.care/blog/hoarding-overwhelm-aging-hidden-caregiving-challenge` → should redirect to the new slug page.
- Visit `https://tavara.care/blog/some-bogus-slug` → still falls back to `/blog` index.
- `grep -r hoarding public/llms.txt` returns no matches.
