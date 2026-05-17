## Tavara.care SEO Foundation — Implementation Plan

Scoped to the technical/on-page SEO items in your audit. Content work (blog articles, location landing pages, SSR migration) is called out at the end but not implemented in this plan — those are separate multi-week tracks.

### Phase 1 — Sitewide infrastructure (one-time setup)

1. **robots.txt** — create `public/robots.txt`:
   ```
   User-agent: *
   Allow: /
   Disallow: /dashboard/
   Disallow: /admin/
   Disallow: /registration/
   Sitemap: https://tavara.care/sitemap.xml
   ```

2. **sitemap.xml generator** — create `scripts/generate-sitemap.ts` and wire `predev` + `prebuild` npm scripts. Base URL: `https://tavara.care`. Entries: every public route in `src/App.tsx` excluding `/dashboard/*`, `/admin/*`, `/registration/*`, `/auth*`, `*` (404), and gated/internal routes. I'll audit `src/App.tsx` to list them all (home, /about, /features, /errands, /community, /caregivers/*, /family/*, /professional/*, /legacy, /marketing, /tav, /urgent-*, /legal/*, etc.) and keep only indexable public pages.

3. **react-helmet-async** — install, wrap app in `<HelmetProvider>` in `src/main.tsx` (outside `BrowserRouter`). This is the only safe way to do per-route head without touching `App.tsx` routing logic.

4. **Remove sitewide canonical from `index.html`** so per-route Helmet canonicals don't duplicate.

### Phase 2 — index.html sitewide head

Update `index.html`:
- Replace `<title>Tavara.care</title>` with the brand fallback title.
- Keep a generic fallback meta description (social crawlers don't run JS).
- Add sitewide OG tags (og:site_name, og:type=website, og:image at `/og-image.png` which already exists).
- Add Twitter card tags.
- Add `Organization` JSON-LD (sitewide identity).
- Add `LocalBusiness` JSON-LD (Trinidad and Tobago, areaServed Caribbean + diaspora-friendly wording).

### Phase 3 — Per-page `<Helmet>` blocks

Add a small `<SEO>` helper component (`src/components/seo/SEO.tsx`) that takes `{ title, description, canonicalPath, ogImage?, schema? }` and renders Helmet tags + canonical. Then drop `<SEO …/>` into each public page component. Pages to update with the exact copy from your audit:

| Page | Component | Title | Description |
|---|---|---|---|
| Home | `src/pages/Index.tsx` (or current home) | Find a Caregiver Near You \| Tavara — Care Coordination Platform | Connect with qualified caregivers… |
| About | `src/pages/about/AboutPage.tsx` | About Tavara \| Community-Based Care Coordination for Families | … |
| Errands | `src/pages/errands/ErrandsPage.tsx` | On-Demand Errands for Seniors & Families \| Tavara Care | Book on-demand errand services… |
| Professionals overview | `src/pages/professional/ProfessionalFeaturesOverview.tsx` | Caregiver Jobs Near You \| Join Tavara as a Care Professional | … |
| Community | `src/pages/community/CommunityFeaturesOverview.tsx` | Join a Care Circle in Your Community \| Tavara Village Network | … |
| Features | `src/pages/features/FeaturesPage.tsx` | Platform Features \| Tavara Care Coordination | … |
| Urgent Caregivers / Families | the two urgent pages | targeted titles | … |
| Legacy Stories | `src/pages/legacy/LegacyStoriesPage.tsx` | … | … |
| Privacy | `src/pages/legal/PrivacyPolicyPage.tsx` | Privacy Policy \| Tavara | … |

Each gets a unique canonical (`https://tavara.care<route>`).

### Phase 4 — Schema markup

- **LocalBusiness** in `index.html` (sitewide).
- **FAQPage** schema injected via `<SEO schema={…}>` on Home + About once you confirm the FAQ copy (I'll use existing visible Q&A content from those pages; no new copy invented).
- **Service** schema on Errands page (name = "On-Demand Errand Services", provider = Tavara).

### Phase 5 — H1 + alt text pass

- Home: wrap hero headline in `<h1>`. Brand phrase becomes subtitle.
- About: `AboutPage.tsx` — convert the brand logo block + "It takes a village to care" into a real `<h1>` (keyword-led) with the tagline beneath. I will NOT change the visible logo image, only add a semantic h1.
- Errands, Features, Community, Professionals: ensure exactly one `<h1>` per page (audit current heading levels and promote/demote as needed).
- Alt text: sweep `<img>` tags in public pages (hero, About, Errands, Features) and add descriptive alts. Will only touch images currently missing alt or using filler.

### Phase 6 — Google Search Console verification

Use the Google Search Console connector to:
1. Request a META verification token for `https://tavara.care/`.
2. Inject the meta tag into `index.html`.
3. Call verify, then add the site as a property and submit the sitemap.

(Requires the connector + a publish so the meta tag is live on the production domain. I'll do steps 1–2 in code and queue steps 3–4 for after you publish.)

### Out of scope for this plan (called out separately)

- Blog system (`/blog/*` with CMS or MDX) — separate build.
- Location landing pages (`/care/port-of-spain`, etc.) — separate build, needs content + caregiver-by-location query.
- Service landing pages (`/senior-care`, `/dementia-care`, etc.) — separate build.
- SSR / SSG migration — would require leaving Vite SPA; not done without explicit go-ahead since the guardrails protect routing and `App.tsx`. I'll note the limitation in a comment but not migrate.
- GA4 setup — `G-GSZ843MWBM` is already wired in `index.html`. Linking GA4 ↔ Search Console is a console-side action you do after verification.

### Files touched (summary)

- `public/robots.txt` (new)
- `scripts/generate-sitemap.ts` (new) + `package.json` predev/prebuild
- `index.html` (head: title, description, OG, Twitter, Organization + LocalBusiness JSON-LD, GSC verify meta)
- `src/main.tsx` (add `HelmetProvider` wrapper only — does not touch routing)
- `src/components/seo/SEO.tsx` (new helper)
- ~10 public page components: add `<SEO>` + ensure proper `<h1>` + alt text
- `package.json` (add `react-helmet-async`)

### Guardrail compliance

- No changes to `src/App.tsx` routes, `Navigation`, `AuthProvider`, registration pages, dashboards, or chat flow files.
- `main.tsx` change is additive (provider wrap) only — required for per-route head.
- All per-page edits are presentation/meta only.

Approve and I'll implement Phases 1–5 in one pass, then run Phase 6 (GSC verify) once you confirm the meta tag is live on production.
