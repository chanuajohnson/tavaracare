## Goal

Remove the pricing-disclosure footnote from all four `/care/*` location pages. Sitemap and link-validator coverage already verified — no work needed there.

## Change

Edit `src/components/landing/LandingPageScaffold.tsx` (single source for all four /care pages):

- Delete lines 139–141:
  ```
  <p className="text-xs text-muted-foreground mt-3">
    Care rates are paid directly to the caregiver. Subscription tier details are shared privately during onboarding.
  </p>
  ```
- Keep the 3 pricing tier cards above it (Standard $40 / Full Service $45 / Premium $50+) — these are explicitly allowed on public surfaces per the financial-privacy guardrail.

That removes the line from `/care/port-of-spain`, `/care/san-fernando`, `/care/arima`, and `/care/tobago` in one edit.

## Already verified — no action needed

- **Sitemap** (`public/sitemap.xml`): all four `/care/*` URLs present at priority 0.9, changefreq monthly.
- **Link validator** (`src/lib/blog/linkValidation.ts`): all four `/care/*` paths in `KNOWN_ROUTES`. Blog posts can safely link to them.

## Out of scope

- No copy changes to the per-location intro/sections/FAQs.
- No changes to the pricing tier cards themselves.
- No sitemap or link-validator edits (already correct).

## Verification

After implementing, visit each of `/care/port-of-spain`, `/care/san-fernando`, `/care/arima`, `/care/tobago` and confirm the footnote line is gone while the three tier cards remain.
