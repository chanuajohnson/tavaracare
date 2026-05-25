# Facebook + TikTok rollout — paste-ready

Campaign: `tavara_oct26_launch` (separate from `scully_outreach` so attribution stays clean).

## The three tracked links

**Facebook (utm_source=facebook, utm_medium=social):**
- https://tavara.care/locations/diamond-vale?utm_source=facebook&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=diamond-vale-location
- https://tavara.care/blog/know-someone-who-needs-care-trinidad-tobago?utm_source=facebook&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=know-someone-needs-care
- https://tavara.care/blog/senior-care-costs-trinidad-tobago-2026?utm_source=facebook&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=senior-care-costs-2026

**TikTok (utm_source=tiktok, utm_medium=social):**
- https://tavara.care/locations/diamond-vale?utm_source=tiktok&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=diamond-vale-location
- https://tavara.care/blog/senior-care-costs-trinidad-tobago-2026?utm_source=tiktok&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=senior-care-costs-2026
- https://tavara.care/blog/know-someone-who-needs-care-trinidad-tobago?utm_source=tiktok&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=know-someone-needs-care

## Facebook posts

**Post 1 — Anchor (pin this):**
> Building Tavara has meant sitting with families in T&T who are trying to arrange care for a parent, a grandparent, someone at home who needs support, and don't know where to start.
>
> If that's you, or someone you know, three reads:
>
> Diego Martin side, here's our area page: https://tavara.care/locations/diamond-vale?utm_source=facebook&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=diamond-vale-location
>
> Where to start when someone close to you needs care: https://tavara.care/blog/know-someone-who-needs-care-trinidad-tobago?utm_source=facebook&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=know-someone-needs-care
>
> What care actually costs in T&T in 2026: https://tavara.care/blog/senior-care-costs-trinidad-tobago-2026?utm_source=facebook&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=senior-care-costs-2026

**Post 2 — Costs blog (run 2 days after):**
> Most families I talk to in T&T have no idea what care actually costs until they're in the middle of it. So we wrote it down.
>
> https://tavara.care/blog/senior-care-costs-trinidad-tobago-2026?utm_source=facebook&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=senior-care-costs-2026

**Post 3 — Diamond Vale (community groups):**
> If you family side Diamond Vale or anywhere Diego Martin, this page is for us.
>
> https://tavara.care/locations/diamond-vale?utm_source=facebook&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=diamond-vale-location

## TikTok — one bio link per video, rotate every 48h

**Video 1 — Diamond Vale**
Bio link: https://tavara.care/locations/diamond-vale?utm_source=tiktok&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=diamond-vale-location
Caption: If you family side Diego Martin and trying to arrange care for a loved one at home, this page is for us. Link in bio 🏡 #DiamondVale #DiegoMartin #TrinidadAndTobago #CareInTT

**Video 2 — Costs blog**
Bio link: https://tavara.care/blog/senior-care-costs-trinidad-tobago-2026?utm_source=tiktok&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=senior-care-costs-2026
Caption: What care actually costs in T&T in 2026. No vague numbers. Link in bio. #SeniorCareTT #Trinidad #Tobago #CareInTT

**Video 3 — Know Someone**
Bio link: https://tavara.care/blog/know-someone-who-needs-care-trinidad-tobago?utm_source=tiktok&utm_medium=social&utm_campaign=tavara_oct26_launch&utm_content=know-someone-needs-care
Caption: Somebody you love needs care and you don't know where to start. Read this. Link in bio 💙 #CaregiverTT #Trinidad #Tobago #FamilyCare

## Tracking — what was added

- Location pages now fire `location_utm_landed` into `cta_engagement_tracking` on first UTM landing per session (mirrors what blog posts already do via `blog_utm_landed`).
- `/admin/campaign-links` now shows a **Visits by Campaign** card above the Signups table. Rows: campaign / source / destination (utm_content) / visits / last visit. Picks up Scully's `scully_outreach` and your `tavara_oct26_launch` automatically.
