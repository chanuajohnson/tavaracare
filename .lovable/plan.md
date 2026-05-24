# Funnel all post-quiz CTAs to register/login as the next journey step

## Goal
On `/family/readiness-quiz`, after an anonymous user finishes the quiz, every "A good next step for you" button (Find a caregiver, Tell us about your loved one, Chat with TAV) and the post-lead-capture flow should funnel the user into **registration first** (or sign-in if they already have an account). Logged-in users keep the existing direct-navigation behavior.

## Changes

### 1. `src/components/family/quiz/QuizResultCard.tsx` — gate next-step buttons by auth state
- Replace the direct `navigate(step.href)` in the `stageDef.nextSteps.map(...)` loop with a handler that:
  - If `isAnonymous` → `navigate('/auth?tab=signup&role=family&from=quiz&stage=' + stage)` so the user is funneled into account creation; after signup `AuthProvider` already routes family users into the registration/dashboard flow.
  - Else (signed-in) → keep existing `navigate(step.href)` so they continue down their journey.
- Add a small caption under the button grid for anonymous users: "Create your free account to unlock these next steps." (uses muted-foreground tokens, no design changes).

### 2. `src/components/family/quiz/AnonymousLeadCapture.tsx` — turn email/WhatsApp success into a register prompt
Today, after a successful email or WhatsApp submit, `closeModal()` simply closes the dialog and the "Want to keep this?" card re-appears unchanged. That's what the user reads as "the quiz goes back to the start". Fix:
- Add local `captured` state (`'email' | 'whatsapp' | null`) set on successful insert.
- When `captured` is set, replace the three-button capture grid with a success state:
  - Headline: "Saved. Here's your next step."
  - Subcopy: "Create your free account to keep your result tied to you and unlock your next steps." (or "Sign in" link below for existing users)
  - Primary button: **Create my account** → `/auth?tab=signup&role=family&from=quiz&stage=<stage>`
  - Secondary link: **Sign in** → `/auth?from=quiz&stage=<stage>`
- Keep the existing "Create account" button behavior for the third tile pre-capture.
- WhatsApp flow: keep opening WhatsApp, but on return the card now shows the same success/register prompt (no more "back to capture options" perception).

### 3. Out of scope (no changes)
- No changes to `FamilyReadinessQuizPage.tsx` flow, scoring, or persistence.
- No changes to `AuthPage` / `AuthProvider` redirect logic — we rely on the existing post-signup routing for family role.
- No changes to the dashed "take me home" / "Go to my dashboard" card at the bottom.
- No changes to tracking events.

## Files
- `src/components/family/quiz/QuizResultCard.tsx` (one handler + small caption)
- `src/components/family/quiz/AnonymousLeadCapture.tsx` (success state + render switch)

## Verification
- As anonymous on `/family/readiness-quiz` after completing the quiz: each of the three next-step buttons routes to `/auth?tab=signup&role=family&from=quiz&stage=N`.
- Submit the email lead form: dialog closes and the capture card now shows the "Saved. Create your account" success state instead of resetting to the three options.
