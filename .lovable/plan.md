# Add Marketing Analytics card to Admin Dashboard

## Goal
Surface a single entry point on `/dashboard/admin` that takes admins to the marketing funnel center (blog → quiz → registration analytics) at `/admin/blog/analytics`.

## Change
In `src/pages/admin/AdminDashboard.tsx`, add one new action button to the existing admin actions grid (same `h-20` outlined card pattern as the surrounding buttons like "Blog Management", "Unit Economics").

- Label: **Marketing Analytics**
- Icon: `BarChart3` (lucide-react)
- Helper subtitle is not used in the existing pattern, but the label is concise enough; the button navigates on click
- onClick: `navigate('/admin/blog/analytics')`
- Placed next to "Blog Management" so the marketing-related actions sit together

## Scope
- One file: `src/pages/admin/AdminDashboard.tsx`
- Adds one button + one icon import
- No new routes, no changes to the leaderboard page itself, no changes to tracking

## Why this route
`/admin/blog/analytics` already renders `BlogAnalyticsLeaderboardPage`, which now shows per-post: Landings → CTA clicks → Quiz starts → Quiz done → Registrations → Convert %. That is the funnel/conversion center the user wants surfaced.

## Future (not in this change)
If we later add non-blog campaign sources (paid ads, email), we can rename the destination page or add tabs to it — but for now the leaderboard is the single marketing funnel view.
