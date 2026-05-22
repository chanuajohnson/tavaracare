# DB verification + Step 2a (sticky mobile) + Step 3 (dashboard) + Step 4 (fix blog-share UTM stripping)

## Verification results (last 2h, senior-care-costs post)

| Event | Source / Placement | Status |
|---|---|---|
| `blog_utm_landed` | `utm_source=facebook` | Fires (2 landings) |
| `blog_cta_click` | `placement=top-family`, inbound `facebook` | Fires |
| `blog_cta_click` | `placement=public-copy-share`, inbound `facebook` | Fires |
| `family_registration_page_view` | — | Not seen — verify `PageViewTracker` UTM forwarding in Step 3d |

Three of four fired. Plumbing is mostly correct. But the screenshot of `cpdfmyemjrefnhddyrck.supabase.co/.../blog-share` exposes a real attribution leak — see Step 4.

## Step 4 — Fix `blog-share` edge function UTM stripping (NEW, highest priority)

**What's wrong in the screenshot:**

The edge function returns HTML with OG/Twitter meta tags for crawlers, then redirects humans via:

```html
<meta http-equiv="refresh" content="0;url=https://tavara.care/blog/senior-care-costs-trinidad-tobago-2026" />
<script>window.location.replace("https://tavara.care/blog/senior-care-costs-trinidad-tobago-2026");</script>
```

Both targets are **hard-coded with no query string**. So when someone clicks a Facebook share that points at `…/blog-share/<slug>?utm_source=facebook&utm_medium=social&utm_campaign=…`, the edge function:

1. ✅ Serves the right OG card to the FB crawler
2. ❌ Throws away every UTM param when redirecting the human to `tavara.care`

That's why our verified `blog_utm_landed` rows only happen when the link points **directly** at `tavara.care/blog/...?utm_source=...` (the admin panel `SocialSharePanel` does this). The moment a link routes through `blog-share` — which is what Open Graph crawlers use and what most paste-and-share flows produce — UTMs evaporate.

**Other issues visible in that HTML:**

- The redirect uses the production domain hardcoded; fine for now, but worth confirming it matches the `PRODUCTION_BASE_URL` constant.
- `og:url` is also hardcoded without UTMs, which is actually correct (canonical should be clean) — leave it alone.

**Fix (in `supabase/functions/blog-share/index.ts`):**

1. Parse the incoming request URL's `searchParams`.
2. Build the destination URL with the canonical path **plus** the original query string forwarded as-is: `https://tavara.care/blog/${slug}${incomingSearch}`.
3. Use that forwarded URL in both the `<meta http-equiv="refresh">` and the `window.location.replace(...)` call.
4. Keep `og:url` clean (no UTMs) — that's the canonical for crawlers.

After deploy, retest: share a `blog-share` link with `?utm_source=facebook` → open in incognito → confirm a `blog_utm_landed` row with `utm_source=facebook`. This single fix probably doubles measured social attribution.

## Step 2a — `BlogStickyMobileCTA` breadcrumb state

Already wired for tracking. Only missing piece: pass `state={{ referringPagePath: '/blog/${postSlug}', referringPageLabel: 'Back to article' }}` on the family-audience `<Link>` so the registration breadcrumb shows the same "Back to article" entry as inline/end CTAs. 2-line change.

## Step 3 — Dashboard polish (`/admin/blog/:postId/analytics`)

**3a. Two new ratio columns per platform**
- **Engage %** = `ctaClicks / landings`
- **Convert %** = `registrations / landings` (already computed; just expose)

**3b. 30-day landings sparkline**
Bucket `blog_utm_landed` by day, return `daily: { date, landings }[]`. Render inline 60px sparkline above the platform table.

**3c. All-posts leaderboard at `/admin/blog/analytics`**
Group last-90d events by `post_slug`, join `blog_posts` for titles, show landings / clicks / registrations / convert %, link each row to its detail page. Add "View leaderboard" link from `/admin/blog`.

**3d. Verify `PageViewTracker` forwards `utm_referrer_*`**
Quick read of `src/components/tracking/PageViewTracker.tsx`. If it doesn't currently push `utm_referrer_source/campaign/content` into `additional_data` on registration page views, add the 3-line fix. This explains the missing `family_registration_page_view` row in verification.

## Files

- `supabase/functions/blog-share/index.ts` — forward query string in both redirect paths (4)
- `src/components/blog/BlogStickyMobileCTA.tsx` — breadcrumb `state` on family link (2a)
- `src/hooks/admin/useBlogSocialAnalytics.ts` — daily series + engage ratio (3a, 3b)
- `src/pages/admin/BlogAnalyticsPage.tsx` — sparkline + new columns (3a, 3b)
- `src/pages/admin/BlogAnalyticsLeaderboardPage.tsx` *(new)* — leaderboard (3c)
- `src/components/routing/AppRoutes.tsx` — one route entry (3c)
- `src/components/tracking/PageViewTracker.tsx` — UTM referrer forwarding, only if missing (3d)

No changes to: chat flow, registration forms, auth, layout, navigation, or any protected file.

## Test loop after deploy

1. Open `https://cpdfmyemjrefnhddyrck.supabase.co/functions/v1/blog-share/senior-care-costs-trinidad-tobago-2026?utm_source=facebook&utm_medium=social&utm_campaign=test` in incognito → confirm landing URL is `tavara.care/blog/...?utm_source=facebook&utm_medium=social&utm_campaign=test` and a `blog_utm_landed` row appears.
2. On mobile width, click sticky CTA → breadcrumb shows "Back to article".
3. `/admin/blog/:postId/analytics` shows sparkline + Engage % + Convert %.
4. `/admin/blog/analytics` shows leaderboard with today's senior-care post ranked.
