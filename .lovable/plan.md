## Goal

Tighten the cost-guide blog post so it:
1. Doesn't over-divulge the Day 0 fee structure publicly.
2. Explains *why* Day 0 fees exist (the human concierge / matchmaker layer).
3. Aligns the scenario section with the three canonical scenarios used in `/admin/lifecycle-cost` (Conservative, Typical, Premium, first 13 weeks).
4. Ends with a clear CTA to sign up / start onboarding, which is where the full lifecycle cost detail actually lives.

No new routes, no new pages, no code changes. Pure blog content edit via `UPDATE blog_posts ... WHERE slug = 'senior-care-costs-trinidad-tobago-2026'`.

---

## Recommendation on the "public lifecycle-cost page" question

You asked whether the blog would be better supported by a public `/admin/lifecycle-cost`. My recommendation: **keep `/admin/lifecycle-cost` admin-only.** Two reasons:

- It's a detailed internal pricing calculator with live scenario builders. Posting the full $1,399 + $499 Day 0 bundle and 13-week timelines on a public page commoditises the offer and invites apples-to-apples comparison against agencies that quote one flat number.
- Common practice for coordinated-care providers in T&T and the wider region is to publish *ranges and philosophy* publicly, and *the full cost projection* only after a family signs up and a Care Administrator can walk them through it.

So the blog will:
- Remove the explicit "$1,399 one-time" line from the public copy.
- Keep the hourly tiers ($40 / $45 / $50+) and subscription tiers (Basic / Active / Premium) — those are already public.
- Reference "Day 0 setup fees" qualitatively with the dating-app/matchmaker analogy.
- Push readers who want the actual numbers to **start a profile and onboard**, where the Care Administrator shares the full lifecycle projection.

If you'd rather expose `/admin/lifecycle-cost` publicly instead, say the word and I'll plan that separately (route move, auth guards off, branding pass, SEO). It's a different conversation.

---

## Edits to `senior-care-costs-trinidad-tobago-2026`

### 1. "The short answer" table — remove the $1,399 line

Replace the one-time Matching & Placement row. New table:

| Care type | Typical rate (TTD) |
|---|---|
| GAPP (Geriatric Adolescent Partnership Programme) | Free to the family, government subsidised |
| Companion / standard care | **$40 / hour** |
| Full service personal care | **$45 / hour** |
| Premium / specialised care | **$50+ / hour** |
| Live-in care | Quoted weekly, varies by complexity |
| Day 0 setup (Care Administrator concierge layer) | Quoted at onboarding |

### 2. New section: "Why Day 0 setup fees? The human concierge layer"

Replaces the existing "The one-time fees" section. New copy:

> ## Why Day 0 setup fees? The human concierge layer
>
> Auto-matching is free and automatic. Similar to how a dating app surfaces compatible profiles, Tavara's system pulls a shortlist of caregivers whose availability, tier, and scope line up with your household.
>
> Day 0 is what comes next, and it's done by a human Care Administrator who:
>
> - Refines and ranks the auto-matches against your specific household needs.
> - Conducts pre-placement interviews with shortlisted caregivers.
> - Mediates the back-and-forth until both family and caregiver are confident.
> - Handles the formal introduction, onboarding, and care team build-out.
>
> Think of free auto-matching as the dating-app match list. Day 0 is the personal matchmaker who interviews everyone and confirms the fit before anyone moves in.
>
> We quote Day 0 setup at onboarding rather than printing a sticker price here, because the right setup depends on the household: whether it's a single primary care recipient or a couple, whether there's a secondary care need, whether the care plan is starting at Standard or Premium tier. [Start a family profile](/family) and a Care Administrator will walk you through it.

### 3. Subscription section — keep, but add a sign-up nudge at the end

Keep the existing Basic / Active Care / Premium subscription block. Add a closing paragraph:

> The subscription numbers above are the public ones. The full picture, what Day 0 looks like for *your* household, how the 13-week ramp from setup to steady-state actually trends, and what your specific scenario projects month by month, is something we walk through during onboarding rather than publish in a blog. If you want that detail, [create a family profile](/family) and a Care Administrator will share it.

### 4. Rewrite the scenarios section to mirror `/admin/lifecycle-cost`

Replace the current three scenarios (20 hrs / 60 hrs / round-the-clock) with the three canonical scenarios that the internal `/admin/lifecycle-cost` page uses, so the blog and the internal projection tool tell the same story:

> ## Three illustrative scenarios
>
> These mirror the three scenarios our Care Administrators use during onboarding. They are illustrative, not quotes. Real numbers depend on your specifics, and the first 13 weeks of care typically include a small ramp from setup to steady state.
>
> **Conservative**
> Standard companion care. $40/hr, 8 hours a day, 5 days a week (40 hrs/wk). Active Care coordination subscription.
> Wages: 40 × $40 × 4.3 ≈ **$6,880/month**, paid family-to-caregiver. Plus Active Care **$2,499/month** for the coordination layer.
>
> **Typical**
> Conservative scope plus medication management and daily SOP monitoring. Same hours and rate. Active Care subscription. Where most ongoing households land once a parent's needs are steady but real.
> Same wage base (≈ $6,880/month), plus Active Care $2,499/month, plus small variable items (overtime, holiday hours at 1.5x).
>
> **Premium**
> Specialist-tier care. $45/hr, 10 hours a day, 5 days a week (50 hrs/wk). Premium Care coordination plus medication oversight. Used for clinical complexity, dementia with behavioural needs, or post-surgical recovery.
> Wages: 50 × $45 × 4.3 ≈ **$9,675/month**, plus Premium subscription **$3,299/month**.
>
> Around-the-clock rotation with two caregivers is a separate conversation. Wages alone run $30,000+/month and we always quote those individually after a Care Administrator has seen the household.
>
> > If you want the live, 13-week scenario projection for your specific household, that lives behind onboarding. [Start a family profile](/family) and we'll walk you through it.

### 5. Tidy the FAQ to match

Update the FAQ row that currently reads "Are there any one-time fees?" to match the new public posture:

> **Are there any one-time fees?**
> Yes. Tavara has a Day 0 setup bundle covering the Care Administrator's concierge work: pre-placement interviews, ranking, mediation, formal introduction, and care team build-out. The exact figure depends on the household and is quoted during onboarding. Auto-matching itself is free.

---

## Implementation note (for the build phase, not the user)

- Single `UPDATE public.blog_posts SET body = ..., faqs = ..., updated_at = now() WHERE slug = 'senior-care-costs-trinidad-tobago-2026';` via the migration tool.
- Run the result through `lintBody` (no em/en-dashes, no banned AI vocabulary, no "It's not just X, it's Y").
- No edits to `/admin/lifecycle-cost` itself, no route changes, no component changes.

## Out of scope

- Making `/admin/lifecycle-cost` public. Flagged above as a separate decision.
- Changing the actual Day 0 pricing in `pricing_catalog`.
- Changes to the Family Readiness Quiz post just shipped.
