# SSG Prerender Spike — fix social previews on tavara.care

Goal: make pasting any public marketing URL (e.g. `/care/port-of-spain`) into WhatsApp/LinkedIn/Slack/Facebook show the correct per-route title, description, and OG image — without those crawlers executing JavaScript.

Approach: build-time prerender to static HTML, served by Lovable hosting's "if a file exists at the path, serve it" rule. The hydrated SPA still loads on top, so all interactivity is unchanged.

## Why this works on Lovable hosting

Lovable's static host serves real files when they exist and falls back to `index.html` otherwise. So if the build emits `dist/care/port-of-spain/index.html` with proper head tags, that file is served to crawlers and humans alike. The hydrated React app then takes over for humans. No edge function, no hosting config.

## Step 1 — One-route spike (≈1 hr)

Goal: prove the toolchain works end-to-end before touching 15 routes.

1. Install `vite-plugin-prerender` (or `vite-prerender-plugin` — pick whichever is currently maintained and SWC-compatible; fall back to a tiny custom `puppeteer`/`playwright` post-build script if neither works cleanly with `@vitejs/plugin-react-swc`).
2. Configure it to prerender exactly one route: `/care/port-of-spain`.
3. Build locally. Verify:
   - `dist/care/port-of-spain/index.html` exists
   - Its `<head>` contains the per-route `<title>`, `<meta name="description">`, canonical, `og:*`, `twitter:*`, and the `LocalBusiness` + `FAQPage` JSON-LD from `<LandingPageScaffold>`
   - The hydrated app still mounts on top (no double-render, no hydration mismatch warnings)
4. If the spike fails (plugin incompatibility, top-level `window`/`document` access in some dependency that can't be guarded quickly), stop and report; fall back to a narrower Option B (extending the `blog-share` edge-function pattern) for the highest-traffic 4–6 pages only.

## Step 2 — Expand to full route list (≈2 hrs)

If the spike passes, add these routes to the prerender list:

- `/` (Index)
- `/about`
- `/faq`
- `/features`
- `/errands`
- `/legacy`
- `/privacy`
- `/blog` (index only — individual posts stay on the existing `blog-share` edge function so edits don't go stale)
- `/care/port-of-spain`, `/care/san-fernando`, `/care/arima`, `/care/tobago`
- `/services/elder-care`, `/services/dementia-care`, `/services/post-surgery-care`, `/services/live-in-care`
- Public urgent pages (read-only, no auth) — confirm list before including

Excluded (no SEO value, require auth, or behavior-heavy): `/dashboard/*`, `/admin/*`, `/registration/*`, `/auth`, chat surfaces, anything behind `AuthProvider`-gated routes.

## Step 3 — SSR-safety audit (≈1–2 hrs, runs in parallel with Step 2)

Prerender executes React in Node. Anything that touches `window`, `document`, `localStorage`, `navigator`, or `matchMedia` at module top level or in the initial render path breaks the build.

Audit scope: only components actually rendered by the routes in Step 2. Specifically:
- `LandingPageScaffold` and its imports
- `SEO` component
- `Navigation`, `Footer`, page-level marketing components for the listed routes
- Any analytics / tracking pixels that fire on mount (guard with `typeof window !== 'undefined'` or move to `useEffect`)

Out of scope: chat flow, registration, dashboards, AuthProvider internals — none of these are prerendered.

## Step 4 — Verify (≈30 min)

1. Build, deploy to preview.
2. Run the existing acceptance test in `docs/SSR_DECISION.md`:
   - View-source on each prerendered URL — confirm per-route head tags are in the static HTML
   - Paste 3 sample URLs (one location, one service, `/about`) into WhatsApp and verify per-page preview cards render
   - Run Facebook Sharing Debugger and LinkedIn Post Inspector on the same URLs
3. Smoke-test the hydrated app: navigate between pages, confirm no console errors, confirm interactive elements (WhatsApp CTA, FAQ accordion) work.

## Guardrails (per project rules)

- **No changes to** `src/App.tsx` routing, `AuthProvider`, registration flows, chat flow files, dashboards, or anything under `src/pages/registration/`.
- Prerender list is data-only — adding/removing routes from prerender does NOT change the React Router tree.
- `index.html` static head stays as the fallback for any non-prerendered route.
- `blog-share` edge function stays exactly as-is.

## Deliverables

- Updated `vite.config.ts` with prerender plugin
- A small `prerender.config.ts` (or inline config) listing the routes
- Any SSR guards added to components flagged in Step 3 (minimal, surgical)
- Updated `docs/SSR_DECISION.md` marking the decision as "Implemented via Option A" with results from the acceptance test

## What this plan explicitly does NOT do

- Does not migrate to Next.js, Remix, or TanStack Start
- Does not prerender individual blog posts (the edge function already handles that)
- Does not prerender any authenticated route
- Does not change any per-page copy, design, or SEO content — only the *delivery mechanism* of the head tags

## Open question before I implement

Confirm: prerender exactly the route list in Step 2, or do you want me to also include `/urgent`, `/urgent/*` public pages? Default if you don't reply: include only `/urgent` (the public index), exclude per-family urgent pages until reviewed.