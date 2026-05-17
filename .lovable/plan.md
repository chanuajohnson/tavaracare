## Goal

Apply the financial-privacy posture you just confirmed across every public surface. The principle:

> Tavara publishes **product prices** (per-hour tiers, subscription tiers). Tavara does **not** publish **household-level money** (monthly wage totals, full Day 0 invoice figures, full 13-week projections, individual family budgets). Those live behind onboarding so a Care Administrator can tailor the offering and so caregivers never see what a given household "can pay."

Why this matters (your own framing, captured for the record):
- Public household budgets create wage-inflation pressure once caregivers see them.
- Big monthly totals scare off families who would actually fit a smaller, tailored offering.
- Public figures kill the chance to onboard and shape the engagement to the household.
- Care Administrators lose negotiating room when the "ceiling" is already on a blog.

---

## Audit results (what's currently public)

| Surface | Status | Action |
|---|---|---|
| `/admin/lifecycle-cost` | Admin-only | Keep as-is. |
| `/admin/pricing-catalog` | Admin-only | Keep as-is. |
| `/subscription`, `/subscription/features` | Public, pulled from `pricing_catalog` | Keep. Subscription tiers are product prices, not household budgets. |
| Blog: `senior-care-costs-trinidad-tobago-2026` | Public | **Strip household-level monthly totals.** Tiers and subscription numbers stay. |
| Blog: `how-to-find-trusted-caregiver-trinidad-tobago` | Public | Clean. Only mentions per-hour tiers. Leave alone. |
| Other 6 published posts | Public, no pricing | Clean. |

The one real leak is in the cost-guide post I just edited: the scenario block still publishes specific monthly household totals ($6,880/mo, $9,675/mo, $30,000+/mo). That contradicts the privacy posture. It needs another pass.

---

## Edits

### Single edit to `senior-care-costs-trinidad-tobago-2026`: rewrite the scenarios section

Replace the three scenario blocks so they describe **shape and intensity** instead of publishing dollar totals. Tiers and subscription tiers stay (those are already on `/subscription`). Wage math stays off the page.

New copy for the scenarios section:

> ## Three illustrative scenarios
>
> These mirror the three scenarios our Care Administrators walk through during onboarding. They describe the *shape* of care at three common intensities. The actual monthly numbers depend on your specific hours, tier, and household, which is why we work them out with you privately rather than publish them here.
>
> ### Conservative
> Standard companion care. $40/hour tier. Roughly 40 hours a week (a standard weekday daytime shift). Active Care coordination subscription. This is a good fit for relatively independent seniors who mainly need company, light help, and a watchful eye, with a small coordination layer keeping the family informed.
>
> ### Typical
> Conservative scope plus medication management and structured daily monitoring. Same $40/hour tier and similar hours. Active Care subscription. This is where most ongoing households land once a parent's needs are real but steady, hands-on enough to need a trained caregiver, structured enough to run on a predictable rhythm.
>
> ### Premium
> Specialist-tier care. $45/hour tier. Longer days (10 hours), still typically 5 days a week. Premium Care coordination plus medication oversight. Used for clinical complexity, dementia with behavioural needs, or post-surgical recovery, where the household needs a higher trained caregiver and tighter operational support.
>
> **Around-the-clock rotation** with two caregivers is a separate conversation, genuinely a household operation, and we always work the numbers out individually after a Care Administrator has seen the household.
>
> > **Why we don't print monthly totals here.** Two reasons. First, the right number depends on your specific hours, tier, and household, and a tailored plan is usually meaningfully different from a sticker price. Second, publishing household budgets publicly puts upward pressure on caregiver wages and frames Tavara families in a way that doesn't serve them. The full projection lives behind onboarding. [Start a family profile](/family) and a Care Administrator will share your specific 13-week scenario privately.

### Tighten one related line in the same post

The closing of "The cost nobody puts on the spreadsheet" section and the "How to think about budget" list both currently reference monthly figures indirectly. Keep them, but make sure the "15% buffer" advice points at the per-hour tier and subscription as the base, not at a household total. Light touch, one paragraph.

### No other blog edits

The companion post `how-to-find-trusted-caregiver-trinidad-tobago` only references the per-hour tiers, which match the public posture. Leave it.

---

## Memory update (so future content respects this)

Add a new core memory and index entry so every future blog post, landing page, and registration-funnel copy respects the same rule. Proposed addition to `mem://index.md` Core:

> Public pricing surfaces show **product prices only** (per-hour tiers, subscription tiers). Household-level money (monthly wage totals, Day 0 invoice figures, full lifecycle projections, individual budgets) is **never** published. Those are shared privately during onboarding. See `mem://constraints/financial-privacy-public-surfaces`.

And a new memory file `mem://constraints/financial-privacy-public-surfaces` capturing the three reasons (wage-inflation pressure, prospect scare-off, lost tailoring room) and the allow-list / deny-list.

---

## Implementation note (for the build phase)

- One `UPDATE public.blog_posts SET body = ..., updated_at = now() WHERE slug = 'senior-care-costs-trinidad-tobago-2026';` via the migration tool.
- One `code--write mem://constraints/financial-privacy-public-surfaces` plus an index update.
- Lint pass (no em/en-dashes, no banned vocabulary).
- No route, component, or schema changes.

## Out of scope

- Changing `/subscription` pricing display.
- Making `/admin/lifecycle-cost` public.
- Re-pricing anything in `pricing_catalog`.
- Editing the other 7 blog posts.
