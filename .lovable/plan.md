## Goal

Stop overstating caregiver supply on the five location pages. Be candid that we're in active outreach, invite readers to share the app link with potential caregivers they know, and point the cost FAQ to the detailed blog post.

## Files

### 1. `src/pages/locations/locationsData.ts`

Rewrite the FAQ answers (and one question) on all five locations: Port of Spain, San Fernando, Arima, Tobago, Diamond Vale. Keep the existing 4-FAQ structure per page. Three patterns:

**"Do you have caregivers in [area]?" — candid outreach answer**
Replace the "Yes. Many of our caregivers live in…" claims with honest copy. Example pattern (tailored per location, neighbourhoods kept):

> We're actively building our caregiver community across [area neighbourhoods]. If you're a nurse, caregiver, or know someone reliable in the area, we'd love for you to share Tavara with them — every introduction helps us match families faster. Caregivers can join at tavara.care.

**"How quickly can care start?" — candid about pool depth**
Replace the "few days / 24-48 hours" promises with honest framing:

> It depends on how deep our caregiver pool is in your area right now. We're on an active outreach drive in [area], so timing varies. Urgent situations go into our priority queue and we work the network hard. The fastest way to help us help you: share the app with any caregivers you know.

**"What does it cost?" — link to blog post**
Keep the rate summary, add a line pointing to `/blog/senior-care-costs-trinidad-tobago-2026` for the full breakdown. Add an optional `linkHref` + `linkLabel` field to `LandingFAQ` so the answer can render a real link.

The fourth FAQ on each page (re-match, live-in, diaspora, agency difference) stays as-is — those are accurate.

### 2. `src/components/landing/LandingPageScaffold.tsx`

- Extend `LandingFAQ` interface with optional `linkHref?: string` and `linkLabel?: string`.
- In the `AccordionContent` render, append a `<Link to={linkHref}>{linkLabel}</Link>` underneath the answer text when those fields are present.
- FAQPage JSON-LD schema unchanged — answer text stays as the `acceptedAnswer.text` (link is a UI affordance, not part of the structured answer).

## Out of scope

- CTAs, hero copy, sections — only FAQ block changes
- Other pages, sitemap, routes
- Tone guardrails respected: no "hire", use "arrange care / caregiver / family", no em-dashes, no AI buzzwords

## Verification

Load `/care/port-of-spain` and `/care/diamond-vale`, expand all four FAQs, confirm honest outreach copy and that the cost FAQ shows a working link to the blog post.
