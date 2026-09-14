# Family Readiness Audit — What Exists Today

Audit only. Nothing was changed. Sections I–K are proposals for your decision.

## A. What already exists

There are **two separate things both called "readiness"**, plus a third clinical intake. They are not connected.

**1. Family Readiness Quiz (emotional readiness) — real, working, barely used**
- `src/data/familyReadinessQuiz.ts` — 6 questions, 4 options each scored 1–4, averaged and rounded into a stage 1–4 (`scoreQuiz`).
- Page: `src/pages/family/FamilyReadinessQuizPage.tsx`; cards in `src/components/family/quiz/*` (`QuizQuestionCard`, `QuizReflectionField`, `QuizResultCard`, `AnonymousLeadCapture`, `PreviousAnswersPanel`).
- Stage resolution: `src/hooks/useFamilyStage.ts` — DB first, then localStorage, else default 1.
- **Usage today: 1 of 24 family accounts has a stage recorded.** Effectively dormant.

**2. `FamilyReadinessChecker` (form completeness) — misleading name**
- `src/components/family/FamilyReadinessChecker.tsx` + `src/hooks/family/completionCheckers.ts`. "Ready" only means: profile fields filled AND a care-assessment row exists. Zero emotional signal. Gates whether the family sees caregiver matches or a nag modal (`FamilyReadinessModal.tsx`).

**3. Care Needs Assessment (clinical care need)**
- `src/components/family/CareNeedsAssessmentForm.tsx` → table `care_needs_family` (51 columns). Purely ADLs, cognition, medical, housekeeping, transport, emergency, comms method.

## B. Existing questions and response options

Readiness Quiz (the only place readiness of mind is asked):
1. `q1_emotional_entry` — "How are you feeling about your situation right now?" → overwhelmed / managing but it's a lot / seeing where I need support / ready to hand off.
2. `q2_immediate_pressure` — "What feels hardest right now?" → getting care in place / daily routines / managing the home / mentally stretched.
3. `q3_trust_readiness` — "How comfortable are you having support in your home?" → still getting used to the idea / open but slowly / comfortable / ready for ongoing support.
4. `q4_environment` — "How would you describe your home in relation to care?" → fine for now / some things easier / areas need attention / needs proper setup.
5. `q5_support_preference` — basics / staying organized / step-by-step guidance / a person handling errands and supplies.
6. `q6_priority_anchor` — loved one's comfort / manageable for me / properly set up / less running around.
Plus one open reflection text field.

Stages: 1 Entry, 2 Settling, 3 Readiness, 4 Optimization — each with copy, badge, and three next-step CTAs.

Care Needs Assessment sections: Basic info, Daily living tasks, Cognitive/memory support, Medical conditions, Housekeeping & meals, Transportation, Emergency protocols, Communication preferences (`communication_method`, `daily_report_required`, `checkin_preference`), Cultural preferences.

## C. Where it appears in the journey

- Quiz is **optional and off to the side**: a dismissible banner on the family dashboard (`FamilyDashboard.tsx`, `ReadinessQuizBanner`) shown only when no stage is set, plus `FamilyReadinessQuickAccess.tsx` once taken. It is not part of registration and not part of onboarding.
- Care Needs Assessment is **effectively mandatory** — matches stay locked until it exists.
- Journey steps 12 "Care Readiness Assessment" and 13 "Home Environment Optimization" exist in `src/hooks/useEnhancedJourneyProgress.ts` but step 12 auto-completes from care-plan + caregiver state (no questions asked, no record stored) and step 13 is hardcoded `completed: false`.

## D. Data / database

- `profiles.client_stage`, `client_stage_assessed_at`, `client_stage_quiz_responses` (jsonb) — written by the quiz page and reflection field; nulled by `clearStage`.
- `quiz_leads` — pre-signup captures (own `client_stage`, `quiz_responses`, `reflection`, `converted_user_id`), auto-linked by `link_quiz_leads_to_profile()`.
- `care_needs_family` — clinical intake; 7 scheduling columns unused by the form.
- `profiles.care_urgency` (set in registration, currently **null for every family**), `preferred_contact_method`, `budget_preferences` (free text), `onboarding_stage`.
- Parallel unused step system: `journey_steps`, `journey_step_paths`, `user_journey_progress` (admin CRUD only, family dashboard ignores them).
- localStorage: `tavara_readiness_stage`, `_responses`, `_quiz_progress`, `_reflection`, `_lead`.

## E. What Tavara currently does with the results

- Stage 4 only: errand/supply nudge (`Stage4SupplyNudge`).
- Stage 3+: unlocks home-environment service tiers (`CareEnvironmentJourneyStepContent.tsx`).
- Stage-specific next-step CTAs and dashboard copy.
- Nothing else. It does **not** affect matching, pricing, onboarding pace, message volume, WhatsApp cadence, or what information is shown.

## F. Care-journey signals we already capture

- Urgency (immediate / within week / within month / exploring) — field exists, unused in practice.
- Comfort with outside care, home-change willingness, emotional overwhelm, support preference — via the quiz, coarsely, and only if taken.
- Contact method, check-in preference, daily report yes/no.

## G. Not captured anywhere

- First time seeking outside care; previously used an individual caregiver; previously used an agency; replacing an existing caregiver; a prior arrangement that failed; multiple past providers; currently doing all care themselves.
- Whether they are researching vs decided vs actively arranging vs already have care running.
- Information capacity (essentials vs gradual vs full detail).
- Communication cadence, preferred time window for non-urgent messages, tolerance for update volume.
- Platform/dashboard comfort.
- Privacy and trust sensitivity as a distinct signal.
- Loved one's and other family members' acceptance of outside care.
- Financial sensitivity as a graded signal (only a loose budget string).
- Understanding of what they are paying for / whether they need education before deciding.

## H. Extend, don't rebuild

- Keep `familyReadinessQuiz.ts` + `useFamilyStage` + `profiles.client_stage*` as the readiness spine — the scoring, persistence, anonymous-lead capture and admin lead view already work.
- Add new signals as extra keys inside the existing `client_stage_quiz_responses` jsonb plus a small number of typed columns; no new table needed.
- Reuse `quiz_leads` for pre-signup capture.
- Rename or clearly re-label `FamilyReadinessChecker` as a completeness gate to stop the collision.

## I. Recommended minimum changes

1. Add a **Care Journey** question set to the existing quiz: prior experience (none / informal family only / individual caregiver / agency / several providers), current situation (researching / decided but not acted / actively arranging / care already in place / replacing care), and if replacing — what went wrong (open text).
2. Add three graded signals: information capacity, platform comfort, privacy/trust sensitivity. Derive financial sensitivity from existing budget answer plus one question.
3. Add communication preferences: channel, cadence, and a time window for non-urgent messages.
4. Store as a `family_readiness_profile` jsonb on `profiles` (or extra keys in the existing responses jsonb) plus typed `care_journey_stage` and `information_capacity` columns for filtering.
5. Surface the resulting profile in the admin user detail view and the nudge tools, so coordinators see it before they message.
6. Make the quiz part of the flow rather than a side banner (see J).

## J. Recommended placement

- **Step 0, before or immediately after registration**, framed as "help us pace this right for you" — short, no clinical language, skippable but re-prompted once.
- Re-ask a 2-question version at the onboarding call and again 30 days after care starts, since readiness moves.
- Keep the anonymous version live on public pages so pre-signup families are already profiled.

## K. How the profile could personalize Tavara

- **Message volume and cadence**: essentials-only families get a weekly digest instead of daily WhatsApp updates; nudge templates filtered by information capacity.
- **Onboarding pace**: low external-care comfort delays home-prep and add-on recommendations until trust signals improve; no upsell surfaces before Action stage.
- **Education layer**: first-time families get terminology explainers and confirmation-of-understanding checkpoints; experienced families skip them and get continuity, vetting depth and replacement safeguards instead.
- **Matching emphasis**: replacing-care families weighted toward reliability and continuity; failure reasons feed match criteria.
- **Existing-care families**: land straight in coordination, scheduling, documentation and NIS support rather than discovery.
- **Admin guardrail**: a visible readiness badge so coordinators stop assuming the family is where Tavara is.

## Technical notes

- The two step systems (hardcoded `useEnhancedJourneyProgress.ts` vs DB `journey_steps`) already drift; any journey branching by readiness should pick one, and the DB-driven tables plus `journey_step_paths` are the better fit since they already support named paths.
- `care_plan_service_selections` does exist in the database, so journey step 13 can be wired to it rather than left hardcoded false.
