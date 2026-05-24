## Change

In `src/components/landing/LandingPageScaffold.tsx`, change the default `primaryCtaHref` fallback from `/registration/family` to `/family/readiness-quiz`.

This affects both CTA placements (hero + closing) on all five location pages (Port of Spain, San Fernando, Arima, Tobago, Diamond Vale), since none of them override `primaryCtaHref` in `locationsData.ts`. The label "Start arranging care" stays the same, matching the blog-post split-CTA pattern where families land in the quiz first to scope needs before registration.

## Out of scope

- `secondaryCtaHref` (still `/urgent-caregivers`)
- Registration flow files, AppRoutes, sitemap, locationsData, individual page files
- Blog post CTAs (already correct)

## Verification

Load `/care/diamond-vale` and `/care/port-of-spain` in preview, click "Start arranging care" — should route to `/family/readiness-quiz`.
