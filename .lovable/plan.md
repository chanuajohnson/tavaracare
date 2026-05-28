## Goal

Lift conversion on the post that's driving traffic right now (`senior-care-costs-trinidad-tobago-2026`) by giving first-time T&T visitors an immediate payoff instead of a 2-minute quiz gate, and fix the tracking gap that's hiding what's happening on the quiz page.

## Problem (verified in the data)

Last 28 days of attributed traffic:

```
333 landings  →  39 CTA clicks  →  0 readiness_quiz_view  →  3 family_reg_view  →  1 reg complete
```

Two things are wrong:

1. **Heavy gate, no instant payoff.** The hero CTA on the cost post ("See what care fits my budget") points at `/family/readiness-quiz`, which is 5 questions before any answer is shown. Visitors arrived for a *price* and are asked to do a self-assessment first.
2. **`readiness_quiz_view` events are missing from the table.** The quiz page mounts `PageViewTracker` with that actionType, but 0 rows exist for 28 days while we know ≥18 clicks were routed there. Without that event we can't see drop-off inside the quiz.

## What to build

### 1. New "Instant Care Estimate" widget on the cost post

A small interactive block placed where `CostHeroCTA` lives today, scoped to the cost-of-care post only. No new pages, no backend.

Inputs (one screen, all on-page, no routing):
- Care level: `Standard $40 · Full Service $45 · Premium $50+` (segmented control, defaults to Standard)
- Hours per day: slider 4 → 12 (default 8)
- Days per week: slider 1 → 7 (default 5)

Output (updates live, no submit):
- "Estimated care rate: **$X / week**" using the per-hour figure × hours × days
- Sub-line: "Live-in care starts from $2,400 / week" (allow-listed public figure)
- One short reassurance line per the language guardrails (no "hire", "agency", "wage")

Two CTAs underneath, in this order:
- Primary: **WhatsApp us your situation** → `https://wa.me/18687865357` with a pre-filled message that includes the chosen tier + estimate (low-commitment, matches the "Direct traffic up 83%" trust signal)
- Secondary: **See caregivers who fit** → existing `/family/readiness-quiz` link, kept for visitors who want the deeper path

Tracking:
- `cost_estimator_interacted` when sliders change (debounced, once per session)
- `cost_estimator_whatsapp_click` and `cost_estimator_quiz_click` for the two CTAs, with the chosen tier/hours/days in `additional_data`

This keeps the existing quiz path intact (no chat-flow or registration changes) and adds a faster lane for the dominant intent (price).

### 2. Fix the missing `readiness_quiz_view` tracking

Confirm `PageViewTracker` actually fires the insert on the quiz page (currently 0 events despite clicks). Likely culprits to check in order:
- The conditional `actionType={showResult ? "readiness_quiz_completed" : "readiness_quiz_view"}` may flip on first render before the page mounts properly.
- `PageViewTracker` only re-fires on URL changes — verify it fires at least once on mount.

Fix so that every quiz page load logs `readiness_quiz_view` exactly once, independent of result state. Without this fix we can't tell whether the new estimator actually moves the needle.

### 3. Pricing & language compliance

Per project memory:
- Show only the per-hour tier figures and the single `$2,400/wk` live-in floor publicly. No subscription dollars, no monthly household totals, no Day 0 figures.
- Call it "care rate", never "wage".
- Avoid banned terms (hire, agency, patient, staff, etc.).

## Technical details

- **Files touched (scoped, no protected files):**
  - `src/components/blog/hero-cta/CostHeroCTA.tsx` — replace static aside with the estimator widget
  - `src/components/blog/hero-cta/CostEstimator.tsx` *(new)* — the interactive widget
  - `src/pages/family/FamilyReadinessQuizPage.tsx` — ensure `readiness_quiz_view` fires on mount once
  - Possibly `src/components/tracking/PageViewTracker.tsx` if its mount behavior is the bug
- Pure React + Tailwind + existing shadcn primitives (`Slider`, `ToggleGroup`, `Button`). No new deps, no routing changes, no chat-flow changes.
- `App.tsx`, navigation, registration pages, and dashboard files are not touched.
- Mobile-first: 390px viewport is the current preview width — the widget renders as a single stacked column on mobile, two-column from `md:` up.
- All copy reviewed against `mem://constraints/tavara-language-guardrails` and `mem://constraints/financial-privacy-public-surfaces`.

## How we'll know it worked

After deploy, watch in `cta_engagement_tracking` for 7 days:

- `cost_estimator_interacted` count > 0 (proves the widget is being used at all)
- `cost_estimator_whatsapp_click` + `cost_estimator_quiz_click` combined > current `hero-cost` blog_cta_click count
- `readiness_quiz_view` count > 0 (proves tracking is fixed)
- `family_registration_page_view` count up from 3

If WhatsApp clicks dominate, we'll know low-commitment outreach is the real shape of demand and can extend the pattern to other posts in a follow-up.

## Out of scope (intentionally)

- Rewriting the quiz itself
- Touching `/registration/family` or the chat flow
- New T&T blog posts (separate priority the user deferred)
- SEO / sitemap work (separate priority)
- Any change to App.tsx, Navigation, AuthProvider, or dashboard routes
