# Blog link sharing — two URLs, two purposes

When you share a blog post in WhatsApp, iMessage, LinkedIn, Slack, Facebook, Telegram, or Discord, the preview card that appears is built from the `<head>` of whatever HTML those apps fetch from the URL. **None of those crawlers run JavaScript.** Our blog pages are a React SPA, so the only HTML they ever see is `index.html`, which carries the generic Tavara homepage Open Graph image. That's why a pasted blog link previewed as "Tavara — Care Coordination Platform" with the homepage screenshot instead of the article.

We now publish two URLs per post.

## 1. Article URL — for humans and Google

```
https://tavara.care/blog/<slug>
```

Use this anywhere a human will click — newsletters, in-app links, navigation, sitemap, Google. `react-helmet-async` injects per-post title, description, canonical, Open Graph, and Twitter Card tags on this URL, which JS-executing crawlers like Googlebot honour.

## 2. Share URL — for social previews

```
https://cpdfmyemjrefnhddyrck.supabase.co/functions/v1/blog-share/<slug>
```

This hits the `blog-share` Supabase Edge Function. It does three things:

1. Returns static HTML with the post's own `og:image` (cover_image_url), title, description, author, category, and published date.
2. Detects social crawler user agents (`facebookexternalhit`, `WhatsApp`, `Twitterbot`, `LinkedInBot`, `Slackbot`, `TelegramBot`, `Discordbot`, etc.) and serves them the meta tags without any redirect.
3. For everyone else (real browsers), instantly redirects to `https://tavara.care/blog/<slug>` via `<meta http-equiv="refresh">` and `window.location.replace`, so a human who taps the WhatsApp preview lands on the clean article URL.

Cache headers: `public, max-age=300, s-maxage=3600`. If you edit a post and the preview is stale, paste the URL into [Facebook's Sharing Debugger](https://developers.facebook.com/tools/debug/) or [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) and force a re-scrape. WhatsApp caches per-device for ~7 days and cannot be force-flushed remotely — change the URL (e.g. append `?v=2`) if you need a fresh card immediately.

## How to use it

- In the **admin blog editor** (`/admin/blog/:id`), under the post title there's a **"Copy share link (rich preview)"** button. Use this whenever pasting into WhatsApp, iMessage, LinkedIn, etc.
- On the **public article page**, the same **"Copy share link"** button sits next to "Copy article text".
- For in-app linking, navigation, or anywhere a human clicks directly in a browser, keep using `/blog/<slug>` — there's no need for the share URL there.

## Requirements for a good preview

- The post must have `cover_image_url` set. If null, the share endpoint falls back to the homepage Open Graph image.
- Cover images should be **1200×630**, JPG or PNG, under 1 MB, served over HTTPS. WhatsApp refuses to render large previews when width/height are missing or the file is >5 MB.
- Title should be under ~60 characters and description under ~160 for clean rendering across platforms.

## Future: cleaner share URLs

Today the share URL exposes the raw Supabase functions host. If we want `share.tavara.care/blog/<slug>` instead, point a `share` CNAME at the functions host and update `getBlogShareUrl` in `src/lib/blog/shareUrl.ts`. Not blocking; cosmetic.

## Why not just prerender?

The Vite build is a pure SPA with no build-time route enumeration for `/blog/:slug`. Prerendering would need a custom build step plus a content snapshot at deploy time and would go stale the moment a post is edited. The edge function is always live and always reads the latest post row.
