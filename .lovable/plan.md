## Round 2: actually move bounce rate on the two leaking URLs

Round 1 polished CTAs and added instrumentation. The real leak is the first 100 words on these two pages don't answer the search intent fast enough. This round rewrites that copy and ships the missing `LocationHeroCTA` so Diamond Vale gets the same hero treatment as the cost blog.

Scope is still frontend / presentation only. No routing, no `FamilyRegistration.tsx`, no protected files.

---

### Fix A — Ship the missing `LocationHeroCTA`

**New file:** `src/components/blog/hero-cta/LocationHeroCTA.tsx` (~60 lines)
- Mirrors `CostHeroCTA` visual treatment so the funnel card can compare them honestly.
- Props: `slug`, `areaServed`, `primaryCtaHref`.
- Eyebrow: "Care in {areaServed}". Body: one line confirming caregivers reach that area + "matched in days, not weeks". Single primary CTA → `/family/readiness-quiz`.
- Fires `trackBlogCtaClick` with placement `hero-location` (already added to the union in round 1).

**Edit:** `src/components/landing/LandingPageScaffold.tsx`
- Mount `<LocationHeroCTA />` directly under the hero `<p>` intro, above the existing button row. The current hero is text-heavy with the CTA buttons buried below the fold on a 390px viewport.

### Fix B — Rewrite the Diamond Vale above-the-fold so the 9s bounce has a reason to stay

**Edit:** `src/pages/locations/locationsData.ts` (`diamondVale` only, other locations untouched)
- **H1** stays "In-home care in Diamond Vale" — already specific.
- **Kicker** stays.
- **Intro rewrite** — currently 3 sentences of community color before any answer. New intro leads with: caregivers reach Diamond Vale / Petit Valley / Glencoe, three-line answer to the implicit question ("is care actually available here, how fast, what does it cost"), then the community sentence. Roughly 60 words, no em-dashes, no banned words.
- **metaDescription** tightened to lead with the area + outcome so the SERP snippet matches the new intro.

### Fix C — Rewrite the cost blog above-the-fold so the 19s bounce sees the number immediately

**Edit:** `src/content/blog/posts.ts` (`careCosts` post only)
- **Lead paragraph rewrite** — currently opens with "nobody wants to give you a straight number" then makes the reader wait for the table. New lead: one sentence acknowledging the search intent, then the three rates inline ($40 / $45 / $50+) in the first two sentences, then the "rest of this article explains why" transition into the existing table. The reader sees the answer before they scroll.
- No changes to the table, the tier explanations, or anything below "The short answer".
- Language pass on the lead only: remove any em/en-dashes, keep "care rate" language, do not touch the existing subscription pricing table (out of scope, see note below).

### Fix D — Verify the readiness quiz fires `family_registration_page_view`

Read-only check on `FamilyReadinessQuizPage` (and its `PageViewTracker` usage if present). If it already fires the event, do nothing. If it does not, add a single `<PageViewTracker actionType="family_registration_page_view" />` mount on the quiz landing. No form logic changes.

---

### Out of scope, flagged for a separate decision

The existing cost blog at lines 188–195 publishes the **Active Care $699/wk and Premium $899/wk subscription dollar amounts**. Per `mem://constraints/financial-privacy-public-surfaces`, subscription dollar amounts are **never** supposed to appear on public surfaces — only tier names and the per-hour care rates. This is a pre-existing violation that predates this conversation. I will NOT touch it in this round because it is a content/policy decision, not a conversion fix, and you should make the call deliberately. Flag it and I will plan a separate cleanup.

### Files touched in this plan

| File | Change | Lines |
| --- | --- | --- |
| `src/components/blog/hero-cta/LocationHeroCTA.tsx` | New | ~60 |
| `src/components/landing/LandingPageScaffold.tsx` | Mount LocationHeroCTA in hero | ~5 |
| `src/pages/locations/locationsData.ts` | Rewrite `diamondVale.intro` + `metaDescription` | ~6 |
| `src/content/blog/posts.ts` | Rewrite `careCosts` body lead paragraph only | ~6 |
| `src/pages/family/FamilyReadinessQuizPage.tsx` (read-only check; only edit if event missing) | Conditional 1-line | 0–1 |

### What we will see in the funnel card within 48h

- `hero-location` row appears with its own click count, isolating Diamond Vale's CTA performance from the generic location buttons.
- `blog_utm_landed` → `blog_cta_click` ratio on the cost blog slug should improve if the rate-anchored lead works. If it doesn't move, the lever isn't copy, it's traffic intent mismatch and the next step is keyword-level work, not more page edits.
- `location_cta_click` count on Diamond Vale rises out of zero (or stays flat, which is itself a useful signal that the page needs a different angle entirely).

### What this plan deliberately does NOT do

- No `FamilyRegistration.tsx`, `App.tsx`, routing, or auth changes
- No subscription pricing edits on the cost blog (see flagged item above)
- No new tables, edge functions, migrations, env vars, or dependencies
- No GA4 wiring
- No body-copy rewrites below the fold on either URL
- No new location pages, no SEO meta overhaul beyond the two `metaDescription` tweaks
