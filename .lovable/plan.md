# Track Scully's sends + prep your Facebook & TikTok push

Two parts: (1) make tracking visible so you can watch Scully's links come in, (2) hand you paste-ready Facebook and TikTok assets tagged separately so you can tell each channel apart in the dashboard.

## Part 1 — Tracking Scully's WhatsApp sends

Already live on `/admin/campaign-links`:
- "Signups by Source" table aggregates by `utm_source` / `utm_medium` / `utm_campaign`.
- Scully's three links all carry `utm_campaign=scully_outreach`, so anything that converts rolls up under one row per channel.

What I'll add so you can actually see Scully's funnel (not just signups):

1. **Link-click counter for Scully's three URLs.** Add a small "Recent Visits by Campaign" card on `/admin/campaign-links` that reads `cta_engagement_tracking` for any row whose `additional_data->>utm_campaign = 'scully_outreach'`, grouped by `utm_content` (so you see `diamond-vale-location` vs `know-someone-needs-care` vs `senior-care-costs-2026` separately). Shows: visits, signups, last hit.
2. **Confirm UTM capture fires on first landing.** Quick check that `captureUTMParams()` from `src/utils/utmTracking.ts` is invoked on `/blog/*` and `/locations/*` routes, not only the homepage. If not, wire it into the landing page scaffolds so Scully's clicks register.
3. **Surface "Top campaigns last 7 days" tile** on the same page so Scully's run shows up next to anything else you push.

No schema changes — `cta_engagement_tracking.additional_data` already holds UTMs.

## Part 2 — Facebook assets (paste-ready)

Tagged `utm_source=facebook`, `utm_medium=social`, `utm_campaign=tavara_oct26_launch` (separate campaign from Scully's so attribution stays clean — your channel, not his).

**The three links:**
- `https://tavara.care/locations/diamond-vale?utm_source=facebook&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=diamond-vale-location`
- `https://tavara.care/blog/know-someone-who-needs-care-trinidad-tobago?utm_source=facebook&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=know-someone-needs-care`
- `https://tavara.care/blog/senior-care-costs-trinidad-tobago-2026?utm_source=facebook&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=senior-care-costs-2026`

**Post 1 — Personal voice, anchor post (pin this)**
> Building Tavara has meant sitting with families in T&T who are trying to arrange care for a parent, a grandparent, someone at home who needs support, and don't know where to start.
>
> If that's you, or someone you know, three reads:
>
> Diego Martin side, here's our area page: https://tavara.care/locations/diamond-vale?utm_source=facebook&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=diamond-vale-location
>
> Where to start when someone close to you needs care: https://tavara.care/blog/know-someone-who-needs-care-trinidad-tobago?utm_source=facebook&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=know-someone-needs-care
>
> What care actually costs in T&T in 2026: https://tavara.care/blog/senior-care-costs-trinidad-tobago-2026?utm_source=facebook&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=senior-care-costs-2026
>
> Share with anyone it could help.

**Post 2 — Single-link share, costs blog (run 2 days after Post 1)**
> Most families I talk to in T&T have no idea what care actually costs until they're in the middle of it. So we wrote it down.
>
> https://tavara.care/blog/senior-care-costs-trinidad-tobago-2026?utm_source=facebook&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=senior-care-costs-2026

**Post 3 — Diamond Vale local share (community groups)**
> If you family side Diamond Vale or anywhere Diego Martin, this page is for us.
>
> https://tavara.care/locations/diamond-vale?utm_source=facebook&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=diamond-vale-location

## Part 3 — TikTok assets (paste-ready)

TikTok strips query params on most surfaces, so the strategy is: **one tracked bio link per video**, rotated. All tagged `utm_source=tiktok`, `utm_medium=social`, `utm_campaign=tavara_oct26_launch`.

**Video 1 bio link — Diamond Vale:**
`https://tavara.care/locations/diamond-vale?utm_source=tiktok&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=diamond-vale-location`

Caption:
> If you family side Diego Martin and trying to arrange care for a loved one at home, this page is for us. Link in bio 🏡 #DiamondVale #DiegoMartin #TrinidadAndTobago #CareInTT

**Video 2 bio link — Costs blog:**
`https://tavara.care/blog/senior-care-costs-trinidad-tobago-2026?utm_source=tiktok&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=senior-care-costs-2026`

Caption:
> What care actually costs in T&T in 2026. No vague numbers. Link in bio. #SeniorCareTT #Trinidad #Tobago #CareInTT

**Video 3 bio link — Know Someone:**
`https://tavara.care/blog/know-someone-who-needs-care-trinidad-tobago?utm_source=tiktok&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=know-someone-needs-care`

Caption:
> Somebody you love needs care and you don't know where to start. Read this. Link in bio 💙 #CaregiverTT #Trinidad #Tobago #FamilyCare

Suggest 48 hours per bio link, swap on a schedule so each video's analytics map to one `utm_content`.

## Files to change (Part 1 only)

- `src/pages/admin/CampaignLinksPage.tsx` — add "Visits by Campaign" card above the existing "Signups by Source" table, filtered to `utm_campaign IN ('scully_outreach','tavara_oct26_launch')` for now, with a campaign picker for future runs.
- `src/components/admin/CampaignVisitsCard.tsx` (new) — small component that queries `cta_engagement_tracking` for `action_type='page_view'` rows whose `additional_data->>utm_source` is set, groups by `utm_campaign` + `utm_content`.
- `src/utils/utmTracking.ts` — confirm `captureUTMParams()` is called on every route change (likely already via a top-level effect; if not, hook into the router).
- `src/components/landing/LandingPageScaffold.tsx` — verify it calls `captureUTMParams()` on mount so `/locations/diamond-vale` hits are recorded.

No DB migrations. No new tables. Read-only addition to an existing admin page.

## What you do after I build it

1. Send the Facebook anchor post today. Pin it.
2. Record TikTok Video 1 (Diamond Vale), set the bio link, post.
3. Check `/admin/campaign-links` over the next 48 hours. You'll see `scully_outreach` and `tavara_oct26_launch` as separate rows, with `utm_content` breakdowns so you know which link did the work.
4. Tell me which channel is winning and we double down.

Approve and I'll build Part 1.
