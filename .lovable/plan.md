## Goal
Close the two anon tracking gaps on the readiness quiz so `/admin/blog/analytics` can show a real funnel: view → questions answered → completed → CTA clicked → lead captured → signed up.

## Changes

### 1. New engagement event: `quiz_cta_click`
Fire from `src/components/family/quiz/QuizResultCard.tsx` inside the "good next step" button `onClick`, **before** navigation. Payload:
- `step_label` (button text)
- `step_href` (intended destination)
- `client_stage` (1–4)
- `is_anonymous` (boolean)
- `redirected_to_auth` (boolean — true for anon)
- UTM params from URL

Works for both anon and signed-in users. Uses existing `useTracking().trackEngagement` (user_id may be null).

### 2. New engagement event: `quiz_question_answered`
Fire from the quiz question handler in `src/pages/family/FamilyReadinessQuizPage.tsx` (or wherever an answer is recorded) once per answered question. Payload:
- `question_id`
- `question_index` (0-based)
- `total_questions`
- `answer_value`
- UTM params

Guard with a `useRef<Set<string>>` so the same question can't double-fire on re-renders. Anon-safe.

### 3. Leaderboard funnel column
Update `src/pages/admin/BlogAnalyticsLeaderboardPage.tsx` to also pull `quiz_cta_click` and (optionally) `quiz_question_answered`, and add two new columns to the per-post table:
- **CTA clicks** (count of `quiz_cta_click` attributed to the post via UTM)
- **Drop-off %** (1 − completed/views), computed client-side

Existing columns (Views, Quiz done, Leads, Signups) stay untouched.

### 4. No DB migration required
`cta_engagement_tracking` already accepts arbitrary `action_type` strings + JSONB `additional_data`. No schema change. RLS for anon inserts is already in place (the existing view/completed events work for anon).

## Out of scope
- `quiz_leads` table changes
- Auth redirect logic
- Quiz scoring / question structure
- Admin dashboard chrome beyond the two new columns

## Files touched
- `src/components/family/quiz/QuizResultCard.tsx` — add `trackEngagement('quiz_cta_click', …)` before navigate
- `src/pages/family/FamilyReadinessQuizPage.tsx` — add per-question tracking with ref-guard
- `src/pages/admin/BlogAnalyticsLeaderboardPage.tsx` — extend action_type IN list, aggregate CTA clicks, render new columns
