# Fix the stale readiness result, and show readiness in the unlock steps

## What went wrong for chanuajohnson7

I checked the record. That family has **no** readiness answers saved at all: no readiness profile, no journey stage, no information capacity. Yet the screen greeted them with "Lifting the daily load — care is in place."

Cause, confirmed: the readiness screen decides whether to show the result straight away by asking "does this family already have a stage?", and that question falls back to a value cached in the browser when the account itself has none. Your browser still held stage 4 from earlier testing on a different account. So a brand-new family walked out of registration and was shown someone else's leftover result instead of question one.

This would hit any real family who ever took the quiz on a shared or previously used browser, and it is the worst possible first impression: we tell them care is already in place when they are standing at the very beginning.

## Fix 1 — a signed-in family's own record is the only source of truth

- When someone is signed in, only their saved record decides whether they have a result. No browser fallback.
- The browser cache stays available for people who are **not** signed in, so the anonymous quiz still works.
- If a signed-in family has no saved result but the browser holds one, clear the stale browser value quietly rather than showing it.
- Arriving from registration always starts at question one, regardless of anything cached.

Effect: a fresh family always begins at "Where are you right now?" Someone who genuinely answered before still lands on their own result.

## Fix 2 — readiness appears in the Unlock Caregiver Matches steps

Add a fourth line to that panel: **Care Readiness Check — how you'd like us to pace things**, with a tick once the family has answered, and a button that opens the readiness questions.

It is listed as helpful, not required. Matches still unlock on registration plus the care assessment exactly as they do today. Readiness answers must never gate access to matches, so the tick is informational and the closing line makes the required steps clear.

The panel refreshes its ticks whenever it opens, so a family who answers the questions and comes back sees the line ticked.

## Not changing

- The unlock rules for matches.
- The registration form.
- The questions themselves, or how answers are stored.

## Technical notes

- `src/hooks/useFamilyStage.ts` — when `user?.id` is present, return `hasStage: false` if `profiles.client_stage` is null instead of falling through to `readLocalStage()`; remove the stale `tavara_readiness_stage` key in that branch. Anonymous path unchanged.
- `src/pages/family/FamilyReadinessQuizPage.tsx` — exclude `fromRegistration` from `resultFirstMode` so the post-registration entry is always a fresh run.
- `src/components/family/FamilyReadinessModal.tsx` — add a readiness row driven by `useFamilyReadiness()` (`hasProfile`), navigating to `/family/readiness-quiz`; keep `requiredStepsComplete` and `onReadinessAchieved` based on registration plus care assessment only.
- Verify afterwards with a signed-in family whose `client_stage` is null while `localStorage.tavara_readiness_stage` is set to `4` — the questions must start at Q1.
