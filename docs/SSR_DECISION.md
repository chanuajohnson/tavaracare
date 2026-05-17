# SSR / SSG decision for Tavara

**Status:** research only. No code changes yet. Decision needed before any implementation.

## The problem

Tavara is a Vite SPA. `react-helmet-async` injects per-route `<title>`, `<meta description>`, canonical, and Open Graph tags client side, after hydration. Two consequences:

1. **Googlebot is fine.** It executes JavaScript and reads the rendered head. Per-route SEO works for organic search today.
2. **Social crawlers are not.** WhatsApp, LinkedIn, Slack, Facebook, iMessage, Telegram do NOT execute JavaScript. They only see `index.html`'s static head. Every share preview falls back to the homepage OG image and homepage description, regardless of which page was shared.

We have already partially solved this for blog posts via the `blog-share` edge function (`/functions/v1/blog-share/:slug`). Pasting that URL into WhatsApp gets a correct per-post preview because the edge function returns static HTML with the post's own OG tags before redirecting humans to the canonical article URL.

The 8 new SEO landing pages (4 locations + 4 services), Index, About, FAQ, Features, Errands, Urgent, Legacy do NOT have this — pasting any of those URLs into WhatsApp shows the generic homepage card.

## The two realistic options

### Option A — `vite-plugin-ssg` (or `react-snap`) prerender at build

**What it does.** At `vite build` time, walk a known list of routes, render each one to static HTML, and write the rendered HTML to `dist/`. The hydrated React app still loads on top, so interactivity is unchanged. Social crawlers fetching `/care/port-of-spain` get real HTML with real per-route head tags, no JS execution needed.

**Scope.**
- Add a `vite-plugin-ssg`-style plugin
- Enumerate static routes (homepage, about, FAQ, features, errands, urgent-*, legacy, all 8 landing pages, blog index). Roughly 15 routes.
- Blog posts stay dynamic via the existing `blog-share` edge function — prerendering them at build means stale OG when posts are edited.
- Dashboard / admin / registration / auth routes excluded (they require auth and have no public SEO value).

**Pros.**
- Solves social previews for every public marketing page in one shot.
- No edge function per page. Cleaner URLs (no `/functions/v1/...`-style sharing).
- Side benefit: faster First Contentful Paint for crawled pages.
- Side benefit: pages render with content even with JS disabled.

**Cons.**
- New build dependency. Possible Vite plugin compatibility issues — needs a spike to confirm it works with our current Vite version, lazy loaded routes, and dynamic imports.
- Build time goes up.
- Any code that touches `window`, `document`, or browser-only APIs at module top level breaks the build. Some of our marketing components likely need guards.
- The `blog-share` edge function still needs to exist for blog posts (or we add ISR-style regen, which is more complex).

**Effort estimate.** 4–8 hours for the plugin spike + audit of marketing components for SSR safety + verifying every prerendered route renders correctly + redeploy.

### Option B — extend the `blog-share` pattern to a generic `og-redirect` edge function

**What it does.** Build a single edge function that takes any public route path, looks up its metadata (could be from a small static table in code, or pulled from the route component's `<SEO>` props at build time), and serves the same crawler-or-redirect pattern blog-share uses today. Sharing flow: the user copies a special share URL (e.g. `tavara.care/s/care/port-of-spain` rewritten to the edge function, or `cpdfmye…supabase.co/functions/v1/og-share/care/port-of-spain`).

**Pros.**
- No build-time changes. No plugin risk. Ships in a few hours.
- Centralised — one function handles every page.

**Cons.**
- Requires users to use a *different* URL when sharing. Friction. Marketing copy and any "share this" buttons must distinguish "human URL" vs "share URL". Today's blog UX already does this and it's manageable, but extending to 15+ pages multiplies surface area.
- LinkedIn and Facebook auto-fetch links pasted by users. If a user pastes the normal `/care/port-of-spain` URL (because it's what's in the browser address bar), they get the wrong preview. The only fix is for them to remember to copy a special share URL — which they will not.
- The metadata source (`<SEO>` props) lives in TSX, not easily accessible from an edge function. Either we duplicate the data into a shared TS module (already done for locations + services), or we add a build step to extract it. Maintenance overhead.

**Effort estimate.** 4–6 hours, but the UX hit is permanent.

## Recommendation

**Go with Option A (`vite-plugin-ssg` prerender).** Reasons:

1. It fixes the user-facing problem (pasting any tavara.care URL into WhatsApp gives a correct preview) without requiring users to know about special share URLs.
2. The blog-share edge function we already have keeps blog posts fresh, so prerender doesn't need to handle dynamic content.
3. Marketing copy never needs a "use this URL for sharing" caveat.
4. Side benefits (FCP, no-JS rendering) compound over time as we add more SEO landing pages.

**Suggested next step:** a 2-hour spike — install `vite-plugin-ssg` (or `vite-prerender-plugin` or `react-snap`), prerender exactly one route (`/care/port-of-spain`), confirm the build succeeds, the rendered HTML carries the per-route SEO tags, and the hydrated app still works. If the spike succeeds, expand to the full route list in a second pass. If it fails (plugin incompatibility, browser-API errors in marketing components that can't be guarded quickly), fall back to Option B for the highest-traffic 4-6 pages only.

**What I am NOT recommending:** migrating to Next.js or TanStack Start. Both would solve this elegantly but are weeks of work, not hours, and would breach the routing/architecture guardrails for this project.

## Acceptance test (whichever option is chosen)

Paste each of these URLs into WhatsApp on a phone and verify the preview card shows the page-specific image, title, and description (not the homepage fallback):

- `https://tavara.care/care/port-of-spain`
- `https://tavara.care/services/dementia-care`
- `https://tavara.care/about`
- `https://tavara.care/blog/why-families-resist-care` (already works via blog-share)

Also re-check the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) and [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) for the same URLs.
