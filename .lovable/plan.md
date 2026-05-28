## Why

Today's Acquisition Funnel only sees 5 steps. The DB confirms three measurement holes that are hiding real user drop-off:

1. **Quiz is dark.** `readiness_quiz_completed` and `quiz_cta_click` have never fired. `readiness_quiz_view` last fired 35+ days ago. None of the 3 new users touched the quiz.
2. **Registration abandonment is invisible.** Krissy Luke landed on `/registration/family` twice and never completed — the funnel jumps straight from "page view" to "completed" with no signal in between.
3. **Professional journey ends at "registered."** Shania completed registration 3 days ago but the funnel has no row for "documents uploaded" or "vetting passed" or "assigned to family" — she's invisible after step 4.

## Changes

### 1. Repair quiz instrumentation (family side)

Find the `FamilyReadinessQuiz` component (data lives in `src/data/familyReadinessQuiz.ts`). Add `trackEngagement` calls:
- `readiness_quiz_view` — on mount (verify why it stopped firing on 2026-04-23; likely a refactor dropped the call)
- `readiness_quiz_completed` — on final-question submit, with `additional_data: { result_tier, score }`
- `quiz_cta_click` — on the post-quiz "Register now" / "Find caregivers" button

Include `post_slug` (from current URL/referrer) in `additional_data` so the leaderboard's slug-based attribution keeps working.

### 2. Add registration form-started event

Per the project guardrail, `FamilyRegistration.tsx` and `ProfessionalRegistration.tsx` are protected. **This change requires explicit user approval** before build. Scope, when approved:
- One `useEffect` per file, fires `family_registration_form_started` / `professional_registration_form_started` once per session on first input focus (any field).
- `additional_data: { utm_source, utm_campaign, post_slug, referrer }`.

Without this, the page-view → complete gap (e.g., Krissy) stays unmeasurable.

### 3. Extend `useBlogAnalyticsRange.ts`

- Add new event names to `TRACKED`: `family_registration_form_started`, `professional_registration_form_started`.
- Add a second supabase query for the professional terminal step. Pick the cheapest authoritative source:
  - `professional_documents` — distinct `user_id` with rows created in range = "Documents uploaded"
  - `care_team_members` — distinct `caregiver_id` with `created_at` in range = "Assigned to family"
- Return `professionalDocsCurrent`, `professionalAssignedCurrent` (and previous-period equivalents for delta math).

### 4. Rebuild `AcquisitionFunnelCard.tsx` step list

New step order (with role-aware visibility):

| # | Step | Source | Visible on |
|---|---|---|---|
| 1 | Blog / location landing | `blog_utm_landed` + `location_utm_landed` | Combined |
| 2 | CTA click | `blog_cta_click` | Combined |
| 3 | Quiz viewed | `readiness_quiz_view` | Combined + Family (greyed on Professional) |
| 4 | Quiz completed | `readiness_quiz_completed` | Combined + Family |
| 5 | Quiz CTA clicked | `quiz_cta_click` | Combined + Family |
| 6 | Registration page view | `family_/professional_registration_page_view` | All |
| 7 | Registration form started | `*_registration_form_started` (if step 2 approved) | All |
| 8 | Registration completed | `*_registration_complete` | All |
| 9a | Documents uploaded (Pro) | `professional_documents` | Combined + Professional |
| 9b | Subscription assigned (Family) | `onboarding_checklists.post_onboarding_6` | Combined + Family |
| 10 | Caregiver assigned to family (Pro) | `care_team_members` | Combined + Professional |

Steps 9a/9b render side-by-side on Combined; only the relevant one shows per role tab. Steps that don't apply to the active tab render greyed with a one-line "n/a for this role" caption (don't zero them silently — that misleads).

### 5. Side-tile engagement signals

Below the funnel, add two small KPI tiles (current vs previous window) using events already fetched but unused:
- WhatsApp clicks (`whatsapp_click`)
- Match requests (`caregiver_match_request`)

These don't belong in the linear funnel (they happen at multiple stages) but are intent signals worth surfacing.

### 6. Methodology disclosure

Collapsible "How this funnel is counted" block under the card, listing the event/table source for each row plus the known caveats (anonymous pre-reg steps can't split by role, subscription timestamp = last checklist edit, quiz attribution is directional only).

## Files affected

- `src/components/admin/blog-analytics/AcquisitionFunnelCard.tsx` — new steps, new drill-downs, side tiles, methodology block
- `src/hooks/admin/useBlogAnalyticsRange.ts` — extra queries, extended `TRACKED`
- `src/pages/admin/BlogAnalyticsLeaderboardPage.tsx` — pass new arrays
- `src/components/family/quiz/...` (locate exact path during build) — fix/add quiz tracking calls
- *(Requires explicit approval)* `src/pages/registration/FamilyRegistration.tsx`, `src/pages/registration/ProfessionalRegistration.tsx` — single `useEffect` for form-started event

## Explicitly out of scope

- No anonymous-session-ID join to attribute pre-auth quiz takers to post-signup users (separate, larger piece).
- No PayPal / checkout / GA4 `purchase` event.
- No edits to `/admin/onboarding-checklist`.
- No professional "quiz" equivalent — that doesn't exist as a product yet.

## Three questions before I build

1. **Form-started event in protected files:** do I have your approval to add a single, focus-triggered `*_registration_form_started` tracking call to `FamilyRegistration.tsx` and `ProfessionalRegistration.tsx`? Without this, Krissy-type abandonment stays invisible.
2. **Professional terminal step:** one row ("Assigned to family team") or two ("Documents uploaded" → "Assigned")? Two is more diagnostic; one is cleaner.
3. **Quiz on Professional tab:** grey the 3 quiz rows with "Family-only quiz" caption, or hide them entirely on the Professional tab?
