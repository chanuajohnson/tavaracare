## Strategy

The spike is single-source: **`senior-care-costs-trinidad-tobago-2026`** caught fire via Facebook (`tavara_oct26_launch`, 199 landings) + WhatsApp (`scully_outreach`, 54). The audience clearly wants concrete T&T cost + "how to" answers. We ride that wave with 4 new posts that share its DNA (T&T-specific, practical, scannable), interlink them into a cluster anchored by the cost post, and add the SEO scaffolding that turns this from a campaign spike into ongoing organic traffic.

We are **not** touching the conversion-funnel work right now (pin pulled).

## The 4 posts

Each post: 7–10 min read, T&T-local, internal links to and from the cost post, FAQ block (for FAQ JSON-LD), and a soft CTA to the Readiness Quiz or `/registration/family`. Voice: mix — 2 practical guide, 2 founder-personal.

### 1. `live-in-vs-hourly-care-trinidad-tobago` — Practical guide
"Live-in vs Hourly Care in Trinidad & Tobago: Which One Actually Fits Your Family?" Compares the two arrangements with real weekly hours, what each looks like in a Caribbean household (extended family rhythms, multi-generation homes, weekend gatherings), and when each makes sense. Public-safe pricing only: per-hour rates and the "from $2,400/wk" live-in floor. Category: **Family Care Guides**. Internal link target for the cost post's "what's right for us?" moment.

### 2. `cost-of-dementia-care-trinidad-tobago` — Practical guide
"What Dementia Care Costs in Trinidad & Tobago — and What You're Actually Paying For." Breaks down why dementia care sits at the Premium tier ($50+/hr), what skills/training the rate covers, night-shift considerations, and home preparation costs framed as bands not exact figures. Category: **Family Care Guides**. Captures a high-intent search segment the cost post mentions only briefly.

### 3. `paying-for-care-without-going-broke-trinidad` — Founder-personal
"Paying for Care Without Going Broke: An Honest Letter to Trinidad & Tobago Families." Chanua-voice. Acknowledges the real arithmetic families face, the guilt of "is this too much?", the family-meeting conversation, splitting costs between siblings, when to start vs when to wait. No new pricing — points readers to the cost post and the quiz. Category: **Emotional Realities of Care**. Designed to be the next FB/WhatsApp share after the cost post.

### 4. `finding-a-caregiver-in-port-of-spain-or-san-fernando` — Practical guide, location-flavored
"Finding a Caregiver in Port of Spain, San Fernando, Arima, or Tobago: What's Different in Each Area." Practical: travel-time realities, who's available where, weekend coverage patterns by region, what to ask when interviewing. Pulls from existing `/locations/*` pages and links back to them. Category: **Family Care Guides**. Captures geo-modified searches and feeds the location pages.

## SEO scaffolding (the long-tail engine)

Done across all 11 existing posts + the 4 new ones:

1. **Per-route meta** — verify every post sets `<title>` (<60 chars) and `<meta name="description">` (<160 chars) via `react-helmet-async` in `BlogPostPage`. Audit existing posts; rewrite any that fall back to the homepage default.
2. **Canonical** — confirm each post emits `<link rel="canonical" href="https://tavara.care/blog/<slug>" />` and that `index.html` does not also emit one (avoid double-canonical).
3. **Article + BreadcrumbList JSON-LD** — already partially present; standardize to include `headline`, `description`, `image` (cover_image_url), `datePublished`, `dateModified`, `author`, `publisher`, and a BreadcrumbList (Home → Blog → Category → Post).
4. **FAQ JSON-LD** — for any post with a `faqs` array (the schema already supports it), emit `FAQPage` schema. Big win for People-Also-Ask snippets.
5. **Internal linking** — add a small `RelatedPostsByCluster` block at the bottom of cost, dementia, live-in-vs-hourly, and paying-for-care posts so they pass authority to each other. Distinct from the existing `RecommendedReadingStrip` (which is randomized).
6. **Sitemap freshness** — confirm `public/sitemap.xml` (or its generator) picks up new slugs on publish; if static, document the manual update step.
7. **Image alt text** — ensure cover_image_url and inline images all have meaningful alts (currently many `alt=""`).

## How publishing works (technical)

Posts live in the `blog_posts` Supabase table (status, slug, title, description, body, category, reading_time, author_name, author_role, faqs[], cta_label, cta_href, cover_image_url, published_at). Two paths to add:

- **Preferred:** insert via migration so the 4 posts ship with the deploy and can be reviewed in PR. Body is markdown; `faqs` is `jsonb` array of `{question, answer}`.
- Alternative: use `/admin/blog/new` UI after deploy.

I'll go with the migration path so each post is reviewable as text before going live. Cover images: I'll generate one per post (1200×630 JPG, premium quality since they carry the title overlay).

## File touch list

- **New migration** — insert 4 `blog_posts` rows (status='draft' initially so you can review in `/admin/blog` before publishing).
- **4 new cover images** — `src/assets/blog/<slug>.jpg`, referenced via `cover_image_url`.
- **`src/pages/blog/BlogPostPage.tsx`** — verify/extend SEO head (Article + FAQ + BreadcrumbList JSON-LD, canonical, og:image fallback).
- **New `src/components/blog/RelatedPostsByCluster.tsx`** — deterministic cluster-aware related-links block, mounted at end of post body when the post belongs to a defined cluster.
- **`src/lib/blog/clusters.ts`** (new) — small map: `slug → cluster` so cluster relationships are explicit, not guessed.
- **Audit pass** — read all 11 existing posts' rendered head via the share endpoint and patch any missing description/canonical/og:image.
- **`public/sitemap.xml`** — append new slugs if file is static; otherwise note the generator already handles it.

## Out of scope (deliberately pinned)

- `*_registration_form_started` event
- `useStoredJourneyProgress.ts` fabricated-progress fix
- Funnel card / `AcquisitionFunnelCard.tsx` changes
- New campaigns or paid spend recommendations (this is content + SEO; the FB/WhatsApp campaigns continue as-is on their existing schedule)

## What you'll see when it's done

- 4 draft posts in `/admin/blog` ready to review/edit before publishing
- A short internal-linking map showing how the cost cluster connects
- Every existing post's social preview verified via the share URL
- One Loom-style summary: "post → cluster → expected long-tail terms"

## Open question

The 4 slugs above lean **cost + practical + T&T-geo**, which is what the data says is working. If you'd rather swap one for a **caregiver-side** post (e.g. "What it's like to work with Tavara as a caregiver in T&T") to seed the professional funnel too, say which of the 4 to drop and I'll swap it in before writing.