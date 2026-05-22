## Problem

Blog CTAs labeled "Start your family readiness" / "Begin family readiness" point to registration or care-assessment, not to the readiness quiz. Only the mobile sticky CTA is already correct.

| Component | Label | Current href | Should be |
|---|---|---|---|
| `BlogTopCTA.tsx` | Start your family readiness | `/registration/family` | `/family/readiness-quiz` |
| `BlogInlineCTA.tsx` | Start your family readiness | `/registration/family` | `/family/readiness-quiz` |
| `BlogEndCTABlock.tsx` | Begin family readiness | `/family/care-assessment` | `/family/readiness-quiz` |
| `BlogStickyMobileCTA.tsx` | Start family readiness | `/family/readiness-quiz` | (already correct) |

## Changes

Single-line edit in each of the three files — swap the `baseHref` passed to `buildCtaDestination(...)` to `/family/readiness-quiz`. UTM forwarding, attribution, `referringPagePath` router state, and `trackBlogCtaClick` payloads all keep working unchanged because they're independent of the base path.

No changes to:
- The quiz page itself (`FamilyReadinessQuizPage.tsx`) or `QuizResultCard.tsx`
- Caregiver-side CTAs (`/registration/professional`)
- `attribution.ts`, tracking, analytics

## Post-quiz flow (confirming, no code change needed)

After the user completes `/family/readiness-quiz`, the result card already drives them onward:

- **Anonymous users** → `AnonymousLeadCapture` + "Save your stage" button routes to `/auth?tab=signup&role=family`, which on success lands on `/registration/family` (the standard family signup → registration handoff).
- **Authenticated users** → "Go to my dashboard" lands on `/dashboard/family`, where the journey card reflects their new stage and surfaces the next family-registration / care-plan step.

So the flow the user described (quiz → encourage to register → family registration → journey progress) is already in place; this plan just fixes the entry point so the three blog CTAs actually land on the quiz first.

## Verification

1. Open any blog post on mobile, scroll, tap "Start your family readiness" in the inline and top CTAs → lands on `/family/readiness-quiz?utm_source=blog&utm_content=inline-family&...`.
2. Same for end-of-article "Begin family readiness".
3. Confirm the sticky bottom CTA still works (unchanged).
4. Complete the quiz as anonymous → result screen → "Save your stage" → `/auth?tab=signup&role=family` → after signup lands on `/registration/family`.

## Files touched

- `src/components/blog/BlogTopCTA.tsx` (1 line)
- `src/components/blog/BlogInlineCTA.tsx` (1 line)
- `src/components/blog/BlogEndCTABlock.tsx` (1 line)