

## Plan — Tavara Care Readiness Quiz (front-facing, stage-gated onboarding)

### What you'll get

A warm, single-question-per-screen visual quiz at **`/family/readiness-quiz`** that takes a family ~90 seconds to complete, scores them into one of 4 readiness stages, saves the result to their profile, and **changes what they see across the dashboard** — onboarding, messaging, services, and pricing exposure all gated by stage.

Works for both anonymous visitors (results saved to `localStorage`, prompted to sign up to "lock in your stage") and signed-in families (saved to `profiles.client_stage` + auto-redirect to a tailored dashboard view).

### User flow

```text
Landing (Index) ──► [Take the 60-second readiness check]
                          │
                          ▼
              /family/readiness-quiz
                          │
        ┌─────────────────┴─────────────────┐
        │  Q1 → Q2 → Q3 → Q4 → Q5 → Q6      │
        │  (1 question/screen, 4 cards each, │
        │   soft progress dots at top)       │
        └─────────────────┬─────────────────┘
                          ▼
                   Results screen
              (stage card + 3 next-step CTAs)
                          │
        ┌─────────────────┴─────────────────┐
        ▼                                   ▼
  Anonymous → "Save my stage"        Signed-in → save to
  → /auth?tab=signup&stage=2         profiles.client_stage
                                     → /dashboard/family
                                     (now stage-aware)
```

### Quiz content (final copy you can ship)

**6 questions, 4 visual cards each.** Each card maps to stage 1–4. Final stage = `Math.round(avg(scores))` clamped to 1–4. Border-color tokens: green (1), amber (2), orange (3), rose (4). Icons from `lucide-react`.

| # | Question | Card 1 (Stage 1) | Card 2 (Stage 2) | Card 3 (Stage 3) | Card 4 (Stage 4) |
|---|---|---|---|---|---|
| 1 | How are you feeling about your situation right now? | I feel overwhelmed and just need help to start | I'm managing, but it's a lot to keep up with | I'm starting to see where I need more support | I'm ready for someone to take more off my plate |
| 2 | What feels hardest right now? | Getting consistent care in place | Keeping up with daily routines | Managing the home around care | Feeling mentally and emotionally stretched |
| 3 | How comfortable are you having support in your home? | Still getting used to the idea | Open, but need to go slowly | Comfortable and open to guidance | Ready for structured, ongoing support |
| 4 | How would you describe your home in relation to care? | It's fine for now, we'll figure it out | It works, but some things could be easier | Noticing areas that need attention | Needs proper setup to support care |
| 5 | What kind of support feels most helpful right now? | Just the basics to get started | Help staying organized and on track | Step-by-step guidance to improve things | Someone to coordinate everything for me |
| 6 | What matters most to you right now? | My loved one's comfort | Keeping things manageable for me | Getting things properly set up | Peace of mind and consistency |

### Results screens (verbatim copy)

**Stage 1 — Entry / Overwhelm** (green)
- Title: *"You're at the beginning — let's keep this simple."*
- Body: *"Right now, the focus is just getting support in place and helping things feel more stable. There's no need to think about changing anything else yet. We'll take this step by step, together."*
- Next steps shown: **(1) Find a caregiver** · **(2) Tell us about your loved one** · *(no add-ons, no environment reset, no premium pricing)*

**Stage 2 — Settling / Trust Forming** (amber)
- Title: *"You're settling in — this stage is about building trust."*
- Body: *"You're getting a feel for how things work and what your family needs. Right now, the focus is consistency and comfort — not big changes. Tavara will check in gently as you go."*
- Next steps: **(1) Build your care team** · **(2) Share their daily routine** · *(soft observations only, no environment reset, basic subscription only)*

**Stage 3 — Readiness / Openness** (orange)
- Title: *"You're ready for support beyond the basics."*
- Body: *"You're starting to see where things could be easier or more structured. This is a good time to introduce support that takes pressure off you."*
- Next steps: **(1) Guided Home Reset** ($499) · **(2) Care coordination** · **(3) NIS payroll support**

**Stage 4 — Dependence / Optimization** (rose)
- Title: *"You're ready to hand over more of the load."*
- Body: *"You're looking for consistency, structure, and less day-to-day management. Tavara can now take a more active role in coordinating and maintaining everything for you."*
- Next steps: **(1) Full Care Environment Reset** · **(2) Premium ongoing coordination** ($2499/mo) · **(3) Dedicated care manager**

### Stage-aware dashboard behavior

A new `useFamilyStage()` hook reads `profiles.client_stage` (default = 1 if null) and exposes it everywhere. Existing components conditionally show/hide content based on stage:

| Surface | Stage 1 | Stage 2 | Stage 3 | Stage 4 |
|---|---|---|---|---|
| `EnhancedFamilyNextStepsPanel` headline tone | Gentle, "one thing at a time" | "Building your rhythm" | "Ready to expand" | "Optimizing your care" |
| `CareEnvironmentJourneyStepContent` (home reset upsell) | **Hidden** | **Hidden** | **Visible — Guided Reset** | **Visible — Full Reset** |
| `SchedulingStatusBanner` urgency | Soft amber | Soft amber | Standard | Prominent |
| Subscription pricing exposure | Free Basic only mentioned | Basic + Care tier | All 3 tiers | Premium highlighted |
| WhatsApp nudge cadence (admin metadata flag) | Weekly check-in only | Bi-weekly | Standard cadence | Active coordination |
| TAV assistant tone | "Let's start small" | "Here when you need" | "Let me help you organize" | "I'll handle this for you" |

Stage is **never visible to the family as a label** ("Stage 3" never shown in UI) — it's an invisible control that personalizes everything else, exactly like your spec says.

### Files to create / change

| File | Type | Change |
|---|---|---|
| `supabase/migrations/<ts>_add_client_stage_to_profiles.sql` | NEW | `ALTER TABLE profiles ADD COLUMN client_stage smallint NULL CHECK (client_stage BETWEEN 1 AND 4)`, `ADD COLUMN client_stage_assessed_at timestamptz NULL`, `ADD COLUMN client_stage_quiz_responses jsonb NULL`. No RLS change needed — existing profile policies cover it. |
| `src/data/familyReadinessQuiz.ts` | NEW | Pure data: questions array, stage definitions (title/body/color/icon/CTAs), scoring function `scoreQuiz(answers: number[]): 1\|2\|3\|4` |
| `src/pages/family/FamilyReadinessQuizPage.tsx` | NEW | Top-level page; manages step state, renders one `QuizQuestionCard` at a time with framer-motion slide transitions; final step renders `QuizResultCard`; saves to DB if signed in, to `localStorage.tavara_readiness_stage` if not |
| `src/components/family/quiz/QuizQuestionCard.tsx` | NEW | One question, 4 tappable cards (reuses `OptionCard` pattern from chatbot), back button, progress dots (1/6 → 6/6) |
| `src/components/family/quiz/QuizResultCard.tsx` | NEW | Stage hero card with title/body/icon + 2-3 next-step CTAs; "Save my stage" CTA for anonymous users |
| `src/components/family/quiz/QuizProgressDots.tsx` | NEW | 6 soft dots, current = filled primary, complete = filled muted |
| `src/hooks/useFamilyStage.ts` | NEW | Returns `{ stage: 1\|2\|3\|4, isLoading, refresh }`. Reads `profiles.client_stage`, falls back to localStorage for anonymous, default 1 |
| `src/components/routing/AppRoutes.tsx` | EDIT | Add `<Route path="/family/readiness-quiz" element={<FamilyReadinessQuizPage />} />`. **No other route changes** (per guardrail). |
| `src/pages/Index.tsx` | EDIT | Add a single soft CTA card above existing content: *"New here? Take our 60-second readiness check"* → links to `/family/readiness-quiz`. Non-destructive, additive only. |
| `src/components/family/FamilyDashboard.tsx` | EDIT | Add small banner at top *if* `client_stage IS NULL`: *"Help us tailor your experience — take the 60-second readiness check"* → quiz link. Existing dashboard untouched otherwise. |
| `src/components/family/EnhancedFamilyNextStepsPanel.tsx` | EDIT | Read `useFamilyStage()`; swap headline/subtext per stage map above. Step list unchanged — only tone changes. |
| `src/components/family/CareEnvironmentJourneyStepContent.tsx` | EDIT | Wrap render in `if (stage < 3) return null;` (Stage 1/2 won't see environment reset upsell, fixing the Ana scenario) |

**Total: 1 migration, 7 new files, 5 light edits.** No touching `App.tsx`, AuthProvider, FamilyRegistration.tsx, chat flow, or any registration/dashboard route definitions.

### Persistence + analytics

- Signed-in: `UPDATE profiles SET client_stage = N, client_stage_assessed_at = now(), client_stage_quiz_responses = jsonb({q1:1,q2:2,...})`
- Anonymous: `localStorage.setItem('tavara_readiness_stage', N)` + `tavara_readiness_responses` — auto-migrated to profile on next login by a small effect in `AuthProvider`'s **existing** profile-load step *(read-only check — if migration touch is too sensitive, instead add the migration into `FamilyDashboard` mount effect)*
- Quiz completion fires existing `PageViewTracker` with `actionType: 'readiness_quiz_completed'`, `journeyStage: 'pre-onboarding'`, plus `metadata: { stage: N }` — admin analytics already aggregates these

### Visual & tone guardrails honored

- **Mobile-first**: full-bleed cards, `min-h-[44px]` tap targets, sticky progress dots at top, no fixed widths
- **One question per screen** with framer-motion `x: 100 → 0` slide-in (matches existing `FamilyJourneyPreview` motion pattern)
- **Soft palette**: green-50, amber-50, orange-50, rose-50 backgrounds with matching `border-l-4` accents (matches your existing `StaleDraftRecoveryCard` pattern)
- **No "Submit" button** — tapping a card auto-advances after 250ms (warm, conversational)
- **Back button** on every screen (never let user feel stuck, per Tavara product principles)
- **No clinical language** — no "assessment," no "score," no "diagnosis"; only "readiness check" and "where you are right now"
- **Founder voice copy** throughout — "We'll take this step by step, together"

### Acceptance test

1. Visit `/` → see soft "Take the 60-second readiness check" card → click → land on quiz Q1
2. Answer Q1 with card 1 → auto-advance to Q2 (slide animation) → progress dots show 2/6
3. Tap back button on Q2 → returns to Q1 with previous answer highlighted
4. Complete all 6 with mostly card-1 answers → result screen shows green Stage 1 with title *"You're at the beginning"* and 2 CTAs (no environment reset, no premium pricing)
5. Complete with mostly card-4 answers → rose Stage 4 with Full Reset + Premium CTAs
6. Anonymous user clicks "Save my stage" → routed to `/auth?tab=signup&role=family` → after signup, profile has `client_stage = 4` populated from localStorage
7. Signed-in family with `client_stage = 1` opens `/dashboard/family` → `CareEnvironmentJourneyStepContent` is **not rendered** → `EnhancedFamilyNextStepsPanel` headline reads "Let's keep this simple"
8. Same family retakes quiz, lands on Stage 3 → dashboard now shows Guided Home Reset upsell, panel headline updates to "Ready to expand"
9. Admin queries `SELECT client_stage, COUNT(*) FROM profiles WHERE role = 'family' GROUP BY client_stage` → distribution visible for cohort analysis

### Out of scope (explicitly)

- Changing FamilyRegistration.tsx (protected by guardrail)
- Touching AppRoutes route tree beyond the one new route
- Touching chat flow, AuthProvider, App.tsx
- Building admin UI to manually override `client_stage` (separate workstream — DB column is admin-editable via SQL for now)
- Re-quiz scheduling / nudges to retake (separate workstream — manual retake link is enough for v1)
- Stage-based pricing changes inside `SubscriptionPage` (just exposure/visibility for v1; actual checkout unchanged)
- TAV assistant tone variants (data hook is wired but TAV copy edits are a follow-up)

