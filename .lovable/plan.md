# Scully outreach — three tracked links (corrected)

Destinations confirmed:
1. Blog: `/blog/know-someone-who-needs-care-trinidad-tobago`
2. Blog: `/blog/senior-care-costs-trinidad-tobago-2026`
3. Location page: `/locations/diamond-vale` (file: `src/pages/locations/DiamondValePage.tsx`)

All links use the existing `generateUTMLink` convention in `src/utils/utmTracking.ts`, so they will show up in `/admin/campaign-links` under the "Signups by Source" table once anyone registers from them.

## UTM convention used

- `utm_source` = channel (`whatsapp`, `facebook`, `tiktok`)
- `utm_medium` = `dm` for one-to-one, `social` for feed/story/bio
- `utm_campaign` = `scully_outreach` (one campaign, so all three links roll up together in the dashboard)
- `utm_content` = what was sent: `know-someone-needs-care`, `senior-care-costs-2026`, `diamond-vale-location`

## WhatsApp links for Scully (utm_source=whatsapp, utm_medium=dm)

**Blog 1 — Know Someone Who Needs Care:**
`https://tavara.care/blog/know-someone-who-needs-care-trinidad-tobago?utm_source=whatsapp&utm_medium=dm&utm_campaign=scully_outreach&utm_content=know-someone-needs-care`

**Blog 2 — Senior Care Costs 2026:**
`https://tavara.care/blog/senior-care-costs-trinidad-tobago-2026?utm_source=whatsapp&utm_medium=dm&utm_campaign=scully_outreach&utm_content=senior-care-costs-2026`

**Diamond Vale location page:**
`https://tavara.care/locations/diamond-vale?utm_source=whatsapp&utm_medium=dm&utm_campaign=scully_outreach&utm_content=diamond-vale-location`

## WhatsApp message to Scully (paste-ready, now includes Diamond Vale)

> Scully, thanks for sharing what you did. That was real, and not easy to sit with. I've helped pick up an adult before, more than once, including my own mommy. It's something else. The part about being unfamiliar with the elders at the home, or not having anyone to call, that's exactly the gap a lot of families in T&T fall into. Some of what we're building at Tavara sits right in that gap.
>
> Three links for you to share with your community. Each one is tagged so I can see on my side how many people came through from you.
>
> Your area page — Diamond Vale. This is the one to send to neighbours and anyone Diego Martin side:
> https://tavara.care/locations/diamond-vale?utm_source=whatsapp&utm_medium=dm&utm_campaign=scully_outreach&utm_content=diamond-vale-location
>
> For anyone who knows somebody who needs care and isn't sure where to start:
> https://tavara.care/blog/know-someone-who-needs-care-trinidad-tobago?utm_source=whatsapp&utm_medium=dm&utm_campaign=scully_outreach&utm_content=know-someone-needs-care
>
> What care actually costs in T&T in 2026, broken down plainly so families can plan:
> https://tavara.care/blog/senior-care-costs-trinidad-tobago-2026?utm_source=whatsapp&utm_medium=dm&utm_campaign=scully_outreach&utm_content=senior-care-costs-2026
>
> Quick thing on how Tavara works, because your community sits on both sides. It's a two-sided care coordination platform. One side is families arranging care for a loved one, usually a younger relative coordinating for a parent or grandparent. The other side is caregivers and care professionals who sign up, upload their Certificate of Character and practice certificates, and get vetted and screened by us. Families register, do a care assessment, and share their legacy story. Then we match the two sides — more like a careful introduction than a job board.
>
> If you share these in your community, both sides start finding each other. That's when it actually works.
>
> Anything you want me to add or change before you forward, tell me.

## Facebook (your personal feed) — utm_source=facebook, utm_medium=social

Same three URLs, different tags:

- `https://tavara.care/locations/diamond-vale?utm_source=facebook&utm_medium=social&utm_campaign=scully_outreach&utm_content=diamond-vale-location`
- `https://tavara.care/blog/know-someone-who-needs-care-trinidad-tobago?utm_source=facebook&utm_medium=social&utm_campaign=scully_outreach&utm_content=know-someone-needs-care`
- `https://tavara.care/blog/senior-care-costs-trinidad-tobago-2026?utm_source=facebook&utm_medium=social&utm_campaign=scully_outreach&utm_content=senior-care-costs-2026`

Suggested caption:

> If you know a family in T&T trying to figure out care for a loved one, these are for you. A page for Diamond Vale, a piece on where to start, and what care actually costs in 2026. Share with anyone who needs it.

## TikTok bio links — utm_source=tiktok, utm_medium=social

TikTok strips query params on most clickable surfaces, so rotate one tracked link in your bio per video:

- Diamond Vale screen-roll bio link:
  `https://tavara.care/locations/diamond-vale?utm_source=tiktok&utm_medium=social&utm_campaign=scully_outreach&utm_content=diamond-vale-location`
- Blog screen-roll bio link (pick one per video):
  `https://tavara.care/blog/senior-care-costs-trinidad-tobago-2026?utm_source=tiktok&utm_medium=social&utm_campaign=scully_outreach&utm_content=senior-care-costs-2026`

Captions:
- Diamond Vale: "If you family side Diego Martin and looking to arrange care for a loved one, this page is for you. Link in bio. #DiamondVale #DiegoMartin #TrinidadAndTobago"
- Costs: "What care actually costs in T&T in 2026. No vague numbers. Link in bio. #SeniorCareTT #Trinidad #Tobago"

## Reusable workflow for other locations this week

You're already on `/admin/campaign-links`. The generator there builds links with the same UTM structure. For each new location or person:

- `utm_source` = channel: `whatsapp`, `facebook`, `tiktok`, `instagram`, `email`
- `utm_medium` = `dm` (one-to-one), `social` (feed/story/bio)
- `utm_campaign` = person or location slug: `scully_outreach`, `diamond_vale_oct26`, `diego_martin_oct26`, `chaguanas_oct26`
- `utm_content` = destination slug: blog slug, location slug, or asset name

Pick the destination URL, fill the four fields, generate, copy, send. The Campaign Links table then shows signups attributed back to each person and each location separately.

## What happens on approval

1. I confirm the three WhatsApp links and the message above are final.
2. No code changes required — the generator and analytics page already exist.
3. Optional follow-up if you want it: add three preset buttons in `UTMLinkGenerator.tsx` for "Scully WhatsApp", "Facebook personal", "TikTok bio" so the next sends are one click. Say the word and I'll scope that as a small build task.
