# New Blog Post: Inside Tavara Onboarding

## Goal
Publish the next blog post on what onboarding actually looks like at Tavara — the sequence from first conversation to a fully running care team — illustrated with two anonymised real households and one anonymised caregiver archetype drawn from the system.

## Source material (kept private, never named in the post)
- Family A — the Aimey household (Ana Maria + Marcos, family role records).
- Family B — the founder-owned household with care recipient "June P. Johnson" (the "Pelier" reference).
- Caregiver archetype — Denise Narcis, a senior professional caregiver in the system.

Per the user's choice, the post uses **fully anonymous archetypes**. No first names, no surnames, no neighbourhoods that could identify either household.

## Anonymised framing used in the post
- Family A → "a multi-generational household in central Trinidad coordinating care for an aging parent"
- Family B → "a Port-of-Spain family of three arranging continuous care for a parent with complex daily needs"
- Caregiver → "a senior caregiver with two decades of bedside experience"

## Article spec

- **Slug:** `inside-tavara-onboarding-step-by-step`
- **Title:** Inside Tavara Onboarding: What the First Two Weeks Really Look Like
- **Category:** Onboarding
- **Reading time:** ~9 min
- **Length target:** ~2,000 words
- **Author:** Chanua Johnson, Founder (matching existing posts)
- **Published_at:** today's date at 09:00 UTC (newest in the feed, as user wants for a brand-new post)
- **Status:** `published`
- **CTA:** "Start your onboarding conversation" → `/family-matching` (or whichever public intake the user prefers — see open question)

## Structure (step-by-step sequence)

1. **Opening** — Why families ask "can you just send someone tomorrow," and why the honest answer is no. Frame onboarding as the work that prevents the chaos people normally associate with arranging care.
2. **Step 1 — The first conversation.** What we listen for: the loved one's daily rhythm, what's already breaking, who in the family is carrying what. Case A used here as the worked example.
3. **Step 2 — Mapping the household.** Translating that conversation into a care plan: hours of coverage, weekday vs weekend, evening vs overnight, special conditions. Case B used here (more complex coverage).
4. **Step 3 — The match.** How we choose a primary caregiver and fill-in support. Introduce the caregiver archetype: experience, calm presence, the "no personal phone during shift" professionalism standard.
5. **Step 4 — Home preparation.** What changes in the physical environment before day one (safety, supplies, a workable space for the care team). No dollar figures, just what gets done and why.
6. **Step 5 — Meet and greet.** The structured first visit. Why this is not "an interview" but a calibration.
7. **Step 6 — Service commencement.** Signatures, baseline agreements, the dashboard becoming the operational hub. WhatsApp explained as the secondary handoff channel.
8. **Step 7 — The first two weeks of rotation.** Primary caregiver settling in, fill-in nurses rotating, daily logs accumulating, the family seeing care happen in writing for the first time.
9. **What onboarding prevents** — short list: missed medications, caregiver burnout, family arguments about "who told who what," and the slow drift into crisis.
10. **Closing + CTA** — Onboarding is the product. The hours are just the visible part.

## Guardrails applied throughout
- No banned words: no "hire," "patient," "staff," "case," "placement," "payroll," "agency," "client," "customer," "worker," "employee." Use "arrange care," "loved one," "care team," "household," "match," "home preparation," "caregiver payment coordination," "care coordination platform," "family," "caregiver."
- No em or en dashes. No "It's not just X, it's Y." No AI-tell vocabulary (delve, leverage, holistic, journey, landscape, transformative, etc.).
- Financial privacy: NO subscription dollar amounts, NO home preparation dollar amounts, NO household monthly totals. Public-facing care rate references allowed only as the per-hour figures ($40 / $45 / $50+) and only if naturally needed; preference is to leave dollar figures out of this particular post entirely and route specifics to a private onboarding conversation.
- Tavara positioned as a care coordination platform, never an employer, never an agency.
- WhatsApp central number 1-868-786-5357 mentioned once, in the closing, as the way to start the first conversation.
- FAQs (3 to 4 entries) covering: how long onboarding takes, what happens if the first match isn't right, why home preparation matters, what families pay for during onboarding (answered without dollar figures).

## Where it lives
- Insert as a new row in `blog_posts` via migration with all fields populated (slug, title, description, body in markdown, category, reading_time, author_*, cover_image_url reusing an existing cover or a newly generated one, cta_label, cta_href, faqs jsonb, status='published', published_at=now()).
- No code changes to the blog reader, listing, or editor. The post renders through the existing `/blog/[slug]` route.

## Open questions before writing the migration
1. **CTA destination** — `/family-matching`, `/family/features-overview`, or the WhatsApp deep link? Default plan: `/family-matching`.
2. **Cover image** — reuse the cover from one of the existing posts (e.g. the "Why families resist care" cover), or generate a new one (calm domestic interior, no faces)?
3. **Confirmation on Family B identity** — the "Pelier family" reference resolved to the founder-owned household with care recipient June P. Johnson. Confirm that's the intended second case study before publishing.
