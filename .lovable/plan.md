# Add top-of-article CTA + clarify the "Copy share link" button

## Part 1: What the "Copy share link" button actually tracks

Short answer: **right now, nothing.**

The button copies a URL built by `getBlogShareUrl(slug)`, which points at the `blog-share` Supabase Edge Function. That function exists to serve rich Open Graph + Twitter Card previews to social crawlers (WhatsApp, iMessage, LinkedIn, Slack, Facebook) since those crawlers don't run JavaScript and can't read the SPA meta tags. It redirects humans to the canonical article URL.

Crucially:
- It does NOT stamp UTM parameters
- It does NOT insert a row into `social_share_links`
- It does NOT fire a `cta_engagement_tracking` event
- It does NOT distinguish a copy by an admin vs. a copy by a reader

So any link copied via that button shows up in GA4 as **direct / (none)** traffic, with zero per-platform attribution. The admin-only `SocialSharePanel` (the one we built with `buildSocialUtmUrl`) is the only path that produces tracked, per-platform share links.

### Two ways to fix this — pick one

**Option A: Make "Copy share link" a tracked share (recommended).**
- Stamp the copied URL with `utm_source=share-button`, `utm_medium=blog-share`, `utm_campaign=<post-slug>`, `utm_content=copy-button`
- Fire a `cta_engagement_tracking` row with `placement=public-copy-share` so it appears in `/admin/blog/:postId/analytics`
- Per-platform attribution still won't be perfect (we can't know if the reader pasted into WhatsApp vs. LinkedIn), but at least we'll know shares originated from a reader, not from the admin panel.

**Option B: Keep it untracked, but rename and de-emphasize.**
- Leave it as a quiet utility for personal sharing, no metrics promise. No code change beyond a tooltip clarification.

I recommend **Option A** because it closes the only blind spot in the reader → share funnel and feeds the same dashboard you already have.

## Part 2: Add a top-of-article Family/Caregiver CTA

Some readers don't scroll past the first screen. Right now the first dual CTA appears at the ~50% paragraph boundary. Add a third placement at the very top.

### Where it goes

A new `BlogTopCTA` component, rendered in `BlogPostPage.tsx` immediately **after the article header (title + description + author row) and before `BlogAudioPlayer`**. That position keeps the headline above the fold but puts the audience-fork card visible on the first scroll for most desktop viewports.

### What it looks like

Same dual-card pattern as `BlogInlineCTA` (For Families / For Caregivers), but visually lighter and tighter:
- Single horizontal bar on desktop (two pills side by side), stacked on mobile
- Smaller height than the mid-article card so it doesn't push the article body down too far
- Same attribution: forwards inbound UTMs via `buildCtaDestination` and fires `trackBlogCtaClick` with new `placement` values `top-family` and `top-professional`
- Same destinations: `/registration/family` (with `referringPagePath` state for the blog breadcrumb) and `/registration/professional`

### Why this is safe

- No change to existing inline mid-article or end-of-article CTAs
- New `placement` strings extend, not replace, the existing analytics enum, so the admin dashboard at `/admin/blog/:postId/analytics` will just show three placements per post instead of two
- No layout regression: the new component is `not-prose` so it doesn't interact with the article typography

## Files

**Part 1 (Option A, if approved):**
- `src/pages/blog/BlogPostPage.tsx` — change `handleCopyShareLink` to stamp UTMs and fire the engagement event
- `src/lib/blog/shareUrl.ts` — add an optional `withUtm` helper that appends `utm_source=share-button&utm_medium=blog-share&utm_campaign=<slug>&utm_content=copy-button`

**Part 2:**
- `src/components/blog/BlogTopCTA.tsx` — new component (mirrors BlogInlineCTA structure, compressed visual)
- `src/components/blog/BlogInlineCTA.tsx` — extend `BlogCtaPlacement` type to include `top-family` / `top-professional` (if it's a typed union)
- `src/lib/blog/attribution.ts` — same placement union extension if defined there
- `src/pages/blog/BlogPostPage.tsx` — render `<BlogTopCTA postSlug={post.slug} />` between the header `</header>` and `<BlogAudioPlayer />`

## Open question

Do you want me to do **Option A** for the share button as well, or just the top CTA in this round?
