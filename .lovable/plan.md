# SEO Next Steps — Post-GSC Verification

Good news: most of your status list is already shipped. Here's the actual state and what's left.

## Already done (no work needed)

| Item | Status |
|---|---|
| GSC verification | Verified via DNS (your screenshot) |
| Unique page titles | 12 pages use `<SEO>` component with unique titles |
| Unique meta descriptions | Same — per-page via `<SEO>` |
| H1 on Home + About | Done in earlier turns |
| robots.txt + sitemap.xml | Live at `/robots.txt` and `/sitemap.xml` (16 URLs) |
| OG / Twitter Card tags | Sitewide in `index.html` + per-page overrides |
| LocalBusiness schema | Already in `index.html` head |
| Canonical tags | Per-page via `<SEO>` component |
| og-image.png | Exists at `public/og-image.png` |

## Quick wins (this session — ~30 min)

### 1. Submit sitemap to Google Search Console
Now that `tavara.care` is verified, push the sitemap so Google starts crawling all 16 routes immediately instead of discovering them organically.
- Single API call via the GSC connector: `PUT /webmasters/v3/sites/{site}/sitemaps/{feedpath}` with `https://tavara.care/sitemap.xml`.

### 2. Add `/llms.txt` for AI crawlers
ChatGPT, Perplexity, and Claude use `/llms.txt` to understand the site without parsing the JS shell. Cheap win for AI-driven referrals — increasingly important for a care-coordination platform people ask AI about.
- Create `public/llms.txt` with site summary + curated links to key public pages (Home, About, Errands, Join as Caregiver, Urgent Families, Urgent Caregivers, FAQ, Legacy Stories).

### 3. Audit image alt text on public pages
Scan the public marketing pages (Home, About, Errands, Features, Professional, Community, Legacy, Urgent Families, Urgent Caregivers, Join as Caregiver) for `<img>` tags missing or with empty `alt`. Fix in place with descriptive alt text. UI-only change, no logic touched.
- Scope: public/marketing pages only. Skip dashboard/admin/registration (already `Disallow`'d in robots.txt).

## Medium-term (separate sessions, content-heavy)

### 4. Blog — first 4 articles
Needs a content decision before implementation. Options to consider:
- Routes: `/blog` index + `/blog/[slug]` posts
- Source: MDX files in `src/content/blog/` (no DB), or Supabase table (CMS-style)
- Per-post `Article` schema + sitemap entries auto-generated

I'll plan this in detail when you're ready — but it needs the 4 article topics + drafts first. Suggested topics based on your keyword targets:
1. "How to find a trusted caregiver in Trinidad & Tobago"
2. "Senior care costs in T&T: a 2026 family guide"
3. "Dementia care at home: what families need to know"
4. "Hiring a private caregiver vs an agency: pros & cons"

### 5. Location landing pages (4 cities)
Routes like `/care/port-of-spain`, `/care/san-fernando`, `/care/arima`, `/care/chaguanas`. Each with city-specific H1, copy, LocalBusiness schema scoped to that area, and CTAs to Urgent Families / Join as Caregiver.

### 6. Service landing pages (4 services)
Routes like `/services/elderly-care`, `/services/dementia-care`, `/services/post-surgical-care`, `/services/companion-care`. Each with `Service` schema + FAQ subset.

Both #5 and #6 are template work — one component, parameterized by data. ~2 days each once content is ready.

## Long-term (architectural)

### 7. SSR/SSG investigation
Currently Vite SPA — `<Helmet>` works for Googlebot (executes JS) but not for LinkedIn/Slack/Facebook preview crawlers (they only see `index.html` static head). Options:
- **Migrate to Next.js / Remix** — biggest lift, full SSR, best SEO. Breaking change.
- **Vite SSR with `vite-plugin-ssr` / `vike`** — keeps Vite, adds SSR. Medium lift.
- **Prerender at build time** with `vite-plugin-prerender` for the ~16 public routes — smallest lift, no runtime server needed, fixes social previews. **Recommended first step.**

Needs its own discovery session.

## Technical details

- Sitemap submission uses existing `GOOGLE_SEARCH_CONSOLE_API_KEY` connector — no new secrets.
- `llms.txt` is a static file in `public/` — no build changes.
- Alt-text fixes are pure JSX edits in existing components.
- All changes respect the guardrails: no routing, no `App.tsx`, no auth/registration touches.

## Recommendation

Approve this plan to execute steps **1–3 now** (sitemap submission + llms.txt + alt-text audit, ~30 min total). Then we tackle #4 (blog) once you decide on topics + draft content, and #7 (prerender) as a focused follow-up.