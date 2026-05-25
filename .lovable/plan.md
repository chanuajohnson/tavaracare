# Upgrade `/admin/blog/analytics` to mirror your daily routine

Right now the page is a single 90-day leaderboard table. Your daily routine has three rhythms (pulse / campaign / weekly depth) and an annotation practice. The page should make those rhythms one-click instead of one-tab-in-GA4.

All upgrades stay inside `BlogAnalyticsLeaderboardPage.tsx` plus a few new components and one tiny table. Data comes from `cta_engagement_tracking` (already capturing `blog_utm_landed`, `location_utm_landed`, `blog_cta_click`, quiz events, registration page views).

## What gets added (top to bottom on the page)

**1. Time-range toggle — 7d / 28d / 90d**
Default 7d (the pulse view). All cards below respect it. Comparison vs previous equal-length window for delta arrows.

**2. KPI strip (5 tiles)**
- Landings (blog + location combined)
- CTA clicks
- Quiz starts → completions (with drop-off %)
- Registrations attributed to blog/location
- Engagement = clicks ÷ landings
Each tile shows the period delta (↑/↓ % vs previous window) — your "is the trend line moving?" answer at a glance.

**3. Campaign performance card** — *the Scully view*
Groups all UTM-landings (blog + location) by `utm_campaign → utm_source → utm_content`. Columns: campaign, source, destination, landings, CTA clicks, registrations, last seen. Sorted by landings. This is the "go to Traffic Acquisition → Session Campaign" step, but as a saved view that pre-filters to *your* live campaigns.

**4. Daily trend chart** — landings per day across the selected window, two series: blog landings vs location landings. Tiny `recharts` area chart. Lets you spot the spike Scully creates without leaving the page.

**5. Source / medium breakdown** — table of `utm_source` × `utm_medium` (whatsapp/dm, facebook/social, tiktok/social, direct, etc.) with landings, engagement rate, registrations. Lets you see at a glance which channel is doing the work.

**6. Location pages strip** — separate small card listing every `/locations/*` slug with landings + last visit in the window. Mirrors your "Pages & Screens → /locations/ filter" routine. Becomes more useful as more locations go live.

**7. Existing All-posts leaderboard** — kept as is, but respects the time-range toggle (not always 90d).

**8. Annotations log** — new small card at the bottom. Admins type a one-liner ("Scully outreach – Diamond Vale wave 1") with a date; it persists and renders inline markers on the daily-trend chart. This is the in-app version of your GA4 annotation practice so the dashboard tells the story 90 days from now without you having to remember.

## Data + storage

- All charts and tables read existing `cta_engagement_tracking` rows. No schema changes for #1–#7.
- Annotations (#8) need a tiny table:
  - `blog_analytics_annotations(id, occurred_on date, label text, created_by uuid, created_at timestamptz)`
  - Admin-only RLS (`has_role(auth.uid(), 'admin')`).

## Files to touch

- `src/pages/admin/BlogAnalyticsLeaderboardPage.tsx` — add range toggle, compose the new cards above the existing leaderboard, thread the range into `useLeaderboard`.
- `src/components/admin/blog-analytics/KpiStrip.tsx` *(new)*
- `src/components/admin/blog-analytics/CampaignBreakdownCard.tsx` *(new)*
- `src/components/admin/blog-analytics/DailyTrendChart.tsx` *(new)* — uses `recharts` (already in deps).
- `src/components/admin/blog-analytics/SourceMediumCard.tsx` *(new)*
- `src/components/admin/blog-analytics/LocationLandingsCard.tsx` *(new)*
- `src/components/admin/blog-analytics/AnnotationsCard.tsx` *(new)*
- `src/hooks/admin/useBlogAnalyticsRange.ts` *(new)* — one fetch of `cta_engagement_tracking` for the chosen window, shared by all cards (avoid 5 separate queries).
- Migration: create `blog_analytics_annotations` + admin RLS.

No changes to App.tsx, routing, or any registration/dashboard files. The route `/admin/blog/analytics` keeps the same component entry point.

## What it gives you operationally

- Morning pulse: open the page, glance at KPI strip on 7d. Done in 30 seconds.
- Campaign check: scroll to Campaign card, find `scully_outreach`, click the `utm_content` row that's winning.
- Weekly depth: switch toggle to 28d, scan all cards, drop an annotation for what you launched.
- 90-day storytelling: switch to 90d, annotations sit on the trend chart, the growth narrative tells itself.

## Not in scope (mention only)

- Pulling GA4 directly via the Data API. Possible later if you connect a service account, but everything above runs on data you already own in Supabase and doesn't depend on GA4 sampling or 24–48h delays.
- Per-ambassador rollup (Scully vs next person). Falls out naturally from the Campaign card grouping by `utm_campaign` once you tag each ambassador with `{name}_outreach`.

Approve and I'll build it.
