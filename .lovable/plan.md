## Plan: redirect caregiver CTA on location pages to signup

Change the secondary CTA on every /locations page so caregivers land on the signup flow used by the blog "For caregivers" CTA, instead of `/urgent-caregivers`.

### What changes

**`src/components/landing/LandingPageScaffold.tsx`** — update the two default values used when a location does not override the secondary CTA:

- `secondaryCtaHref` default: `/urgent-caregivers` → `/registration/professional`
- `secondaryCtaLabel` default: `Browse available caregivers` → `Join a coordinated care team`

This button appears in the hero on every location page (Port of Spain, San Fernando, Arima, Tobago, Diamond Vale). None of the location entries in `locationsData.ts` override these defaults, so this single change covers all five pages.

No other surfaces, routes, or CTAs change. The primary CTA (`Start arranging care` → `/family/readiness-quiz`) stays exactly as is.