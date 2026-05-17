## Goal

Tighten the public-facing post `senior-care-costs-trinidad-tobago-2026` so neither household totals nor subscription dollar amounts are exposed, and align the public language ("care rate" instead of "wage" where it refers to what the family sees on a tier). Update the financial-privacy constraint so this rule applies to every public surface, not just this post.

## Current state (verified against DB)

Good news: the household monthly totals you remembered ($6,880, $14,109, $30,000+) are already stripped from the live post. The current scenarios describe shape only and a callout already explains why totals are private.

What is still leaking publicly:

1. **Subscription dollar amounts** appear three times:
   - The pricing table (Basic Free / Active Care $699 wk / $2,499 mo / Premium $899 wk / $3,299 mo).
   - Inline in the "Active Care ($699/wk or $2,499/mo)" paragraph.
   - Inline in the "Premium ($899/wk or $3,299/mo)" paragraph.
2. **Home Preparation tier prices** ($199 / $499) inside the Premium subscription paragraph.
3. **"Caregiver's wage" framing** in the LEARNED callout and the budgeting tips, which on a public page still reads as a wage figure attached to the per-hour tier.

## Changes

### 1. Blog post edit (single UPDATE migration on `blog_posts`)

- **Subscription table:** keep the three rows (Basic, Active Care, Premium) and the Weekly/Monthly columns, but replace dollar cells with "Free", "Quoted at onboarding", "Quoted at onboarding". Add one line under the table: "Subscription pricing for Active Care and Premium is shared privately during onboarding so we can match the tier to the actual coordination intensity your household needs."
- **Active Care paragraph (line 120):** remove "($699/wk or $2,499/mo)". Keep the 30+ hours/week framing.
- **Premium paragraph (line 122):** remove "($899/wk or $3,299/mo)" and remove the parenthetical Home Preparation prices. Replace with "Home Preparation tier pricing is quoted at onboarding based on scope."
- **LEARNED callout (line 128) and budgeting tips (line 175):** soften "caregiver's wage" on the public page to "the caregiver's pay" or "the per-hour care rate". Keep the pass-through explanation intact in the subscription explainer paragraph (line 108, 114) where the wage/coordination split is the actual point being made; that paragraph needs the word "wage" to explain pass-through honestly. Sweep is targeted, not blanket.
- **Per-hour tiers ($40 / $45 / $50+) stay public.** They are product prices, not household figures, and removing them would break the article's purpose.

### 2. Memory update

Update `mem://constraints/financial-privacy-public-surfaces`:

- Move subscription dollar amounts from the allow-list to the deny-list.
- Allow-list now: per-hour care tier rates, tier names (Basic, Active Care, Premium), the fact of a Day 0 setup fee, the fact of a Home Preparation tier.
- Deny-list now: household monthly totals, full Day 0 figures, lifecycle projections, **subscription weekly/monthly dollar amounts**, **Home Preparation dollar amounts**, any arithmetic that lets a reader reverse-engineer a household budget.
- Add wording note: on public pages use "care rate" / "the rate the household pays" for the per-hour figure; "wage" is reserved for private onboarding documents and the one pass-through explainer paragraph where the split is the explicit subject.

Update `mem://index.md` Core line to reflect the new deny-list (subscription dollar amounts not public).

### 3. Out of scope

- No changes to `/subscription` or `/subscription/features` routes in this pass. If the user wants the subscription page itself to stop showing dollar amounts, that is a separate, larger change touching the pricing page UI and onboarding lead-capture, and we should scope it deliberately.
- No changes to `/admin/pricing-catalog` or `/admin/lifecycle-cost` (admin-only, keep figures).
- No edits to other blog posts (audited last pass, clean).
- No schema changes.

## Technical notes

- One `supabase--migration` with an `UPDATE public.blog_posts SET body = $cost3$...$cost3$ WHERE slug = 'senior-care-costs-trinidad-tobago-2026'`.
- One `code--write` to `mem://constraints/financial-privacy-public-surfaces`.
- One `code--write` to `mem://index.md` (full file, preserving every other line).

## Open question for you before I run it

The `/subscription` page currently shows the same dollar amounts publicly. Do you want this pass to:
- **(A)** Only fix the blog post + memory (subscription page keeps current pricing visible), or
- **(B)** Also strip dollar amounts from the public subscription page and replace with "Quoted at onboarding" CTAs?

I'd recommend (A) for this pass — the blog is the active leak, and changing the subscription page deserves its own scoped plan because it affects conversion flow.
