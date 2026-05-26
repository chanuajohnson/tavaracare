
## The actual problem

Your analytics show 338 visitors → ~14 caregiver dashboard users. The Trinidad cost blog pulls 150 visitors but they leave in 19s. Diamond Vale: 75 visitors, 9s. SEO is working, the page is not.

The Acquisition Funnel Card we just built will confirm where the leak is, but the diagnosis is already obvious from the numbers you shared:

- **Top-of-funnel** (Google → blog landing): working
- **Landing → first meaningful action**: broken — most visitors leave before scrolling past the hero
- **CTA click → registration page view**: unknown, but irrelevant if step above is bleeding 90%
- **Registration page view → completion**: unknown, suspected to drop on the long family form

This plan does NOT touch subscriptions. Goal is `family_registration_complete` + `professional_registration_complete` events going up.

## Scope: three surgical fixes, in priority order

### Fix 1 — Above-the-fold conversion on every blog post (biggest lever)

A 9–19s bounce means the visitor never saw `BlogTopCTA`. It currently sits *below* the article header, audio player, and reading context block. By the time it paints on mobile (997px viewport user is on counts as desktop, but most blog traffic is mobile), it is below the fold.

**What changes in `src/pages/blog/BlogPostPage.tsx`:**
- Move `<BlogTopCTA />` to render **immediately after the H1 + byline**, before audio player, reading context, and article body.
- Add a one-line "social proof / outcome" strip directly under the H1 (e.g. "Families in Trinidad arranging care in under 7 days") — pulled from a small constant, no new data source.
- Keep `BlogInlineCTA`, `BlogEndCTABlock`, `BlogStickyMobileCTA` exactly as-is.

**What changes in `src/components/blog/BlogTopCTA.tsx`:**
- Visual upgrade only: make it look like a primary action, not a muted aside. Stronger contrast border, primary-tinted background, larger tap targets. Still two buttons (family + professional).
- Copy tightened to outcome language: "Find care this week" / "Get matched with families".
- No tracking changes — `trackBlogCtaClick` already fires.

### Fix 2 — Trinidad cost blog & Diamond Vale location page get a dedicated hero CTA

These two URLs are your top SEO entry points. They deserve a page-specific hero block (not just the generic `BlogTopCTA`) that answers the implicit query in the search:
- Cost-of-care searchers want a number + a "see if you qualify" path
- Location-page searchers want "is care available in my area" + a quick action

**What changes:**
- In `BlogPostPage.tsx`, add an optional `heroCta` slot driven by post slug. When slug matches `cost-of-care-trinidad` or `diamond-vale-*`, render a slug-specific hero component above `BlogTopCTA` with the relevant hook + single primary CTA (family quiz). Generic posts get nothing extra.
- New file: `src/components/blog/hero-cta/CostHeroCTA.tsx` and `LocationHeroCTA.tsx`. ~50 lines each, no new data, reuses `buildCtaDestination` + `trackBlogCtaClick` with new placement IDs `hero-cost` and `hero-location` so the funnel card can isolate their performance.

### Fix 3 — Shorten the perceived registration form for the family quiz path

The family quiz (`/family/readiness-quiz`) is the soft on-ramp. The full `FamilyRegistration.tsx` form is **protected and out of scope per your guardrail**, so we do not touch it. Instead:

- Verify the quiz path actually exists and lands the user somewhere that fires `family_registration_page_view`. If it doesn't, we add the event fire on the quiz landing (one-line addition to existing page).
- No form field changes. No `FamilyRegistration.tsx` edits.

## What we measure after shipping

The Acquisition Funnel Card on `/admin/blog/analytics` will show, within 48 hours of traffic:
- `blog_utm_landed` → `blog_cta_click` ratio should jump from ~19% to 30%+ if Fix 1 works
- New placements `hero-cost` and `hero-location` get isolated rows so we can prove Fix 2's value
- `family_registration_complete` count should rise even with the same top-of-funnel volume

If the landing→click rate doesn't move after Fix 1, the problem isn't the CTA position — it's page relevance, and the next plan would be content rewrites on those two specific URLs.

## What this plan deliberately does NOT do

- No changes to `FamilyRegistration.tsx`, `App.tsx`, routing, navigation, or any protected file
- No subscription / pricing changes
- No GA4 wiring (separate follow-up)
- No new tables, migrations, edge functions, env vars, or dependencies
- No A/B testing infrastructure — we ship the better version and watch the funnel card
- No copy rewrites on the actual blog post bodies — only the CTA surrounds

## Files touched

| File | Change |
| --- | --- |
| `src/pages/blog/BlogPostPage.tsx` | Reorder: TopCTA right after H1; add slug-based hero slot |
| `src/components/blog/BlogTopCTA.tsx` | Visual + copy upgrade, same tracking |
| `src/components/blog/hero-cta/CostHeroCTA.tsx` | New, ~50 lines |
| `src/components/blog/hero-cta/LocationHeroCTA.tsx` | New, ~50 lines |

Four files, two new, all frontend, all presentation. Funnel card already in place will tell us within days whether it worked.
