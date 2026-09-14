# Deep Audit: The Two "Readiness" Systems

Audit only. No code written, nothing renamed.

## A. Existing emotional quiz — full current content

Source: `src/data/familyReadinessQuiz.ts`. Six questions, four options each, every option carries a score of 1-4. No question is optional, none can be skipped, no per-question text field. Selecting an answer auto-advances after 250ms; Back is available from Q2 onward. Progress saves to browser storage on every tap and expires after 30 days.

1. **"How are you feeling about your situation right now?"** (helper: "There's no wrong answer")
   1 overwhelmed, just need help to start / 2 managing but it's a lot / 3 starting to see where I need more support / 4 ready for someone to take more off my plate
2. **"What feels hardest right now?"**
   1 getting consistent care in place / 2 keeping up with daily routines / 3 managing the home around care / 4 feeling mentally and emotionally stretched
3. **"How comfortable are you having support in your home?"**
   1 still getting used to the idea / 2 open but need to go slowly / 3 comfortable and open to guidance / 4 ready for structured ongoing support
4. **"How would you describe your home in relation to care?"**
   1 fine for now / 2 works but some things could be easier / 3 noticing areas that need attention / 4 needs proper setup to support care
5. **"What kind of support feels most helpful right now?"**
   1 just the basics / 2 help staying organized / 3 step-by-step guidance / 4 a real person for errands, supplies, restocking
6. **"What matters most to you right now?"**
   1 my loved one's comfort / 2 keeping things manageable for me / 3 getting things properly set up / 4 less running around — groceries, meds, supplies just show up

One open text field exists, but only on the result screen (`QuizReflectionField`), stage-specific placeholder, optional.

**After submission:** stage + answer map written to browser storage; if signed in, also to `profiles.client_stage`, `client_stage_assessed_at`, `client_stage_quiz_responses` (jsonb, holds the six scores and the reflection). Anonymous finishers can leave name/contact, captured to `quiz_leads` and auto-linked on signup. A dashboard-wide event fires so banners re-read the stage.

## B. Scoring and stage logic

`scoreQuiz()` sums the six scores, divides by six, rounds to nearest. Thresholds are therefore: avg < 1.5 → Stage 1, < 2.5 → Stage 2, < 3.5 → Stage 3, else Stage 4. No weighting, no per-question override, no confidence measure. A single extreme answer cannot move the stage.

| Stage | Internal name | Family-facing badge | Headline theme |
|---|---|---|---|
| 1 | Entry | "Just starting" | keep it simple, just get support in place |
| 2 | Settling | "Building trust" | consistency and comfort, not big changes |
| 3 | Readiness | "Ready to expand" | introduce structure beyond the basics |
| 4 | Optimization | "Lifting the daily load" | errands, supplies, restocking |

## C. What each stage changes today

- Result screen and dashboard card show stage-specific copy and three CTAs (Stage 1 matching/story/TAV; Stage 2 care team/routine/scheduling; Stage 3 Guided Home Reset/coordination/payroll; Stage 4 recurring supply delivery/errands/care manager).
- `CareEnvironmentJourneyStepContent` hides the home-environment step entirely when stage < 3 and the step isn't mandatory.
- `FamilyDashboard` shows the quiz banner only when no stage is set, and a supply nudge only at stage 4.
- `EnhancedFamilyNextStepsPanel` swaps its headline tone per stage.
- Nothing else: no effect on messaging cadence, matching, pricing, admin warnings, or onboarding gating.

## D. Mapping against the Transtheoretical Model

| Question | What it actually measures | TTM fit |
|---|---|---|
| Q1 feeling | emotional load | weak Contemplation proxy |
| Q2 hardest | problem focus | none (topic, not stage) |
| Q3 comfort in home | external-care comfort | Contemplation → Preparation, the strongest TTM item |
| Q4 home | environment awareness | Preparation-flavoured |
| Q5 support type | service appetite | Action/Maintenance proxy |
| Q6 priority | motivation anchor | none |

Captured reasonably: Contemplation and a soft Preparation. Weak or missing: Precontemplation (no question can express "I'm not there yet"), Action versus Maintenance (indistinguishable — both land on 4 via service appetite, not care status), and relapse/recycling (no question about a prior arrangement at all).

**Verdict on the 4-stage model:** the current stages are an *escalation ladder toward more Tavara services*, not a readiness model. They read as "how much can we sell" rather than "how ready is this family." The proposed family-facing set — Just Beginning / Considering Support / Getting Ready / Care in Motion / Established Care — is five, and it does not map onto the existing four without redefinition, because today's Stage 4 means "buys errands," not "care established." A hybrid is the right call: five journey stages plus a separate returning-after-failure flag rather than a sixth stage, since relapse is a history fact, not a position on the ladder. Maintenance is genuinely relevant — those families need coordination and admin, not education.

## E. Stress test: the case we learned from

Would have caught something: Q3 (comfort in home) is the only question that touches trust, and Q4 touches home change. Both would likely have scored low.

Would have missed entirely: information capacity, communication cadence and overwhelm, platform comfort, financial sensitivity, prior-experience history, and consent pacing for new recommendations.

The classification failure is structural. Averaging pulls a low-trust, low-change-readiness family upward whenever their service appetite is high — and a family urgently arranging care answers Q1 and Q5 high by definition. The result reads "Stage 3/4, ready to expand," which unlocks home-environment recommendations and add-on nudges precisely for the family least ready to hear them. Urgency and readiness are conflated in Q1, Q2 and Q5, all three of which reward pressure with a higher stage.

## F. The form-completeness gate — full logic

`FamilyReadinessChecker.tsx` + `src/hooks/family/completionCheckers.ts` + `FamilyReadinessModal.tsx`, mounted once inside `FamilyDashboard`.

Three checks, from three fetches (`profiles` via `get_user_profile_secure`, `care_needs_family` by `profile_id`, `care_recipient_profiles` by `user_id`):

1. **Registration** — mandatory. Requires all of `full_name`, `phone_number`, `address`, `care_recipient_name`, `relationship`, plus at least one of `care_types`, `care_schedule`, `budget_preferences`, `caregiver_type`.
2. **Care assessment** — mandatory. Requires a `care_needs_family` row with an id and either `care_recipient_name` or `primary_contact_name`. Existence, not depth: 51 columns, only these are checked.
3. **Story** — optional, labelled "Optional", never blocks.

Emergency contacts and medication detail are not part of the gate at all.

**Plain-English path:** dashboard loads → fetch three records → if registration and assessment both pass, render caregiver matches; otherwise render a modal titled "Unlock Caregiver Matches" listing the three items with Complete/Edit buttons, footer "Complete the required steps to access our caregiver matching system." The modal is dismissible, so nothing is hard-locked; it simply returns on next load. No percentage is calculated. There is no admin override. It does not affect onboarding progression or the matching algorithm itself — only whether the family sees matches on their dashboard. On fetch error it fails closed to the modal.

## G. Recommendation: keep them separate

Yes — separate, and rename. They share nothing but a word: different inputs (form fields vs self-reported feeling), different consumers, different failure modes. Architecturally they're already independent, so separating is a naming and boundary exercise, not a refactor.

Suggested internal naming (not applied):

- Form gate → `CareIntakeCompleteness` for the checkers, `MatchAccessGate` for the component, `getIntakeCompleteness()` for the status function. "Unlock Caregiver Matches" copy already describes it honestly.
- Reserve `FamilyReadiness` / `CareJourneyReadiness` strictly for the behavioural system.

## H. Proposed replacement quiz (7 questions, not built)

Q1 Care journey experience — first time arranging care / researched but never arranged / arranged an individual caregiver before / used an agency before / replacing someone now / care working, need coordination only.
Q2 Readiness for outside care — not comfortable yet / uncertain but considering / preparing / ready / already managing care day to day.
Q3 Prior experience (conditional, only after Q1 = previous/replacing) — unreliable / poor fit / agency problem / cost / communication / trust or safety / needs changed / other, plus optional text.
Q4 Information capacity — "How would you like us to guide you right now?" just what I need today / gradually, one step at a time / show options, I'll decide / full picture, ready to move.
Q5 Communication cadence — urgent only / one summary a day / a few updates a week / detail as it happens; plus preferred time window and channel.
Q6 Privacy and trust — comfort with caregiver in home, a backup caregiver, additional professionals, sharing household information (single grid, four rows).
Q7 Home change readiness — no changes now / very small only / open to recommendations / ready to make practical changes.

Cost handled inside Q4's family: "How should we approach cost recommendations?" essentials unless I ask / lower-cost first / recommended with pricing / all options including premium.

## I. Proposed scoring model

Drop the single average. Each dimension scores independently and is stored as its own label, then one journey stage is derived from Q1 and Q2 only — never from service appetite. Low trust or low information capacity caps what the product surfaces regardless of stage. That single change is what prevents the misclassification in section E.

Derived profile: Care Journey (First-time / Researching / Previously arranged / Replacing / Established), Journey Stage (Just Beginning / Considering Support / Getting Ready / Care in Motion / Established Care, mapped internally to TTM), Returning-after-failure flag, Information Capacity (Essentials / Gradual / Full), Communication Intensity (Low / Standard / High), Trust and Privacy (Low / Med / High), Home Change Readiness, Financial Sensitivity, Platform Comfort (observed from actual dashboard usage rather than asked).

## J. What Tavara does differently per signal

Low information capacity: one action at a time, short dashboard summaries, no stacked recommendations, fewer WhatsApp messages. High privacy sensitivity: no backup caregiver or extra provider introduced without explicit approval, ask before suggesting home changes, lead with consent and pacing. First-time family: definitions, employer and NIS explanation, no assumed vocabulary. Replacing failed care: ask what failed, lead with reliability, continuity and backup plan. Established care: skip education, go straight to coordination, payroll and scheduling. Coordinator view carries a plain warning line, e.g. "Low information capacity — introduce one action at a time."

## K. Can the architecture drive this? Yes, with one addition

Already possible today: hiding or showing dashboard sections and journey steps by stage (the home-environment step already does exactly this), swapping copy and CTA sets per stage, and gating add-on nudges.

Needs building: a single readiness profile record (jsonb on `profiles`, plus typed columns for journey stage and information capacity so they're queryable), a small hook that any component can read, admin surfacing of the profile with the coordinator warning, and cadence rules applied where nudges are composed. Notification cadence and message length are the only items with no current hook at all — the nudge templates are static today.

One structural caution: there are two competing journey-step systems (a hardcoded array in `useEnhancedJourneyProgress.ts` and the `journey_steps` tables used only by admin). If readiness ever branches the journey, that has to be settled on the database version first.

## Minimum changes to extend rather than rebuild

1. Add the readiness profile columns; keep `client_stage` populated for backward compatibility with existing banners.
2. Extend the existing quiz file and page rather than creating a parallel quiz; the page, progress-saving, resume, retake, reflection and anonymous lead capture all work and are reusable as-is.
3. Replace `scoreQuiz()` with per-dimension scoring plus a stage derivation that ignores service appetite.
4. Rename the form gate's internals for clarity; no behaviour change.
5. Surface the profile in the admin user view.
6. Place the quiz right after registration, as agreed, keeping the anonymous version live for pre-signup capture.
