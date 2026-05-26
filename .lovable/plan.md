# Acquisition Funnel + GA4 Foundations (adapted to Vite + Supabase)

The pasted external plan is mostly right in spirit but written for Next.js (App Router, `process.env`, `/api/...` route handlers, `@google-analytics/data` service account). This project is Vite + React + Supabase, so the equivalents are different. Below is what's actually useful, adapted.

## What we'll do now (B — Acquisition Funnel)

Build the funnel card from your own `cta_engagement_tracking` data. No GA4 dependency, no service account, no new env vars. Works immediately.

### Files

- **New** `src/components/admin/blog-analytics/AcquisitionFunnelCard.tsx` — the card itself.
- **Edit** `src/pages/admin/BlogAnalyticsLeaderboardPage.tsx` — mount the card directly under `<KpiStrip />`, inside the same 7/28/90 day range it already controls.
- **Edit** `src/hooks/admin/useBlogAnalyticsRange.ts` — add `subscription_started`, `whatsapp_click`, `caregiver_match_request`, `quiz_cta_click` to the `TRACKED` array so the bottom of the funnel pulls through when those events start firing.

### Funnel rows

```text
Blog/Location landing      812  ████████████████████  100%
CTA click                  156  ███▌                   19%   ↓ 81% drop
Registration page view      94  ██▎                    12%   ↓ 40% drop
Registration completed      31  ▊                       4%   ↓ 67% drop
Subscription started         6  ▏                     0.7%   ↓ 81% drop
```

Drop-off color: green <40%, amber 40–70%, red >70%. Tabs for **Family** / **Professional** / **Combined** using `additional_data.role` where present.

### Logic (pure derivation, no new queries)

```text
landings     = count(blog_utm_landed) + count(location_utm_landed)
ctaClicks    = count(blog_cta_click)
regPageViews = count(family|professional_registration_page_view)
regCompleted = count(family|professional|community_registration_complete)
subStarted   = count(subscription_started)   // 0 until event is wired
```

Footer caption flags the worst leak: *"Biggest drop-off: landing → CTA click (81%)."*

## What's worth pulling from the external plan (deferred — plan A follow-up)

Useful ideas adapted to this stack, NOT being implemented in this pass:

1. **Centralised tracker** — add `src/lib/analytics/trackEvent.ts` that writes to BOTH `cta_engagement_tracking` (existing) AND `window.gtag('event', ...)` in one call. This is the foundation for everything else and the natural seam for plan A.
2. **Standard GA4 `purchase` event** alongside custom `subscription_started` so GA4 revenue reports work automatically. Fire from the Stripe/PayPal webhook server-side for reliability — you already have `paypal-webhook` edge function as the right home for this.
3. **Mirror these to GA4** when (1) is in place: `family_registration_complete`, `professional_registration_complete`, `blog_cta_click`, `readiness_quiz_completed`, `whatsapp_click`, `caregiver_match_request`.
4. **Unified `registration_complete` event** with `user_type` param instead of three separate event names — cleaner GA4 reports.

## What to discard from the external plan

- `process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID` → this project uses `import.meta.env.VITE_*`.
- `app/api/admin/analytics/funnel/route.ts` Next.js route handler → not applicable; equivalent here would be a Supabase edge function, but we don't need one because we already have the data in `cta_engagement_tracking`.
- `@google-analytics/data` + `GA4_SERVICE_ACCOUNT_KEY` → only needed if we want admin dashboards to read GA4 directly. Your internal table is better and avoids GA4 API quotas.
- Tailwind classes used (`bg-blue-500`, `bg-gray-200`, etc.) → must be replaced with your semantic tokens (`bg-primary`, `bg-muted`, `bg-destructive`, `text-foreground`) per the design system.

## Out of scope for this card

- GA4 wiring (saved for plan A).
- Stripe/PayPal `purchase` event mirroring.
- Schema changes (none — uses existing `cta_engagement_tracking`).
- Backfill of events that aren't tracked yet.

## Effort

~150 lines, one new file, two small edits. No migrations, no edge functions, no env vars, no new dependencies.
