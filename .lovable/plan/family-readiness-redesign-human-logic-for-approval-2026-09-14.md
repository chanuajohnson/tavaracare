# Family Readiness Redesign — Human Logic for Approval

Core principle: readiness is never one averaged score. Each dimension is stored and acted on independently. A family can be actively arranging care and still be fragile about privacy, information load, home changes and cost — those signals must not cancel each other out.

---

## A. The Six Minimum Changes

### 1. Store a readiness profile instead of a single stage
- **Today:** `profiles.client_stage` (1-4), `client_stage_assessed_at`, `client_stage_quiz_responses` (jsonb). One number represents the whole family.
- **Change:** add `family_readiness_profile` jsonb plus two typed, queryable columns: `care_journey_stage` and `information_capacity`. Keep `client_stage` written for backward compatibility.
- **Why:** one number cannot carry eight independent signals, and admin tooling needs to filter on journey stage and information capacity.
- **Affected:** `profiles` table; `src/hooks/useFamilyStage.ts`; anything reading `client_stage`.
- **Data compatibility:** existing rows keep working — `client_stage` stays populated, new fields are null until a family answers.
- **Migration:** yes, additive columns only. No backfill, no drops.

### 2. Extend the existing quiz rather than build a parallel one
- **Today:** `src/data/familyReadinessQuiz.ts` — 6 questions, 4 options, score 1-4 each. `FamilyReadinessQuizPage.tsx` plus `src/components/family/quiz/*` already handle progress saving, resume, retake, reflection text and anonymous lead capture.
- **Change:** replace the question set with the 7-question set in section B, add support for one conditional question and one optional text field.
- **Why:** the page shell, resume logic and lead capture all work. Rebuilding would lose them.
- **Affected:** the quiz data file, `QuizQuestionCard`, the page component.
- **Data compatibility:** old `client_stage_quiz_responses` payloads stay readable as history but are not rescored.
- **Migration:** none.

### 3. Replace `scoreQuiz()` with per-dimension scoring
- **Today:** averages six scores; `< 1.5` → Stage 1, `< 2.5` → 2, `< 3.5` → 3, else 4.
- **Change:** each answer writes one labelled dimension. The single journey stage is derived only from the care-journey and comfort questions — never from service appetite.
- **Why:** averaging is the actual defect. It lets high service appetite pull a low-trust family up to "ready to expand".
- **Affected:** `familyReadinessQuiz.ts` scoring function; `useFamilyStage.ts`; `Stage4SupplyNudge`; `CareEnvironmentJourneyStepContent`.
- **Migration:** none.

### 4. Rename the form-completeness gate internals (clarity only)
- **Today:** `FamilyReadinessChecker.tsx` + `completionCheckers.ts` (`getFamilyReadinessStatus`) decide only whether caregiver matches render.
- **Change:** `CareIntakeCompleteness` (checkers), `MatchAccessGate` (component), `getIntakeCompleteness()` (status). Behaviour unchanged.
- **Why:** two unrelated systems both called "readiness" is the root of the confusion.
- **Affected:** those two files plus the single mount in `FamilyDashboard`.
- **Migration:** none. No database involvement.

### 5. Surface the profile to coordinators
- **Today:** nothing shows readiness anywhere in admin.
- **Change:** a readiness snapshot panel in the admin user view (section G) plus the guidance lines, and cadence hints where nudges are composed.
- **Why:** the profile is only worth collecting if it changes how Chan opens a conversation.
- **Affected:** admin user detail view, nudge composer.
- **Migration:** none.

### 6. Place the quiz right after registration
- **Today:** a side banner on the dashboard. 1 of 24 families has ever completed it.
- **Change:** the quiz becomes the step immediately after family registration, skippable, resumable. The anonymous pre-signup version stays live and continues linking via `quiz_leads`.
- **Why:** no profile means no pacing. Placement is the whole adoption problem.
- **Affected:** post-registration navigation only. `FamilyRegistration.tsx` fields untouched.
- **Migration:** none.

---

## B. Final Family-Facing Quiz

Intro screen: **"Help us understand where you are, so we can pace this right for you."** Sub-line: "Seven quick questions. No wrong answers, and you can change these anytime."

**Q1. Where are you in arranging care right now?**
- I'm just starting to think about it
- I've been looking into options but haven't arranged anything
- I'm arranging care for the first time
- We had a caregiver before and need to replace them
- We used an agency or service before and are trying a different way
- We've tried a few arrangements and none have stuck
- We already have care working — we mainly need help coordinating it

**Q2. How does it feel to have someone come into your home to help?**
- Honestly, uncomfortable — I'm not there yet
- Mixed. I know we need help but it's a lot
- I'm okay with it, I want to get it right
- Comfortable — I'm ready
- We're already doing it, it's part of our routine now

**Q3. How would you like us to guide you right now?**
- Just what I need for today, nothing more
- One step at a time, gradually
- Show me my options and let me choose
- Give me the full picture, I'm ready to move

**Q4. How often should we check in, and where?**
Frequency: Only when it's urgent / One short summary a day / A few updates during the week / Keep me posted as things happen
Then: **Best time to reach you?** Mornings / Afternoons / Evenings / Anytime
And: **Where?** WhatsApp / Phone call / Email / In the dashboard

**Q5. How do you feel about people coming into your home?** (select what's true)
- A caregiver in the home is fine
- I'd want to approve any backup or stand-in caregiver first
- Please ask me before involving any other professional
- I'd rather keep household details private
- I'm comfortable with all of this

**Q6. If we notice something that could make care easier — routines, safety, how a room is set up — how should we handle it?**
- No changes right now, please
- Small things only
- Tell me your recommendations and I'll decide
- I'm ready to make practical changes for care

**Q7. How should we approach cost?**
- Keep everything to essentials unless I ask
- Show me lower-cost options first
- Show me what you recommend, with the pricing
- Show me everything, including premium support

**Q3b (conditional — only if Q1 = replaced caregiver / left an agency / tried a few).** *"What made the last arrangement not work?"* Select any: Didn't show up reliably / Not the right fit for my loved one / Problems with the agency or service / Cost / Communication was difficult / I didn't feel I could trust them / Our needs changed / Something else. Plus optional: *"Anything you'd want us to know?"* (free text, skippable)

Every question is skippable. No question is scored against the family.

---

## C. TTM Mapping — Used Where It Fits

| Question | TTM role |
|---|---|
| Q1 | Primary stage anchor: Precontemplation → Contemplation → Preparation → Action → Maintenance, plus a relapse/recycling signal for the replacement answers |
| Q2 | Secondary stage evidence: emotional readiness for the behaviour, distinguishes genuine Preparation from Action-under-pressure |
| Q3b | Recycling detail: why the previous attempt failed |
| Q3 | **Not TTM.** Personalization signal (information capacity) |
| Q4 | **Not TTM.** Preference (channel, cadence, timing) |
| Q5 | **Not TTM.** Constraint that modifies pacing and consent, not stage |
| Q6 | Weak Preparation signal, but treated primarily as a consent boundary |
| Q7 | **Not TTM.** Constraint/preference. Never inferred as readiness or income |

Stage is derived from Q1 and Q2 only. Relapse is stored as a flag on history, not a position on the ladder — a family replacing a third caregiver may be firmly in Action while being emotionally raw. Maintenance is real and useful: those families need coordination and admin, not education.

---

## D. Per-Dimension Model

**Scored / derived:**
- **Care Journey** — First Time / Researching / Previously Used Care / Replacing Failed Care / Existing Care (from Q1)
- **Care-Action Stage** — Exploring / Considering / Preparing / Action / Established (Q1 + Q2 only)
- **Information Capacity** — Low / Moderate / High (Q3)
- **Trust & Privacy Sensitivity** — High / Moderate / Low (Q5, count of restrictive selections)
- **Home Change Readiness** — Low / Moderate / High (Q6)
- **Prior Care Experience** — None / Informal / Individual Caregiver / Agency / Multiple Arrangements (Q1 + Q3b)
- **Platform Comfort** — Low / Moderate / High. **Not asked.** Observed from actual dashboard logins and interactions. Self-report is unreliable here, and a family with low comfort will not tell us so in a web form.

**Stored as preference, not scored:**
- **Communication Intensity** + time window + channel (Q4). It is a stated instruction to obey, not a level to score.
- **Financial Sensitivity** (Q7). Stored as a presentation preference — "essentials first", "recommended with pricing" — never as a judgement about means.

Nothing is ever averaged across dimensions.

---

## E. Decision / Protective Rules

Constraints override stage. Always.

1. **Information Capacity = Low** → never stack non-urgent recommendations. One action at a time. Short dashboard summaries. Cap non-urgent messages to the stated cadence.
2. **Trust & Privacy = High** → no backup caregiver, additional professional or provider visit introduced without explicit prior approval. Lead with consent and pacing.
3. **Home Change Readiness = Low** → suppress home-environment and reset recommendations entirely, unless a genuine safety risk exists — then raise it as a safety matter, once, plainly, not as an upsell.
4. **Care Journey = First Time** → education before assumption. Define terms. Explain the employer/NIS side. No assumed vocabulary.
5. **Care Journey = Replacing Failed Care** → ask what failed before proposing anything. Lead with reliability, continuity and the backup plan. Weight matching toward continuity.
6. **Financial Sensitivity = High** → essentials first, required and optional costs clearly separated, no bundled totals.
7. **Platform Comfort = Low** → a dashboard notice is never evidence of receipt. Confirm on the family's chosen channel.
8. **Care-Action = Action or Established with any two constraints at their most cautious setting** → flag as **"Care in motion, transition readiness fragile — move slowly."** No optional-service surfacing at all until a coordinator clears it.

The example family in the request — Action, Low information capacity, High privacy, Low home change, High financial sensitivity, no prior experience — trips rule 8 plus rules 1, 2, 3, 4, 6. Care proceeds; every non-essential recommendation is held.

---

## F. Understanding and Consent Checkpoints

Clicking accept, paying, or proceeding with a placement is not evidence of understanding. A single lightweight check, used sparingly:

> **Before we continue, which best describes you?**
> - I understand this and I'm ready to proceed
> - I understand, but I'd like some time
> - I'd like this explained more simply
> - I'd prefer to speak with someone first

**Warranted at:** first caregiver placement confirmation; the first invoice or any change to what a family pays; the employer/NIS responsibility explanation; introducing an additional person into the home; any recommendation involving the physical home. Also shown once when a family's profile trips rule 8.

**Not warranted at:** routine daily updates, scheduling views, log viewing, anything a family initiated themselves, or repeat visits to a screen already confirmed. Never twice for the same item.

Answers 3 and 4 raise a coordinator task rather than blocking the family.

---

## G. Coordinator Snapshot

```text
FAMILY READINESS SNAPSHOT                    updated 12 Sep

Care Journey ......... First-time care
Care Action Stage .... Action
Information Capacity . Low
Communication ........ Gradual - WhatsApp, evenings
Privacy Sensitivity .. High
Home Change .......... Low
Financial Sensitivity  High
Platform Comfort ..... Low  (2 logins in 30 days)

FLAG: Care in motion, transition readiness fragile - move slowly

COORDINATION GUIDANCE
  - One issue or action per contact
  - No add-on or optional service recommendations
  - Confirm understanding of any cost before it appears
  - Ask permission before introducing another provider
  - Do not rely on dashboard notices - confirm on WhatsApp
  - Home-change recommendations paused

LAST CHECKPOINT: placement confirmation - "I understand, but
I'd like some time" (4 Sep). Not yet followed up.
```

---

## H. Family Experience by Profile

- **Onboarding** — First Time gets definitions and one step per screen; Established skips straight to coordination, payroll and scheduling.
- **Education** — automatic for First Time and Researching; suppressed for Established.
- **Matching** — Replacing Failed Care weights continuity, reliability and backup cover, and the failure reasons from Q3b feed the caregiver brief.
- **Dashboard** — Low information capacity sees a single next action and a short summary; High sees the full picture.
- **WhatsApp** — frequency, time window and channel come straight from Q4 and are obeyed, not overridden by campaign logic.
- **Recommendations** — never stacked at Low capacity; nothing optional surfaces under rule 8.
- **Optional services** — gated on Financial Sensitivity and stage. High sensitivity sees essentials only until they ask.
- **Home readiness** — hidden at Low home-change readiness, except a plain one-time safety note.
- **Billing** — First Time gets the employer/NIS explanation; High financial sensitivity gets required and optional split out line by line.
- **Follow-up cadence** — driven by Q4, tightened only when a checkpoint answer asks for time or a conversation.

---

## I. Form-Completeness Gate

Keep it fully separate. No technical reason to merge — it reads three tables and answers one question: *do we have the information required to proceed?* The readiness profile answers a different question: *how should Tavara proceed with this family?*

Recommended name: **CareIntakeCompleteness** for the checkers, **MatchAccessGate** for the component, **getIntakeCompleteness()** for the status function. Not renaming yet.

---

## J. Stress Test

**A. First-time overwhelmed daughter, urgent.** Q1 first time arranging, Q2 mixed, Q3 just today, Q4 urgent only / evenings / WhatsApp, Q5 restrictive, Q6 no changes, Q7 essentials. → First Time / Action / Low / High privacy / Low home change / High financial. Trips rule 8. **Show:** the caregiver match, the one next action, plain-language cost of what she is committing to. **Hold:** supplies, home reset, training content, everything optional.

**B. Replacing a third unreliable caregiver.** Q1 tried a few, Q2 comfortable, Q3b unreliable + trust, Q3 options and I'll choose, Q6 recommendations welcome. → Multiple Arrangements / Action / Moderate / relapse flag. **Show:** reliability and backup-cover story, continuity-weighted matches, coverage process. **Hold:** basic education, and any pitch that sounds like the last one.

**C. Leaving an agency after a poor experience.** Q1 used an agency, Q3b agency problems + communication, Q2 okay, Q5 wants to approve stand-ins. → Agency / Preparing-to-Action / High privacy. **Show:** how direct engagement differs from an agency, who exactly comes to the home, communication commitments. **Hold:** add-ons; approvals for any new person are explicit.

**D. Caregiver already working, wants coordination only.** Q1 already have care, Q2 part of our routine, Q3 full picture, Q6 recommendations welcome, Q7 recommended with pricing. → Existing Care / Established / High capacity. **Show:** payroll, scheduling, logs, NIS, backup cover. **Hold:** all introductory education and matching flows.

**E. Researching six months ahead.** Q1 looking into options, Q2 mixed, Q3 gradually, Q4 a few a week. → Researching / Considering / Moderate. **Show:** education, what care looks like, indicative rates, no pressure. **Hold:** matching, placement, invoices, anything time-pressured.

---

## K. Implementation Plan (not executed)

1. Additive migration on `profiles`: `family_readiness_profile` jsonb, `care_journey_stage` text, `information_capacity` text. `client_stage` retained and still written.
2. Rewrite the question set in `src/data/familyReadinessQuiz.ts`; add conditional-question and optional-text support to `QuizQuestionCard`.
3. Replace `scoreQuiz()` with per-dimension derivation plus stage derivation from Q1+Q2; write both the profile and `client_stage`.
4. Add a `useFamilyReadiness()` hook exposing the profile and the rule outcomes from section E; point existing `client_stage` consumers at it.
5. Apply rules at the surfaces named in section H — dashboard density, nudge cadence, optional-service gating, home-environment suppression.
6. Add the coordinator snapshot panel to the admin user view and the cadence hints to the nudge composer.
7. Add the consent checkpoint component and mount it only at the moments listed in section F.
8. Move the quiz to immediately after registration, keeping the anonymous pre-signup path and `quiz_leads` linking intact.
9. Rename the form-gate internals last, as a no-behaviour-change pass.

Not touched: `FamilyRegistration.tsx` fields, the chat flow files, `App.tsx`, navigation, global providers. If readiness ever branches the journey itself, the two competing journey-step systems must be reconciled onto the database version first — out of scope here.
