## Goal

Three outcomes for every blog post shared to Facebook, WhatsApp, and LinkedIn:
1. Know exactly which platform drove each visit, click, and conversion
2. See the metrics that matter in one admin view
3. Give every visitor a foolproof path into their journey (family or professional)

---

## 1. How per-platform tracking already works (and what we'll harden)

The `SocialSharePanel` already builds platform-stamped URLs via `buildSocialUtmUrl`. Your example link:

```
?utm_source=facebook&utm_medium=social&utm_campaign=family-readiness&utm_content=planning-financial-future-care-fb
```

Each platform copy generates its own URL with `utm_source=facebook|whatsapp|linkedin|instagram|tiktok`, and every copy is logged to `social_share_links` (post_id, platform, campaign, content_slug, full_url, caption, generated_by, copied_at).

**Hardening work:**
- Ensure GA4 receives these UTMs on `page_view` (default behavior — verify in DebugView).
- Add a lightweight `utm_landed` event fire on `BlogPostPage` mount when `utm_source` is present, with `{source, medium, campaign, content, post_slug}`. This gives a clean GA4 dimension independent of session attribution.
- Persist landed UTMs to `sessionStorage` so downstream conversions (`family_registration_page_view`, `care_assessment_page_view`, `family_matches_view`, `caregiver_assigned`) can attach `first_touch_source/campaign/content` as event params. This is what closes the loop from "Facebook post X" → "family registered."

---

## 2. Metrics to watch (and where)

**In GA4 (already wired):**
- `page_view` filtered by `page_location contains /blog/` → reach per platform via `session_source`/`session_campaign`.
- Funnel: blog → `family_registration_page_view` → `care_assessment_page_view` → `family_matches_view` → `caregiver_assigned` (once dev adds the gtag call).
- Scroll depth (25/50/75/90) once GTM trigger is added — tells you which posts actually get read vs. bounced.
- Path exploration from blog title → next page.

**In Tavara admin (new small dashboard at `/admin/blog/analytics`):**
Joins `social_share_links` (what we shared) with downstream signals to show per-post-per-platform:
- Copies generated (proxy for posts published)
- Landings (`utm_landed` events stored in `cta_engagement_tracking`)
- CTA clicks per CTA slot (see §3)
- Registrations attributed (family + professional) within 30-day window
- Conversion rate = registrations / landings

This is the single view to compare Facebook vs. WhatsApp vs. LinkedIn for each post.

---

## 3. Foolproof CTAs inside every blog post

Today `BlogPostPage` has one optional `cta_label`/`cta_href` aside at the bottom. That's too late and single-audience. Add three CTA placements that fork by audience:

**Placement A — Inline mid-article card** (after ~50% scroll, injected by markdown component):
- "Caring for a parent in Trinidad & Tobago? Start your readiness check" → `/registration/family?utm_inline=blog-mid`
- "Are you a caregiver? Join our care team" → `/registration/professional?utm_inline=blog-mid`

**Placement B — End-of-article dual CTA block** (replaces current single aside):
Two side-by-side cards, audience-forked:
- Family card: headline, one-line benefit, "Start your free family readiness assessment" → `/family/care-assessment`
- Professional card: headline, "Apply to join Tavara's care team" → `/registration/professional`
- Both cards carry the inbound UTM forward as `utm_referrer_*` params so the registration funnel keeps attribution.

**Placement C — Sticky bottom bar on mobile only** (dismissible):
- Single primary CTA chosen by post `category`:
  - Family-readiness / aging-in-place / caregiver-burnout → family CTA
  - Caregiver-awareness → professional CTA
  - Fallback → family CTA

**CTA tracking:**
Every CTA click fires `blog_cta_click` with `{post_slug, placement: 'mid'|'end-family'|'end-pro'|'sticky', destination, inbound_utm_source, inbound_utm_campaign}` and logs to `cta_engagement_tracking`. This is what the admin dashboard counts.

---

## 4. Files to add / change

**New:**
- `src/components/blog/BlogInlineCTA.tsx` — mid-article dual card
- `src/components/blog/BlogEndCTABlock.tsx` — end-of-article dual card, replaces current single aside
- `src/components/blog/BlogStickyMobileCTA.tsx` — dismissible mobile bar
- `src/lib/blog/attribution.ts` — read/persist inbound UTMs, build forwarded URLs, fire `utm_landed` and `blog_cta_click`
- `src/pages/admin/BlogAnalyticsPage.tsx` + route entry — per-post-per-platform dashboard
- `src/hooks/admin/useBlogSocialAnalytics.ts` — joins `social_share_links` with `cta_engagement_tracking`

**Edited (UI/presentation only, per project guardrails):**
- `src/pages/blog/BlogPostPage.tsx` — mount attribution hook, inject Inline CTA into markdown render, swap aside for `BlogEndCTABlock`, add sticky mobile CTA
- `src/components/admin/blog/SocialSharePanel.tsx` — add a small "View analytics" link to the new dashboard for this post

**No backend schema changes required** — `social_share_links` and `cta_engagement_tracking` already exist. No edge function changes. No edits to App.tsx routing beyond adding the admin analytics page route (will confirm exact location before editing).

---

## 5. What you do per platform when posting

For the example post you pasted:

| Platform | What to copy | Click "Copy caption + link" with platform set to |
|---|---|---|
| Facebook | caption + facebook-stamped URL | Facebook |
| WhatsApp | caption + whatsapp-stamped URL (use Status or broadcast) | WhatsApp |
| LinkedIn | caption + linkedin-stamped URL | LinkedIn |

Each generates a distinct `utm_source` + `utm_content` (e.g. `-fb`, `-wa`, `-li`), so GA4 and the admin dashboard separate them cleanly. The caption is auto-tuned per platform by the existing edge function.

---

## 6. Open questions before I build

1. **Sticky mobile CTA** — keep it (recommended for conversion) or skip to stay minimalist?
2. **Inline mid-article CTA** — inject automatically at ~50% of content, or only when post body contains a `[!CTA]` directive (author-controlled)?
3. **Admin dashboard scope** — per-post drilldown only, or also a top-level "all posts × all platforms" grid?
