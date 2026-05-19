## Why you're not seeing the updates

The previous edits landed in `src/content/blog/posts.ts` (static seed file), but the live blog post at `/blog/cost-of-care-trinidad-tobago-2026` and the admin editor at `/admin/blog/062d8677...` both read from the **`blog_posts` Supabase table**. Confirmed via DB query — the published row still says `Live-in care | Quoted weekly, varies by complexity`, no $2,400 floor, no inline floor sentence.

The FAQ page is hardcoded in `src/data/faqs.ts` and currently **violates the financial-privacy guardrail**: it publicly prints subscription dollars ($699/wk, $2,499/mo, $899/wk, $3,299/mo, $19.99/mo, $34.99/mo), the $1,399 Matching & Placement figure, the $499 Care Assessment & Setup figure, and a legacy "$499/week instead of $699/week" example. Per `mem://constraints/financial-privacy-public-surfaces`, none of these belong on a public surface — only tier names + per-hour care rates ($40/$45/$50+) + a single Live-in "starts from $X/wk" floor are allowed.

## 1. Update the DB blog post (id `062d8677-0799-435d-af04-10c546137326`)

Create a Supabase migration that updates the `body` column for slug `senior-care-costs-trinidad-tobago-2026`:

- Replace the Live-in table row from `| Live-in care | Quoted weekly, varies by complexity |` → `| Live-in care | **Starts from $2,400 / week**, quoted by complexity |`
- Inside the "## Live-in care: how it's actually priced" section, insert one sentence after the opening paragraph: `As a floor, plan for **$2,400 / week** for a basic single-caregiver live-in arrangement; rotation, sleep cover, and complexity move it up from there.`
- Also patch the in-post FAQ answer (the "In-home caregiver rates" Q in the post body, if present) to end with `Live-in care starts from $2,400 / week and is quoted by complexity.`

Use targeted `REPLACE(body, '<old>', '<new>')` calls in a single migration so the change is idempotent and re-runnable. Bump `updated_at = now()`.

## 2. Scrub `src/data/faqs.ts` to match the guardrail

Edit four FAQ answers in place (keep ids, questions, categories):

- **faq-11** (subscription plans & pricing): drop all $ amounts. Replace dollar figures with tier names only and a closing line: `Exact subscription pricing is shared privately during onboarding so we can match the right tier to your household.` Keep the feature bullets per tier.
- **faq-21** (how does care plan pricing work): drop $699/wk, $2,499/mo, $899/wk, $3,299/mo, $1,399, $499. Describe Active Care vs Premium Care by what's included, add `Caregiver Matching & Placement and Care Assessment & Setup are one-time services quoted at onboarding.` Reference the per-hour care rates ($40/$45/$50+) and the Live-in floor (`Live-in care starts from $2,400 / week`).
- **faq-22** (legacy/early-adopter discounts): remove the "$499/week instead of $699/week" example. Replace with generic language: legacy rates are preserved, one-time fees may have been waived, all shown in your private billing summary.
- **faq-10** (what features require paid subscription): no $ to remove, but reword the closing to point to onboarding for tier selection rather than implying a public price list.

Leave faq-20 (caregiver hourly rates) untouched — $40 / $45 / $50+ are on the allow-list.

## 3. Verification

- After migration: `select substring(body from position('Live-in care' in body) for 200) from blog_posts where slug = 'senior-care-costs-trinidad-tobago-2026'` returns the new floor row.
- Reload `/blog/cost-of-care-trinidad-tobago-2026` in preview — table shows the floor, prose has the floor sentence, in-post FAQ updated.
- `rg "699|2,?499|899|3,?299|1,?399|499/week|499\b|19\.99|34\.99" src/data/faqs.ts` returns zero matches.
- Reload `/support/faq` — Subscription & Pricing, Care Management, and legacy FAQ entries no longer print private $ amounts.

## Out of scope

- No edits to `pricing_catalog`, `/admin/pricing-catalog`, `/admin/lifecycle-cost`, subscription billing flows, or onboarding copy.
- No change to faq-20 (caregiver hourly rates) — already compliant.
- No change to `src/content/blog/posts.ts` (already updated last loop; it stays as the seed reference).
