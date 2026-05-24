
# Diamond Vale landing page + "Know someone who can benefit from Tavara?" referral post

Two shareable assets your friend (and anyone else) can drop into a WhatsApp group. One is location-anchored to Diamond Vale; the other is evergreen and works for every community.

## 1. New location page: `/care/diamond-vale`

Mirror the existing Arima / Tobago / Port of Spain / San Fernando pattern exactly — no new components, no routing changes beyond one line, no new conventions.

**Files**
- `src/pages/locations/locationsData.ts` — append a `diamondVale: LandingPageData` export, same shape as `arima`/`tobago`. Slug `care/diamond-vale`, kicker "Diamond Vale · Diego Martin", H1 "In-home care in Diamond Vale". Copy covers: Diamond Vale + surrounding Diego Martin pockets (Petit Valley, Glencoe, Westmoorings, Carenage), aging-in-place for parents/grandparents, neighbour-to-neighbour trust, care team continuity, urgent coverage, $40/$45/$50+ care rates only (per financial-privacy guardrail), 4 FAQs.
- `src/pages/locations/DiamondValePage.tsx` — 5-line scaffold wrapper, identical to `ArimaPage.tsx`.
- `src/components/routing/AppRoutes.tsx` — one import line + one `<Route path="/care/diamond-vale" element={<DiamondValePage />} />` next to the other four. This is the only routing touch.
- `public/sitemap.xml` — add `<url><loc>https://tavara.care/care/diamond-vale</loc>…</url>` next to the other care locations.
- `src/pages/NotFound.tsx` — add `/locations/diamond-vale` to the suggested-paths array (matches existing convention).

Editorial guardrails honoured: no em/en-dashes, no banned AI words, no "hire / agency / client / patient", uses "arrange care / loved one / care team / household / match", per-hour rate only ("care rate", not "wage"), no subscription dollar amounts.

## 2. New blog post: "Know someone who can benefit from Tavara? Start here."

Evergreen, location-agnostic, designed for neighbour-to-neighbour WhatsApp sharing. Uses the existing blog system (DB row + `/blog/<slug>` + `blog-share` edge function for rich previews) — no new components.

**File / data**
- `scripts/seed_blog.ts` — add a new entry (or insert directly via admin /admin/blog/new). Slug: `know-someone-who-needs-care-trinidad-tobago`. Category: `Cultural & Community`. Author: Chanua Johnson. Cover image: existing community/family image already in `src/assets` (no new image generated unless you ask).

**Body structure (short, scan-friendly, WhatsApp-readable)**
1. Opening hook — "Everybody knows somebody." Aging parent, post-stroke recovery, family overseas trying to coordinate from afar.
2. What Tavara actually does — coordinate the match, hold the schedule, daily log, back-up coverage. Platform, not agency.
3. Split CTA section with two clear paths:
   - **For families** — "If your loved one needs care" → button → family quiz `/family-readiness-quiz?utm_source=blog&utm_medium=referral&utm_campaign=know-someone&utm_content=family-cta`
   - **For caregivers** — "If you do this work" → button → `/registration/professional?utm_source=blog&utm_medium=referral&utm_campaign=know-someone&utm_content=caregiver-cta`
4. "Why share this" — neighbour-to-neighbour trust, faster than searching, no obligation.
5. Short FAQ (3 items): Is it free to start? What does it cost? What if the match isn't right?

**Split-CTA rendering** — the blog body already supports markdown links and the existing `cta_label`/`cta_href` single-CTA field. Use the body for both inline CTAs (markdown buttons / styled links handled by current blog renderer) and set the post-level `cta_label`/`cta_href` to the family quiz (the higher-intent path). No blog renderer changes.

**Sitemap** — add the new blog URL to `public/sitemap.xml`.

## 3. Wire the two together

- The Diamond Vale page's existing scaffold already has CTAs (family + professional). No changes.
- The blog post body includes one short line: "Caregivers and families in Diamond Vale, [Diamond Vale page link]." So your friend can share *either* URL and the reader can hop between them.
- Both URLs work with the existing `getBlogShareUrl` / location-page share buttons for rich WhatsApp previews via the `blog-share` edge function (blog post only) and per-route `Helmet` meta (location page).

## Out of scope

- No changes to `App.tsx` root, `AuthProvider`, registration flows, chat flows, or any protected component.
- No new shared components, no design system changes, no new edge functions.
- No image generation unless you ask after reviewing — we'll reuse an existing asset.
- No changes to other location pages.

## What you'll be able to do after

Send your friend two URLs:
- `https://tavara.care/care/diamond-vale` — for Diamond Vale specifically
- `https://tavara.care/blog/know-someone-who-needs-care-trinidad-tobago` — evergreen, split CTA, works in any group chat

Both render rich previews when pasted into WhatsApp (blog uses the share edge function; location page uses Helmet meta which previews well in JS-executing crawlers and falls back to the sitewide OG card elsewhere).
