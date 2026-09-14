# Family Readiness — Final Specification (Revised)

This is the pacing layer. Three separate systems, never merged:

- **Care Needs Assessment** — what the loved one needs (clinical).
- **Care Intake Completeness** — do we have enough required information to proceed?
- **Family Readiness** — how should Tavara carry this family through the transition?

Readiness is never one averaged score. Every dimension is stored and acted on independently, and every dimension can be updated later without retaking the quiz.

All eight corrections are incorporated: journey split from prior experience, platform comfort split into preference and observed engagement, revised privacy wording, neutral pacing flag, cost as a literal presentation instruction, consent checkpoints preserved, readiness reassessable with history, intake gate kept fully separate.

---

## A. Final Questions and Conditional Logic

Intro: **"Help us understand where you are, so we can pace this right for you."** Sub-line: "A few short questions. No wrong answers, and you can change any of these later." Every question skippable.

**Q1. Where are you right now?** (single select — Current Journey Stage)
- Just beginning to think about care
- Researching my options
- Ready to arrange care
- Actively arranging or replacing care
- Care is already in place

**Q2. Have you arranged outside care before?** (single select — Prior Care Experience)
- No, this is our first time
- Yes, with an individual caregiver
- Yes, through an agency or service
- Yes, we've tried several arrangements

**Q2b. Conditional — shown only when Q2 is not "first time".** *"What brought the last arrangement to an end?"* (select any)
- Didn't show up reliably
- Not the right fit for my loved one
- Problems with the agency or service
- Cost
- Communication was difficult
- I didn't feel I could trust them
- Our needs changed
- Something else

Plus optional free text: *"Anything you'd want us to know?"* (skippable)

**Q3. How does it feel to have someone come into your home to help?** (Readiness for Outside Care)
- Honestly, uncomfortable — I'm not there yet
- Mixed. I know we need help but it's a lot
- I'm okay with it, I want to get it right
- Comfortable — I'm ready
- We're already doing it, it's part of our routine now

**Q4. How would you like us to guide you right now?** (Information Capacity)
- Just what I need for today, nothing more
- One step at a time, gradually
- Show me my options and let me choose
- Give me the full picture, I'm ready to move

**Q5. How often should we check in?** (Communication Preference)
- Only when it's urgent
- One short summary a day
- A few updates during the week
- Keep me posted as things happen

Then **best time to reach you:** Mornings / Afternoons / Evenings / Anytime

**Q6. How would you prefer to manage care and receive information?** (Management Preference — replaces any inferred platform comfort)
- The Tavara dashboard
- WhatsApp
- Email
- Phone
- A combination

**Q7. When care involves people coming into your home, what feels comfortable to you?** (select anything that applies — Trust & Privacy)
- The caregiver we've chosen is fine
- I'd want to approve any backup or stand-in caregiver first
- Please ask me before involving any other professional
- I'd rather keep household details private
- I'm comfortable with all of this

**Q8. If we notice something that could make care easier — routines, safety, how a room is set up — how should we handle it?** (Home Change Readiness)
- No changes right now, please
- Small things only
- Tell me your recommendations and I'll decide
- I'm ready to make practical changes for care

**Q9. How should we approach cost?** (Cost Presentation Preference — stored literally, never converted to a sensitivity level)
- Keep everything to essentials unless I ask
- Show me lower-cost options first
- Show me what you recommend, with the pricing
- Show me everything, including premium support

Nine primary questions (Q1–Q9) plus one conditional (Q2b). No question is dropped to reach a lower count — every one carries an approved dimension. Q1 no longer carries prior experience.

---

## B. Final Stored Dimensions

**Derived / labelled:**
| Dimension | Values | Source |
|---|---|---|
| Current Journey Stage | Exploring / Researching / Preparing / Action / Established | Q1 |
| Prior Care Experience | None / Individual Caregiver / Agency / Multiple Arrangements | Q2 |
| Prior Arrangement End Reasons | multi-select + optional note | Q2b |
| Readiness for Outside Care | Not Yet / Mixed / Willing / Ready / Living It | Q3 |
| Information Capacity | Low / Moderate / High | Q4 |
| Trust & Privacy Sensitivity | High / Moderate / Low | Q7 (count of restrictive selections) |
| Home Change Readiness | Low / Moderate / High | Q8 |
| Observed Platform Engagement | None / Low / Regular / High | behavioural only, never asked |

**Stored as literal preference, not scored:**
| Preference | Values |
|---|---|
| Communication Preference | frequency + time window (Q5) |
| Management Preference | dashboard / WhatsApp / email / phone / combination (Q6) |
| Cost Presentation Preference | essentials only / lower-cost first / recommended with pricing / show everything (Q9) |

There is no "Financial Sensitivity" label anywhere. Q9 is an instruction to obey.

**Discrepancy signal (derived, coordinator-facing only):** Management Preference = dashboard **and** Observed Platform Engagement = None → flag *"Prefers the dashboard but hasn't used it — check whether they need help getting in."* The reverse (prefers WhatsApp, no dashboard use) is expected and raises nothing.

Nothing is averaged across dimensions. Ever.

---

## C. TTM Mapping — Used Where It Belongs

| Question | TTM role |
|---|---|
| Q1 | Primary stage anchor: Precontemplation → Contemplation → Preparation → Action → Maintenance |
| Q3 | Secondary stage evidence — distinguishes genuine Preparation from Action under pressure |
| Q2 / Q2b | Recycling history. A fact about the past, not a position on the ladder |
| Q4 | Not TTM. Personalization |
| Q5 / Q6 | Not TTM. Preferences |
| Q7 | Not TTM. Consent boundary that modifies pacing, not stage |
| Q8 | Weak Preparation signal, treated primarily as a consent boundary |
| Q9 | Not TTM. Presentation instruction |

Stage comes from Q1 and Q3 only — never from service appetite. Maintenance is real and useful: those families need coordination and admin, not education.

---

## D. Protective / Pacing Rules

Constraints override stage. Always.

1. **Information Capacity = Low** → never stack non-urgent recommendations. One action per contact. Short dashboard summaries.
2. **Trust & Privacy = High** → no backup caregiver, additional professional or provider visit introduced without explicit prior approval. Lead with consent.
3. **Home Change Readiness = Low** → suppress home-environment and reset recommendations entirely, unless a genuine safety concern exists — then raise it once, plainly, as a safety matter, not an upsell.
4. **Prior Care Experience = None** → education before assumption. Define terms, explain the employer and NIS side, assume no vocabulary.
5. **Prior Care Experience = Agency or Multiple Arrangements** → ask what ended it before proposing anything; lead with reliability, continuity and backup cover; weight matching toward continuity.
6. **Cost Presentation Preference** → obeyed literally. Only *"keep everything to essentials unless I ask"* suppresses optional recommendations. *"Lower-cost options first"* means ordering, not hiding.
7. **Channel delivery vs understanding** → critical or action-required information must be delivered through the family's selected communication channel(s). A dashboard publication alone is not confirmation that the family has seen or understood it, unless the dashboard is their stated primary management preference **and** observed engagement confirms active use. For "a combination", respect every selected channel and any identified primary channel. Receipt, engagement and understanding remain three separate concepts — only an understanding checkpoint (section F) evidences the third.
8. **Journey Stage = Action or Established with two or more dimensions at their most cautious setting** → flag **PACE SUPPORT REQUIRED**, guidance line: *"Care is in motion. Introduce information and change gradually."* Optional-service surfacing is held until a coordinator clears it.

The example family — Action, Low information capacity, High privacy, Low home change, essentials-only cost, no prior experience — trips rule 8 plus 1, 2, 3, 4 and 6. Care proceeds; every non-essential recommendation is held.

---

## E. Coordinator Snapshot

```text
FAMILY READINESS SNAPSHOT                    updated 12 Sep

Current Journey ........ Action - actively arranging
Prior Care Experience .. None (first time)
Comfort with Care ...... Mixed
Information Capacity ... Low
Communication .......... Urgent only, evenings
Manage via ............. WhatsApp
Privacy ................ High - approve backup, ask before others
Home Change ............ Low
Cost Presentation ...... Essentials unless they ask
Platform Engagement .... None (0 logins, 30 days)

FLAG: PACE SUPPORT REQUIRED
  Care is in motion. Introduce information and change gradually.

COORDINATION GUIDANCE
  - One issue or action per contact
  - No optional or add-on recommendations right now
  - Confirm understanding of any cost before it appears
  - Ask permission before introducing another provider
  - Confirm on WhatsApp - dashboard notices won't be seen
  - Home-change recommendations paused
  - First-time family: explain terms, employer and NIS side

LAST CHECKPOINT: placement confirmation - "I understand, but
I'd like some time" (4 Sep). Not yet followed up.

READINESS HISTORY
  12 Sep  Home Change: Low (2-week check-in)
  28 Aug  Comfort with Care: Mixed -> Mixed (post-placement)
  20 Aug  Initial assessment
```

---

## F. Contextual Reassessment Model

The initial assessment is a starting point, not a verdict. Individual dimensions update through one-question check-ins; the family never retakes the set.

| Trigger | Question | Updates |
|---|---|---|
| 3 days after first placement | "How is having care in the home feeling so far?" | Readiness for Outside Care |
| 2 weeks after placement | "Would you like us to stay focused on your current care, or are you open to recommendations that could make care easier?" | Home Change Readiness |
| After a caregiver change or a coverage gap | "How are you feeling about the change?" | Readiness for Outside Care, Trust & Privacy |
| When a family asks about a service we had suppressed | (no question — the ask itself updates it) | Cost Presentation Preference |
| Any time, from the dashboard | "Update how we should pace things" | any dimension |
| Every 90 days if nothing else fired | "Still pacing this right for you?" | Information Capacity, Communication |

Each update writes a new history entry with the dimension, old value, new value, source and timestamp. Nothing is overwritten silently, so we can see how a family moved rather than guessing.

---

## G. Exact Database Changes

Additive only. No drops, no backfill, no data rewrite.

**1. `profiles` — three columns**
- `family_readiness_profile` jsonb — the current value of every dimension and preference
- `care_journey_stage` text — `exploring | researching | preparing | action | established`
- `information_capacity` text — `low | moderate | high`

`client_stage`, `client_stage_assessed_at` and `client_stage_quiz_responses` are retained and still written, so every existing consumer keeps working. Partial index on `care_journey_stage` for admin filtering.

**2. New table `family_readiness_history`**
- `profile_id` (FK profiles), `dimension` text, `previous_value` text, `new_value` text, `source` text (`initial_quiz | post_placement | two_week | caregiver_change | self_update | periodic`), `notes` text, `created_at`
- Grants: select/insert to `authenticated`, all to `service_role`, no `anon`
- RLS: a family reads and inserts its own rows; admins read all via `has_role(auth.uid(), 'admin')`

**3. New table `family_understanding_checkpoints`**
- `profile_id` (FK profiles), `checkpoint_key` text (e.g. `placement_confirmation`, `first_invoice`, `nis_explanation`, `additional_provider`, `home_recommendation`), `response` text (`ready | needs_time | explain_simply | speak_to_someone`), `context` jsonb, `resolved_at`, `created_at`
- Unique on (`profile_id`, `checkpoint_key`) so a family is never asked twice for the same item
- Grants: select/insert/update to `authenticated`, all to `service_role`
- RLS: family manages its own rows; admins read all

The two `_history` and `_checkpoints` tables are what make readiness a record over time rather than a snapshot.

---

## H. Components and Files That Will Change

**Quiz**
- `src/data/familyReadinessQuiz.ts` — new question set, conditional support, optional text, per-dimension derivation replacing `scoreQuiz()`
- `src/components/family/quiz/QuizQuestionCard.tsx` — multi-select, conditional display, optional free text, skip
- `src/pages/family/FamilyReadinessQuizPage.tsx` — result screen shows the profile, not a single stage; existing progress save, resume, retake and anonymous lead capture kept as-is
- `src/components/family/quiz/QuizResultCard.tsx`, `AnonymousLeadCapture.tsx`, `PreviousAnswersPanel.tsx` — adapted to the profile shape

**New**
- `src/hooks/family/useFamilyReadiness.ts` — reads the profile, returns dimensions plus the rule outcomes from section D
- `src/lib/family/readinessRules.ts` — the rule engine, pure functions, unit-testable
- `src/components/family/readiness/ReadinessCheckIn.tsx` — one-question contextual check-in
- `src/components/family/readiness/UnderstandingCheckpoint.tsx` — the four-option confirmation
- `src/components/admin/family/FamilyReadinessSnapshot.tsx` — the coordinator panel

**Consumers**
- `src/hooks/useFamilyStage.ts` — resolves from the new profile, still falls back to `client_stage` and localStorage
- `src/components/family/Stage4SupplyNudge.tsx`, `CareEnvironmentJourneyStepContent` — gated by rules 3 and 6 instead of raw stage
- Family dashboard density and next-steps panel — gated by Information Capacity
- Admin user detail view — mounts the snapshot
- Nudge composer — cadence, channel and time window from Q5/Q6

**Untouched:** `FamilyRegistration.tsx` fields, all chat flow files, `App.tsx`, navigation, global providers, `FamilyReadinessChecker.tsx` / `completionCheckers.ts` behaviour.

---

## I. Migration and Backward Compatibility

1. All schema changes are additive. Existing rows read and write exactly as they do today.
2. `client_stage` continues to be written on every quiz completion, mapped from Current Journey Stage, so `useFamilyStage` consumers, banners and journey steps keep functioning during and after the change.
3. Old `client_stage_quiz_responses` payloads remain readable as history. They are not rescored — the old scoring is the defect we're removing, so re-deriving from it would carry the defect forward.
4. Families with no readiness profile get the safest defaults: Information Capacity treated as Moderate, Trust & Privacy as High, Home Change Readiness as Low. Absence of data never unlocks a recommendation.
5. The rule engine ships behind the profile's existence, so nothing changes for the 23 families who have never taken the quiz until they answer.
6. Anonymous pre-signup quiz capture and `quiz_leads` linking stay exactly as they are.
7. The intake-gate rename (`CareIntakeCompleteness`, `MatchAccessGate`, `getIntakeCompleteness()`) is a separate, last, no-behaviour-change pass — not bundled with any of the above.

---

## Care Intake Completeness — Kept Separate

Unchanged in scope, scoring and terminology. It reads three tables and answers one question: *do we have the required information to proceed?* It decides only whether caregiver matches render. It shares no field, no score and no vocabulary with Family Readiness.

## Build Order

1. Migration (three columns, two tables)
2. Question set and per-dimension derivation
3. Rule engine plus `useFamilyReadiness`
4. Quiz UI (conditional, multi-select, optional text, skip)
5. Coordinator snapshot in admin
6. Apply rules at the family surfaces
7. Understanding checkpoints at the five decision moments
8. Contextual check-ins and history writing
9. Quiz placed right after registration
10. Intake-gate rename, no behaviour change
