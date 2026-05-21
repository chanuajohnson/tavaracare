/**
 * Build a crawler-friendly share URL for a blog post.
 *
 * The share URL points at the `blog-share` Supabase Edge Function, which
 * returns static HTML with article-specific Open Graph + Twitter Card meta
 * tags. Social crawlers (WhatsApp, iMessage, LinkedIn, Slack, Facebook,
 * Telegram, Discord) do not execute JavaScript, so they cannot read the
 * tags injected by react-helmet-async on the SPA route. The edge function
 * serves them pre-rendered HTML and instantly redirects humans to the
 * clean article URL on tavara.care.
 *
 * Use `getBlogShareUrl(slug)` for any "copy link to share" action.
 * Use `/blog/{slug}` (tavara.care) for any in-app link or human-facing
 * navigation.
 */
const SUPABASE_PROJECT_ID =
  import.meta.env.VITE_SUPABASE_PROJECT_ID ?? 'cpdfmyemjrefnhddyrck';

export function getBlogShareUrl(slug: string): string {
  return `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/blog-share/${slug}`;
}

export function getBlogArticleUrl(slug: string): string {
  return `https://tavara.care/blog/${slug}`;
}

/**
 * Same crawler-friendly share URL, but stamped with UTM params so reader-driven
 * shares are attributable in GA4 and in the admin blog analytics dashboard.
 * Per-platform attribution is best-effort (we can't know if the paste landed in
 * WhatsApp vs. LinkedIn), but it cleanly separates reader shares from direct.
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
