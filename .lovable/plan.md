## Goal

Extend the existing admin Blog Leaderboard (`/admin/blog/analytics`) so we can see the new blog → quiz → register funnel introduced when the three blog CTAs were repointed at `/family/readiness-quiz`.

## Current state

`BlogAnalyticsLeaderboardPage.tsx` already aggregates per-post, last 90 days:

| Column | Source event | Attribution |
|---|---|---|
| Landings | `blog_utm_landed` | `additional_data.post_slug` |
| CTA clicks | `blog_cta_click` | `additional_data.post_slug` |
| Registrations | `family_registration_page_view` / `professional_registration_page_view` | `utm_campaign = blog-<slug>` (or `utm_referrer_content`) |
| Convert % | regs / landings | — |

Since the three article CTAs now land on `/family/readiness-quiz` first, the funnel has a new middle step. The quiz page already fires `readiness_quiz_view` and `readiness_quiz_completed` via `PageViewTracker`, and `PageViewTracker` auto-captures `utm_campaign` from the URL. The CTA builder (`buildCtaDestination`) stamps `utm_campaign=blog-<slug>`, so quiz events are already attributable per post — no new tracking code is needed.

## Changes (scoped, presentation-only)

Single file: `src/pages/admin/BlogAnalyticsLeaderboardPage.tsx`

1. Add `readiness_quiz_view` and `readiness_quiz_completed` to the `.in("action_type", [...])` array.
2. Add two new maps: `quizStarts`, `quizCompletions`. Populate them by reading `additional_data.utm_campaign` (format `blog-<slug>`) on those events, same pattern already used for registrations.
3. Extend `LeaderboardRow` with `quizStarts: number`, `quizCompletions: number`.
4. Render two new columns between **CTA clicks** and **Registrations**: **Quiz starts**, **Quiz done**.
5. Keep existing **Convert %** = registrations / landings (unchanged), so historical comparisons stay meaningful. Add a small `text-muted-foreground` subline under the title clarifying that Convert % is landing → registration through the quiz.

No changes to:
- Tracking code, `attribution.ts`, the quiz page, CTA components
- Per-post detail page (`/admin/blog/:id/analytics`) — out of scope; we can do that next if useful
- Routing, navigation, `App.tsx`

## Files touched

- `src/pages/admin/BlogAnalyticsLeaderboardPage.tsx` (one file, ~15 lines added)

## Verification

1. Visit `/admin/blog/analytics` as admin → table now shows Landings → CTA clicks → Quiz starts → Quiz done → Registrations → Convert %.
2. Click a blog post CTA in another tab, complete the quiz, refresh the leaderboard → counts increment for that post's slug.
3. Posts with zero blog-attributed quiz traffic show `0` in the new columns (no crash, no NaN).