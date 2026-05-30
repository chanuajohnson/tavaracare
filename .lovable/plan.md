
# Plan: New blog post — "Caring on a Public Holiday in Trinidad & Tobago"

Add one new draft post in `blog_posts`, visible at `/admin/blog`. No changes to onboarding, pricing catalog, or any product surface. Anchored to today: **Saturday 30 May 2026, Indian Arrival Day**.

## Why this topic, today

- Today is Indian Arrival Day (national public holiday). Families with a loved one at home don't get a day off from care; caregivers don't either. This is one of the highest-search, lowest-content moments in T&T caregiving.
- T&T law (Ministry of Labour, Minimum Wages Order): **public holiday work is paid at double time (2x)** for domestic and similar workers. Most families do not know this. Most care professionals are afraid to ask.
- Globally minded angle: every culture has holidays where care continues quietly. We frame T&T specifics (Indian Arrival Day, Eid, Divali, Christmas, Carnival, Emancipation, Republic Day) inside that universal truth.

## Scope

**In scope**
- One new row in `blog_posts` (status=`draft`, no `published_at`)
- New cover image in `public/blog-covers/`
- Register slug in `src/lib/blog/clusters.ts` under `cost-and-planning`
- Add URL to `public/sitemap.xml`

**Out of scope**
- Pricing catalog, billable services, internal multipliers, Day 0 figures
- Onboarding components, dashboards, escalation logic
- Any change to caregiver / care professional registration or chat flow

## Post specs

- **Slug:** `caring-on-a-public-holiday-trinidad-tobago`
- **Title:** Caring on a Public Holiday in Trinidad and Tobago
- **Cluster:** `cost-and-planning` (holiday pay sits with planning)
- **Category:** `Family Care Guides`
- **Status:** `draft`
- **Author:** Chanua Johnson, Tavara Care Coordinator & Founder
- **Cover image:** quiet T&T living room on a holiday morning, soft natural light, a single mug on a side table, doors open to a yard, no people, 16:9
- **CTA:** "Plan holiday coverage with us" → `/family/features-overview`

## Content outline (full coverage, both sides)

1. **Today's anchor** — Indian Arrival Day, what the day means, and the quiet reality that care does not pause. Short, scene-led opening.
2. **What the law actually says** — Ministry of Labour position: domestic and care workers earn **double time (2x) on public holidays**, plus their normal day's pay if the holiday falls on a working day. Cite the Minimum Wages Order in plain language. No internal Tavara multipliers disclosed.
3. **From the family side**
   - Planning holiday coverage 2 weeks ahead, not the night before
   - Who covers if the main care professional wants the day with their own family
   - Food, transport, and the small dignities (a plate from the family meal, a ride home after dark)
   - Communicating expectations in writing before the day
4. **From the care professional side**
   - Your right to double time on a gazetted public holiday
   - How to ask for it without conflict (script included)
   - When to accept a swap instead of cash
   - The 8-hour shift still applies; no personal phone policy still applies; professionalism does not take a holiday
5. **The 11 T&T public holidays at a glance** — list with one line each on the cultural weight (Carnival days, Spiritual Shouter Baptist Liberation Day, Good Friday, Easter Monday, **Indian Arrival Day**, Corpus Christi, Labour Day, Emancipation Day, Independence Day, Republic Day, Christmas Day, Boxing Day, Eid-ul-Fitr, Divali). Note movable dates.
6. **Coverage patterns that work** — primary plus fill-in rotation, weekend 8 AM to 4 PM standard, live-in handovers around festivals. Names tier and pattern only, no dollar amounts.
7. **A globally minded note** — every country has these days. The principle (rest is a right, care is continuous, coordination is the bridge) is universal even when the holiday names change.
8. **Founder note from Chanua** — short, warm, T&T voice. One concrete memory of a holiday shift.
9. **Internal links** — `senior-care-costs-trinidad-tobago-2026`, `paying-for-care-without-going-broke-trinidad`, `live-in-vs-hourly-care-trinidad-tobago`, `inside-tavara-onboarding-step-by-step`.

## Language guardrails applied

- **care professional** throughout, never "caregiver" in the headline or section labels (body may use "caregiver" only where it already appears in product copy; default is care professional)
- "loved one" not "patient"; "care team" not "staff"; "arrange care" not "hire"; "household" not "case"
- Never call Tavara an agency or employer; we coordinate
- No em or en dashes; no banned AI words; British spellings
- Public-surface money rule: state the **statutory** double-time position (it is public law) and the per-hour care tier rates already allowed on public surfaces ($40 / $45 / $50+). Do **not** publish internal multipliers, weekly subscription dollar amounts, or live-in upper bounds.

## Open question for you before I write

The project memory `care-escalation-and-rates` records an internal **1.5x** holiday/overtime convention, while T&T statutory law for domestic and care workers is **2x (double time)** on public holidays. The blog must reflect the law. Two clean options:

- **A.** Publish the law (2x) as the public reference, and keep any internal Tavara arrangement private to onboarding conversations. Recommended.
- **B.** Publish the law (2x) and additionally state how Tavara structures holiday pay in care arrangements (more transparent, but partially crosses the financial-privacy line).

I will assume **Option A** unless you say otherwise.

## Technical steps

1. Generate cover image (premium, 16:9, quiet T&T holiday living room)
2. `INSERT` into `blog_posts` via migration with `status='draft'`, no `published_at`
3. Edit `src/lib/blog/clusters.ts` — add slug under `cost-and-planning`
4. Edit `public/sitemap.xml` — add `<url>` with `lastmod=2026-05-30`
5. Confirm draft renders at `/admin/blog`

## What you do after

Review the draft at `/admin/blog`. When the copy is approved, flip `status` to `published` and set `published_at` to today so it lands while Indian Arrival Day is still the live anchor.
