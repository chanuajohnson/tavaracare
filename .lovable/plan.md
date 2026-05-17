## Why the shared link shows the generic Tavara image today

Two separate problems are stacked:

1. **`BlogPostPage` never passes `ogImage` to `<SEO>`.** It has `post.cover_image_url` available but doesn't use it, so even JS-executing crawlers (Google, Twitter when JS-rendered) fall back to the sitewide `/og-image.png` from `index.html`.
2. **WhatsApp / iMessage / Facebook / LinkedIn / Slack do not execute JavaScript.** They fetch the raw HTML once and read the `<head>`. Because the app is a Vite SPA, the raw HTML they get is always `index.html` — the static "Tavara — Care Coordination Platform" preview. `react-helmet-async` runs after hydration, which these crawlers never see.

So fixing the missing `ogImage` prop alone helps Google a little, but the WhatsApp preview you saw will **not** change. To make link previews actually reflect the article, the server has to return article-specific HTML to crawlers.

## Plan

### Part A — Per-post Helmet meta (Google / Twitter / JS-aware crawlers)

Edit `src/pages/blog/BlogPostPage.tsx`:
- Pass `ogImage={post.cover_image_url ?? undefined}` to `<SEO>` so each post advertises its own cover.
- If `cover_image_url` is null, fall back to a per-category default rather than the homepage `og-image.png`.

Edit `src/components/seo/SEO.tsx`:
- Add `imageAlt?: string` and emit `<meta property="og:image:alt">` + `<meta name="twitter:image:alt">`.
- Emit `og:image:width` / `og:image:height` when known (1200×630 for cover renders) — WhatsApp needs these to render large previews instead of the small thumbnail.

### Part B — Crawler-facing share endpoint (WhatsApp, iMessage, LinkedIn, Slack, FB)

This is the part that actually fixes the shared-link preview.

1. **New Supabase Edge Function `blog-share`** at `supabase/functions/blog-share/index.ts`.
   - Path: `/functions/v1/blog-share/:slug`.
   - Reads the `blog_posts` row by slug (server-side, with service role).
   - Returns a small HTML document containing:
     - `<title>{post.title} | Tavara Care</title>`
     - `<meta name="description" content="{post.description}">`
     - `<meta property="og:title">`, `og:description`, `og:type=article`, `og:url=https://tavara.care/blog/{slug}`, `og:image={post.cover_image_url || category fallback}`, `og:image:width=1200`, `og:image:height=630`, `og:site_name=Tavara`.
     - `<meta name="twitter:card" content="summary_large_image">` and twitter:title/description/image.
     - `<link rel="canonical" href="https://tavara.care/blog/{slug}">`.
     - A `<meta http-equiv="refresh" content="0;url=https://tavara.care/blog/{slug}">` plus a small `<script>location.replace(...)</script>` so a human who opens the share URL in a browser is redirected to the real article instantly.
   - Detects social crawler user agents (`facebookexternalhit`, `WhatsApp`, `Twitterbot`, `LinkedInBot`, `Slackbot`, `TelegramBot`, `Discordbot`) and **does not** redirect for them — they only need the HTML.
   - Cache-Control: `public, max-age=300, s-maxage=3600` so previews are fresh after edits.

2. **Helper `src/lib/blog/shareUrl.ts`**: `getBlogShareUrl(slug)` returns `https://{SUPABASE_PROJECT}.functions.supabase.co/blog-share/{slug}` (the URL admins copy/paste into WhatsApp).

3. **Share buttons in blog editor + post page**:
   - On `AdminBlogEditorPage`, add a "Copy share link" button next to "Copy article" that copies the share URL (with a tooltip: *"Use this link in WhatsApp / iMessage / LinkedIn for a rich preview. It auto-redirects to the article."*).
   - On `BlogPostPage`, add the same "Copy share link" alongside the existing "Copy article" so anyone can grab it.

4. **Documentation note** in `docs/TAVARA_LANGUAGE_GUARDRAILS.md` companion or a new `docs/BLOG_SHARING.md`: explains the two URLs (article URL = humans + Google, share URL = social previews) and that this is a temporary workaround until the site moves to SSR / prerender.

### Part C — Fix the specific article you just shared

The "Inside Tavara Onboarding" post is the one in the WhatsApp screenshot. Verify it has a `cover_image_url` set; if null, set one in the blog editor so the new share preview has an image. No migration needed — just a data check.

## Technical details

- **Why not just prerender index.html per route?** Lovable's Vite build is a pure SPA; there's no build-time route enumeration for `/blog/:slug`, and prerendering would require a custom build step plus a content snapshot at deploy time. Edge function is simpler and always live.
- **Why an edge function URL instead of rewriting tavara.care/blog/:slug?** Lovable hosting does not let us intercept requests to `tavara.care/blog/:slug` based on user-agent. The edge function lives at a different host (`*.functions.supabase.co`) which we control. The trade-off: shared links look like `…supabase.co/blog-share/inside-tavara-onboarding-step-by-step` instead of the clean `tavara.care/blog/…`. Acceptable for share-from-admin; humans get redirected to the clean URL instantly.
- **Alternative (cleaner URL, more work)**: point a subdomain like `share.tavara.care` at the edge function via CNAME, so shared links read `share.tavara.care/blog-share/{slug}`. Skipped from this plan unless you want it.
- **Image rendering**: cover images must be at least 1200×630, JPG or PNG, under ~1 MB, served over HTTPS. WhatsApp specifically refuses previews when og:image is missing width/height **or** larger than ~5 MB.

## Files

**New**
- `supabase/functions/blog-share/index.ts`
- `src/lib/blog/shareUrl.ts`
- `docs/BLOG_SHARING.md`

**Edited**
- `src/pages/blog/BlogPostPage.tsx` (pass ogImage, add Copy share link button)
- `src/components/seo/SEO.tsx` (image alt, width/height)
- `src/pages/admin/AdminBlogEditorPage.tsx` (Copy share link button)

**No migration required.** No changes to routing, auth, registration, chat flow, or any protected component.

## Open question

Do you want me to also set up the `share.tavara.care` CNAME path so shared URLs look clean (`share.tavara.care/blog/{slug}`) instead of the raw Supabase functions host? Default if you don't answer: ship with the raw Supabase URL and add the subdomain later.
