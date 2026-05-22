// Public crawler-facing share endpoint for blog posts.
//
// URL: /functions/v1/blog-share/:slug
//
// Purpose: WhatsApp, iMessage, LinkedIn, Slack, Facebook, Telegram, Discord do
// not execute JavaScript. The Vite SPA's react-helmet-async tags are invisible
// to them, so they only ever see index.html's generic og:image. This function
// returns static HTML carrying per-article Open Graph + Twitter Card tags, and
// instantly redirects real browsers to the canonical article URL on tavara.care.
//
// verify_jwt = false (configured in supabase/config.toml) — must be public.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const ARTICLE_BASE = "https://tavara.care";
const DEFAULT_OG_IMAGE = `${ARTICLE_BASE}/og-image.png`;

const SOCIAL_BOT_PATTERN =
  /facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot|Pinterest|redditbot|Embedly|SkypeUriPreview|Iframely|vkShare|W3C_Validator|Googlebot|bingbot/i;

function htmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };
}

function fallbackHtml(slug: string | null, message: string): Response {
  const target = slug ? `${ARTICLE_BASE}/blog/${slug}` : `${ARTICLE_BASE}/blog`;
  const safeTarget = htmlEscape(target);
  const body = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Tavara — Care Coordination Platform</title>
  <meta name="description" content="Tavara connects families with qualified caregivers and coordinates care across Trinidad & Tobago." />
  <meta property="og:title" content="Tavara — Care Coordination Platform" />
  <meta property="og:description" content="Connect with qualified caregivers and coordinate care for the people you love." />
  <meta property="og:url" content="${safeTarget}" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="${DEFAULT_OG_IMAGE}" />
  <meta property="og:site_name" content="Tavara" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="canonical" href="${safeTarget}" />
  <meta http-equiv="refresh" content="0;url=${safeTarget}" />
</head>
<body><p>${htmlEscape(message)} <a href="${safeTarget}">Continue to Tavara</a>.</p>
<script>window.location.replace(${JSON.stringify(target)});</script>
</body>
</html>`;
  return new Response(body, {
    status: 200,
    headers: {
      ...corsHeaders(),
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  const url = new URL(req.url);
  // Path arrives as /blog-share/:slug or /functions/v1/blog-share/:slug
  const parts = url.pathname.split("/").filter(Boolean);
  const slug = parts[parts.length - 1] === "blog-share" ? null : parts[parts.length - 1];

  if (!slug || slug === "blog-share") {
    return fallbackHtml(null, "No article specified.");
  }

  const userAgent = req.headers.get("user-agent") ?? "";
  const isBot = SOCIAL_BOT_PATTERN.test(userAgent);

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: post, error } = await supabase
      .from("blog_posts")
      .select(
        "slug, title, description, cover_image_url, category, author_name, published_at, updated_at, status",
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error || !post) {
      return fallbackHtml(slug, "Article not found.");
    }

    // Only honour published posts publicly. Drafts/scheduled get the fallback.
    const publishedAt = post.published_at ? new Date(post.published_at) : null;
    const isLive =
      post.status === "published" && publishedAt && publishedAt.getTime() <= Date.now();
    if (!isLive) {
      return fallbackHtml(slug, "Article not published yet.");
    }

    // Canonical (clean) URL — used for og:url and crawlers
    const canonical = `${ARTICLE_BASE}/blog/${post.slug}`;
    // Redirect target for humans — forwards the original query string so UTMs
    // (utm_source=facebook, etc.) survive the hop and the on-site attribution
    // hook can record `blog_utm_landed` with the right source.
    const incomingSearch = url.search ?? "";
    const redirectTarget = `${canonical}${incomingSearch}`;

    const title = `${post.title} | Tavara Care`;
    const description = post.description ?? "";
    const image = post.cover_image_url || DEFAULT_OG_IMAGE;

    const safe = {
      title: htmlEscape(title),
      description: htmlEscape(description),
      image: htmlEscape(image),
      canonical: htmlEscape(canonical),
      redirectTarget: htmlEscape(redirectTarget),
      category: htmlEscape(post.category ?? "Care"),
      author: htmlEscape(post.author_name ?? "Tavara"),
      titleRaw: htmlEscape(post.title),
    };

    // For bots: serve meta-only, no redirect (some crawlers refuse to follow refresh).
    // For humans: serve meta + instant redirect to canonical + forwarded UTMs.
    const redirectTags = isBot
      ? ""
      : `<meta http-equiv="refresh" content="0;url=${safe.redirectTarget}" />
  <script>window.location.replace(${JSON.stringify(redirectTarget)});</script>`;

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safe.title}</title>
  <meta name="description" content="${safe.description}" />
  <link rel="canonical" href="${safe.target}" />

  <meta property="og:site_name" content="Tavara" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${safe.title}" />
  <meta property="og:description" content="${safe.description}" />
  <meta property="og:url" content="${safe.target}" />
  <meta property="og:image" content="${safe.image}" />
  <meta property="og:image:secure_url" content="${safe.image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${safe.titleRaw}" />
  <meta property="article:section" content="${safe.category}" />
  <meta property="article:author" content="${safe.author}" />
  ${post.published_at ? `<meta property="article:published_time" content="${htmlEscape(post.published_at)}" />` : ""}
  ${post.updated_at ? `<meta property="article:modified_time" content="${htmlEscape(post.updated_at)}" />` : ""}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safe.title}" />
  <meta name="twitter:description" content="${safe.description}" />
  <meta name="twitter:image" content="${safe.image}" />
  <meta name="twitter:image:alt" content="${safe.titleRaw}" />

  ${redirectTags}
</head>
<body>
  <p>
    <strong>${safe.titleRaw}</strong><br />
    ${safe.description}
  </p>
  <p><a href="${safe.target}">Read the full article on Tavara</a></p>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders(),
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=3600",
      },
    });
  } catch (e) {
    console.error("[blog-share] error", e);
    return fallbackHtml(slug, "Unable to load article.");
  }
});
