## Goal
When a user lands on `/auth` from the readiness quiz (URL has `from=quiz` and a `stage`), show a friendly, reassuring context banner above the Login/Sign Up tabs so they understand:
- Why they're here (continue their quiz result)
- What they get by signing up (3 short benefits tied to their stage)
- That signing in works too if they already have an account

No changes to auth logic, routes, or SignupForm fields.

## Scope (single file)
**`src/pages/auth/AuthPage.tsx`** — add a presentational banner rendered conditionally above the Tabs.

## Behavior
- Read `from`, `stage`, and `role` from URL params (already partially parsed).
- If `from === 'quiz'`, render a `QuizContextBanner` block above the Tabs (inside `CardContent`, before the Tabs/ResetForm switch).
- Banner content:
  - Small badge: "Continuing from your readiness quiz"
  - Heading: "One quick step to unlock your next move"
  - Stage-aware subline (map stage 1–4 to the same short copy already used in `familyReadinessQuiz` next-step language — kept generic if stage missing).
  - 3 bullet benefits with icons (lucide): 
    - "Save your quiz result to your profile"
    - "Get matched with the right caregivers"
    - "Talk to TAV, your care coordinator"
  - Helper line under the tabs trigger area: "New here? **Sign Up** takes ~30 seconds. Already have an account? **Login** picks up right where you left off."
- Default active tab when `from=quiz` and no explicit `tab` param → `signup` (already handled when `role` is present; extend to also trigger on `from=quiz`).
- Styled with existing design tokens (`bg-primary/5`, `border-primary/20`, `text-foreground`, `text-muted-foreground`). Mobile-first, rounded, comfortable padding.

## Out of scope
- SignupForm internals, role selector, admin code, validation.
- AuthProvider, routing, redirect logic.
- Quiz code (already navigates with `?tab=signup&role=family&from=quiz&stage=X`).

## Technical notes
- New small inline component `QuizContextBanner` defined in same file (or co-located) — pure presentational, props: `{ stage?: string }`.
- Extend the existing `useEffect` URL-param branch: add `else if (urlParams.get('from') === 'quiz') setActiveTab('signup');`.
- No new dependencies.
