# Plan: 5th T&T Blog Post — "Preparing Your Home for Care"

Add one new blog post as a `draft` in the `blog_posts` table, visible at `/admin/blog` for review. No changes to onboarding components, pricing catalog, or any existing surface.

## Scope

**In scope**
- New row in `blog_posts` (status=`draft`)
- New cover image saved to `public/blog-covers/` and `src/assets/blog/`
- Register slug in `src/lib/blog/clusters.ts` under `cost-and-planning`
- Add URL to `public/sitemap.xml`

**Out of scope**
- `CareEnvironmentIntroCard.tsx`, `CareSuppliesCard.tsx`, `CareEnvironmentJourneyStepContent.tsx`
- `/admin/onboarding-checklist` and any onboarding logic
- Pricing catalog, billable services, dollar amounts on public surfaces

## Post specs

- **Slug:** `preparing-your-home-for-care-trinidad-tobago`
- **Title:** Preparing Your Home for Care (Trinidad & Tobago)
- **Cluster:** `cost-and-planning`
- **Category:** `Family Care Guides`
- **Status:** `draft`
- **Author:** Chanua Johnson, Tavara Care Coordinator & Founder
- **Reading time:** auto via `estimateReadingTime`
- **Cover image:** warm T&T living room, soft natural light, lived-in but ordered, no people, 16:9
- **CTA:** "Talk to us about home preparation" → `/family/features-overview`

## Content outline

1. Why home preparation matters (dignity, safety, caregiver effectiveness — not "cleaning")
2. The home as a care environment — what shifts when a caregiver begins shifts
3. Weekend walk-through families can do: airflow, hallway clearance, bathroom safety, medication zone, caregiver workspace
4. Basic care supplies the family provides: gloves, monitoring devices, meds, food, personal care items, workspace access
5. When to bring Tavara in to help coordinate a deeper reset — names the three support tiers **by name only** (Care Readiness Assessment, Guided Home Reset, Full Care Environment Reset). States pricing is shared privately during onboarding. **No dollar amounts.**
6. Founder note from Chanua — short, warm, T&T voice
7. Internal links: `senior-care-costs-trinidad-tobago-2026`, `paying-for-care-without-going-broke-trinidad`, `inside-tavara-onboarding-step-by-step`

## Language guardrails applied

- "loved one" not "patient"; "care team" not "staff"; "arrange care" not "hire"; "home preparation" not "clean-up"
- No em/en-dashes; no "It's not just X, it's Y"
- No banned words (delve, leverage, holistic, journey, landscape, transformative, seamless, robust, etc.)
- British spellings; short paragraphs; at least one concrete T&T detail per 800 words
- Frames Tavara as coordinating and managing vendors — never doing the cleaning work ourselves

## Technical steps

1. Generate cover image (premium quality, 16:9, warm T&T home)
2. `INSERT` into `blog_posts` via insert tool with `status='draft'`, no `published_at`
3. Edit `src/lib/blog/clusters.ts` — add slug to `BLOG_CLUSTERS` under `cost-and-planning`
4. Edit `public/sitemap.xml` — add `<url>` entry with `lastmod` 2026-05-30
5. Verify draft appears at `/admin/blog`

## What to confirm with you after

Review the draft at `/admin/blog`. When you approve the copy, flip `status` to `published` and set `published_at`.
