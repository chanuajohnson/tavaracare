/**
 * Build a reader-friendly share URL for a blog post.
 *
 * Share links point directly at the canonical article on tavara.care so the
 * URL reads cleanly when pasted into WhatsApp, iMessage, LinkedIn, etc.
 *
 * Tradeoff: non-JS social crawlers (WhatsApp, iMessage, LinkedIn, Slack,
 * Facebook) will show the sitewide Open Graph card from index.html rather
 * than the per-article card, because they cannot execute the SPA's
 * react-helmet-async meta injection. JS-executing crawlers (Googlebot)
 * still see the per-article meta, so SEO is unaffected.
 *
 * Use `getBlogShareUrl(slug)` (or the UTM-stamped variant below) for any
 * "copy link to share" action and for in-app human-facing share buttons.
 */
export function getBlogShareUrl(slug: string): string {
  return `https://tavara.care/blog/${slug}`;
}

export function getBlogArticleUrl(slug: string): string {
  return `https://tavara.care/blog/${slug}`;
}

/**
 * Same clean share URL, stamped with UTM params so reader-driven shares are
 * attributable in GA4 and in the admin blog analytics dashboard. Per-platform
 * attribution is best-effort (we can't know if the paste landed in WhatsApp
 * vs. LinkedIn), but it cleanly separates reader shares from direct.
 */
export function getBlogShareUrlWithUtm(slug: string): string {
  const base = getBlogShareUrl(slug);
  const url = new URL(base);
  url.searchParams.set("utm_source", "share-button");
  url.searchParams.set("utm_medium", "blog-share");
  url.searchParams.set("utm_campaign", slug);
  url.searchParams.set("utm_content", "copy-button");
  return url.toString();
}
