## Part 1 — Fix the "View users" dialog (your screenshot)

**Root cause (confirmed via DB):** The dialog query in `RegistrationUsersDialog` selects `id, full_name, email, role` from `profiles`, but the `profiles` table has **no `email` column**. PostgREST rejects the whole request, the catch shows a toast, and every row falls back to "(profile not found)".

Meanwhile the `cta_engagement_tracking` rows for both registrations DO have valid `user_id`s (`0ba80b6f…` Jennelle, `c5799b96…` Shania) and matching `profiles.full_name`. So once the query is valid, names will render.

**Fix (scoped to `src/components/admin/blog-analytics/AcquisitionFunnelCard.tsx`):**

1. Change the profiles `select` to columns that actually exist: `id, full_name, role, phone_number, created_at`.
2. Update `ProfileRow` type: drop `email`, add `phone_number: string | null` and `created_at: string | null`.
3. In the row UI, replace the email line with phone number (when present) and a small "Account created {date}" line — this makes the "form completion ≠ auth signup" point concrete (Shania's profile was created 19:17, registration_complete event 19:23).
4. Email is in `auth.users`, not `profiles`, and the client cannot read `auth.users`. If you want email in the dialog later, it needs an edge function — out of scope for this fix.

That's the only file touched. No schema, no RLS, no routing, no chat flow.

## Part 2 — Which of the pasted GA4 plan is worth implementing now

The pasted plan is **Next.js-shaped** (app router, `NEXT_PUBLIC_*`, server route handlers, `@google-analytics/data` SDK with a service-account JSON). This project is **Vite + React + Supabase edge functions**, so I cannot copy it verbatim. Here is the honest filter:

### Already done — skip
- `readiness_quiz_completed` — already firing (`PageViewTracker` on FamilyReadinessQuizPage).
- `family_registration_complete` / `professional_registration_complete` — already written to `cta_engagement_tracking` with `user_id` (proven by the DB rows above).
- `blog_cta_click` — already tracked via `trackBlogCtaClick` in `src/lib/blog/attribution.ts`.
- Acquisition funnel card on `/admin/blog/analytics` — already built and now reads from Supabase events (the very card in your screenshot).

### Worth doing — small, fits this stack
1. **Tiny `gtagEvent` helper** at `src/lib/analytics/gtag.ts` (window.gtag wrapper, SSR-safe). Mirrors the Supabase events we already fire so GA4 also sees them. Adds zero coupling — if `gtag` isn't on the page it no-ops.
2. **Mirror the 4 events we already track to GA4** by calling `gtagEvent(...)` right next to the existing Supabase inserts:
   - `family_registration_complete` (FamilyRegistration submit, after Supabase update — *additive only, no field changes*)
   - `professional_registration_complete` (Professional registration submit — same pattern)
   - `blog_cta_click` (inside `trackBlogCtaClick`)
   - `readiness_quiz_completed` (in FamilyReadinessQuizPage where `showResult` flips true)
3. **`whatsapp_click`** — add a small util `trackWhatsAppClick(location)` and call it from the existing WhatsApp links (CostEstimator, dashboard handoffs, etc.). One-line additions, no behavior change.

### Skip / do later
- **`caregiver_match_request`** — match flow is large and the AI guardrails forbid touching it without an explicit scoped ask. Not worth bundling into this change.
- **`purchase` + `subscription_started`** — PayPal subscriptions here (not Stripe). Server-side Measurement Protocol from a PayPal webhook is a real piece of work and the pasted Stripe snippet doesn't apply. Park until subscriptions volume is non-zero.
- **GA4 Data API server route + `@google-analytics/data` SDK** — that gives a *second* funnel sourced from GA4. We already have a working funnel from Supabase events, which is more accurate (no sampling, no ad-block loss). Adding the GA4 SDK requires a service-account JSON secret and a Supabase edge function. Recommend: do NOT build this now. The Supabase-sourced funnel is the better source of truth for product decisions.

### What I propose to build in the next build step
- Fix the "(profile not found)" dialog (Part 1).
- Add `src/lib/analytics/gtag.ts` and mirror the 4 already-tracked events + `whatsapp_click` to GA4 (additive only).

Everything else from the pasted plan is parked with a clear reason above. Confirm and I'll implement.