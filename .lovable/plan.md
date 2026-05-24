
## Problem

When a reader clicks the "For caregivers — Join a coordinated care team" CTA on a blog post:

1. They land on `/registration/professional?utm_*` (with UTM params from `BlogTopCTA`).
2. If not signed in, they see a bare "Authentication Required / Sign In" screen — no Tavara branding, no explanation of what they're signing up for, no UTM forwarding.
3. Clicking Sign In drops them on `/auth` with a generic "Welcome / Sign in to your account or create a new one" card. There's already a `QuizContextBanner` for `?from=quiz` family flows, but nothing equivalent for professionals coming from the blog.

Net effect: a caregiver who was interested mid-article hits two cold, contextless screens and bounces.

## Goal

Make the professional-from-blog path feel like one continuous experience: branded, informative, and clear about what signing up gets them — without touching the protected core auth/registration logic, routing, or form fields.

## Scope (presentation-only)

### 1. Upgrade the auth gate on `src/pages/registration/ProfessionalRegistration.tsx` (lines ~568–581 only)

Replace the bare "Authentication Required" block with a branded card that:

- Shows Tavara framing: "Join Tavara as a caregiver" + the "It takes a village to care" tone.
- Explains in 3 short bullets what the sign-up unlocks (profile, vetting, matched families).
- Has a clear primary CTA → `/auth?tab=signup&role=professional&from=blog` with **all current UTM params forwarded** (read from `useSearchParams`, append to the auth URL).
- Has a secondary "I already have an account" link → `/auth?tab=login&from=blog` (UTMs forwarded).
- A small "Why am I here?" line referencing they arrived from a Tavara article.

No changes to the auth check, redirect logic, form fields, or anything below line 583.

### 2. Add a `ProfessionalContextBanner` to `src/pages/auth/AuthPage.tsx`

Mirror the existing `QuizContextBanner` pattern (same file, same visual language) — purely additive:

- New small component `ProfessionalContextBanner` defined alongside `QuizContextBanner`.
- Rendered in the same slot as the quiz banner, gated on `_params.get('role') === 'professional'` OR (`_params.get('from') === 'blog'` AND role=professional).
- Content:
  - Eyebrow: "Joining Tavara as a caregiver"
  - Heading: "One quick step to start getting matched"
  - 3 bullets (icons reusing already-imported `UserCheck`, `MessageCircle`, `Save` or add 1–2 from lucide-react): create profile, complete short vetting, get matched with families that fit your skills and schedule.
  - Footer line: "New here? **Sign Up** takes about 30 seconds. Already registered? **Login** picks up where you left off."
- Auto-select the Sign Up tab when `role=professional` arrives (extend the existing `useEffect` URL-param block — the file already does this for `role` generally on line ~86, just confirm professional path keeps signup selected; no logic rewrite).

No changes to `handleLogin`, `handleSignup`, `handleResetPassword`, `handleForgotPassword`, the Tabs structure, the suspended-account block, or routing.

### 3. Forward UTM + context from `BlogTopCTA` through the gate

`src/components/blog/BlogTopCTA.tsx` already builds `proHref` via `buildCtaDestination`. The auth gate (step 1) is the piece that currently drops UTMs when navigating to `/auth`. Fix is contained to step 1: read `location.search` and append to the auth URL so the AuthPage banner can render and analytics stays attributed.

## Out of scope (explicitly not touching)

- `src/App.tsx`, any routes, `AuthProvider`, the `SignupForm` / `LoginForm` internals.
- The professional registration form fields, validation, or submission logic.
- Tracking schema (existing `trackBlogCtaClick` and UTM forwarding are already wired).
- Family/quiz banner behavior.

## Files to edit

- `src/pages/registration/ProfessionalRegistration.tsx` — replace lines ~568–581 only (the `!user` block).
- `src/pages/auth/AuthPage.tsx` — add `ProfessionalContextBanner` component + one conditional render line + minor tweak to the existing URL-param `useEffect` if needed.

## Acceptance check

1. Clicking the caregivers CTA on a blog post and signing out → gate shows branded Tavara card with 3 value bullets and forwards UTMs.
2. Clicking "Sign Up" on the gate → AuthPage shows the new professional banner, Sign Up tab is pre-selected.
3. Clicking "I already have an account" → AuthPage shows the same banner with Login tab selected.
4. Existing quiz-from-family flow, normal `/auth` visits, suspended-account state, and password reset all render unchanged.
