
# SEO follow-through plan

GSC is verified for `tavara.care` ✅ (screenshot confirms property is live, processing data). Here's how we knock down the rest, in the order that gives the most SEO lift per hour.

## 1. Submit sitemap to GSC (5 min) — do first
Use the connected Google Search Console connector to POST our sitemap so Google starts crawling immediately instead of waiting on discovery.

- Endpoint: `PUT /webmasters/v3/sites/sc-domain%3Atavara.care/sitemaps/https%3A%2F%2Ftavara.care%2Fsitemap.xml`
- Verify it lands under **Sitemaps** in GSC.

## 2. Image alt-text audit (1–2 hrs)
Sweep all public-route components for `<img>` and `<Avatar>` without meaningful `alt`. Scope:
- `src/pages/Index.tsx`, `About`, `FAQ`, `Features`, `Errands`, `Urgent*`, `Legacy*`, `Blog*`
- Hero/marketing components under `src/components/`
- Fix: add descriptive alts (not "image" / not filename). Decorative images → `alt=""`.

Deliverable: ripgrep report of offenders + fixes in one pass.

## 3. Four location landing pages (the big lift)
New directory `src/pages/locations/` with one page per city, each route registered in `src/App.tsx` (additive — no existing routes touched, per guardrail).

Pages:
- `/care/port-of-spain`
- `/care/san-fernando`
- `/care/arima`
- `/care/tobago`

Each page (~600–800 words, identical scaffold, unique copy):
- H1 with city + "care coordination"
- `<SEO>` with unique title/description/canonical, `LocalBusiness` JSON-LD scoped to that city's `areaServed`
- Sections: local context, care tiers ($40/$45/$50+ per hour — per public-pricing rule), how matching works, urgent care CTA, FAQ (3–4 Qs), link to `/registration/family`
- Reuse existing components (hero, pricing card, FAQ accordion). No new business logic.

Add all 4 to `public/sitemap.xml` + `public/llms.txt`.

## 4. Four service landing pages
New directory `src/pages/services/`:
- `/services/elder-care`
- `/services/dementia-care`
- `/services/post-surgery-care`
- `/services/live-in-care`

Same scaffold as locations but `Service` JSON-LD, scoped to that care type. Cross-link to relevant locations. Sitemap + llms.txt update.

## 5. SSR/SSG decision (research only, no code)
Investigate path forward for social-crawler-accurate per-route OG tags. Two realistic options for Lovable's Vite stack:
- **(A) `vite-plugin-ssg`** — prerender static routes (locations, services, blog index, about, FAQ) at build. Blog posts stay dynamic via existing `blog-share` edge function. Lowest risk, biggest payoff.
- **(B) Extend the `blog-share` pattern** with a generic `og-redirect` edge function for marketing routes too. Cheaper, uglier share URLs.

Deliverable: short written recommendation, no implementation yet.

## What I won't touch (guardrails)
- `src/App.tsx` routing — only **additive** route entries for new pages, no restructuring
- Registration flows, chat flows, AuthProvider, dashboards
- Existing per-page SEO components

## Suggested execution order
1. Submit sitemap to GSC (5 min)
2. Alt-text audit + fixes (1 pass)
3. Location pages × 4 (one PR-sized batch)
4. Service pages × 4 (one PR-sized batch)
5. SSR write-up

## One question before I start
Do you want me to **(A)** do all 5 in sequence in this session, or **(B)** start with #1 + #2 + the SSR write-up, then have you review copy direction before I generate 8 landing pages?
