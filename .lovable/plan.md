# Family Readiness — Manual QA Walkthrough (current build only)

No code changes in this document. Checkpoints, contextual check-ins and the nudge composer are deliberately left unmounted.

Status key used throughout:
- **WORKS NOW** — implemented and reachable in the app
- **BUILT, NOT MOUNTED** — component exists, nothing renders it yet
- **NOT IMPLEMENTED** — not built

---

## 1. TEST SETUP

Account type: a **family** account, plus a separate **admin** login for the coordinator half.

Use a **brand-new family account**. Existing test families already carry legacy quiz data and half-finished intake, which makes the redirect and resume tests unreliable.

Clear before starting (browser console on the app origin):

```js
localStorage.removeItem('tavara_readiness_profile');
localStorage.removeItem('tavara_readiness_assessment_progress');
localStorage.removeItem('tavara_family_readiness_stage');
```

### chanuajohnson4@gmail.com — checked, and it needs fixing before you test

That address is in a half-deleted state. The login still exists (created 14 Sep, last signed in 14 Sep, id `d547fa30-…`) but its **profile record is gone**. Everything readiness-related is genuinely null: no readiness profile, no journey stage, no information capacity, no history rows, no checkpoints, no care needs, no loved one's story, no caregiver matches, no quiz lead.

The problem is the missing profile record, not leftover data. Signing in with it will land you in an account with nothing to write to, so registration and the readiness save will misbehave for reasons that have nothing to do with this build. Two clean options:

- Delete the login fully in admin user management, then sign up again with the same address (cleanest, and it exercises the real registration path).
- Or use a different fresh address, e.g. chanuajohnson5@gmail.com.

Either way, clear the three localStorage keys above first, because that browser may still hold the earlier run.

Expected profile state before starting, for a fresh family:
- `family_readiness_profile` = null
- `care_journey_stage` = null
- `information_capacity` = null
- `client_stage` = null
- no rows in `family_readiness_history`

Routes to know:
- `/registration/family` — family registration form
- `/family/readiness-quiz` — the assessment
- `/family/readiness-quiz?from=registration` — post-registration entry
- `/family/readiness-quiz?retake=1` — forced fresh start
- `/family/readiness-quiz?view=result` — result view only
- `/dashboard/family` — family dashboard
- `/dashboard/admin` → user list → open the family → readiness snapshot

Browser notes:
- Progress and the cached profile live in localStorage, so a private window behaves like a first-time visitor. Use that to test the anonymous path.
- Stored progress expires after 30 days.
- Signing out does not clear progress; the resume prompt is localStorage-driven, not account-driven.

---

## 2. FAMILY REGISTRATION → READINESS REDIRECT — WORKS NOW

1. Sign up as a new family user.
2. Complete `/registration/family` — first/last name, phone, address, care recipient name, relationship are required.
3. Submit.

Expected: you land on `/family/readiness-quiz?from=registration`, **not** the dashboard. You should see the header "Help us understand where you are", a line saying "Thanks for registering. This is the last step, and you can skip any question", progress dots, and Question 1 of 9.

---

## 3. THE FULL ASSESSMENT — WORKS NOW

Nine primary questions, plus Q2b when it applies. Every question has a **Skip this** button. Plain single-select questions auto-advance about a quarter-second after you tap. Multi-select, the free-text card and the card with an on-card follow-up require **Continue**.

| # | Question | Type | Behaviour |
|---|---|---|---|
| Q1 | "Where are you right now?" — 5 options from just beginning to care already in place | single | auto-advance; stores journey stage |
| Q2 | "Have you arranged outside care before?" — first time / individual caregiver / agency / several arrangements | single | auto-advance; controls whether Q2b appears |
| Q2b | "What brought the last arrangement to an end?" — 8 options plus an optional free-text box | multi + free text | conditional; needs Continue; Continue stays disabled until at least one option is picked |
| Q3 | "How does it feel to have someone come into your home to help?" — 5 options | single | auto-advance |
| Q4 | "How would you like us to guide you right now?" — today only / gradually / my options / full picture | single | auto-advance; maps to low / moderate / moderate / high information capacity |
| Q5 | "How often should we check in?" plus "Best time to reach you?" pills | single + on-card follow-up | needs Continue; the time pills appear only after a cadence is chosen |
| Q6 | "How would you prefer to manage care and receive information?" — dashboard / WhatsApp / email / phone / combination | single | auto-advance |
| Q7 | "When care involves people coming into your home, what feels comfortable to you?" — 5 boundary options | multi | needs Continue |
| Q8 | "If we notice something that could make care easier…" — no changes / small things only / recommendations / ready for changes | single | auto-advance |
| Q9 | "How should we approach cost?" — essentials / lower-cost first / recommended with pricing / everything | single | auto-advance |

Saving: every tap writes progress to localStorage immediately. The full profile is written to the database only after the **last** visible question. On save you should see "Thank you. We'll pace things the way you asked."

Result screen caveat — **partially implemented.** The result screen still shows the old four-stage narrative card (derived from Q1 alone, never averaged). It does **not** yet list the per-dimension profile back to the family, and the "See my answers" panel is legacy-numeric so it will look empty for the new answers. The stored data is correct; only the family-facing presentation is legacy.

---

## 4. SKIP BEHAVIOUR — WORKS NOW

1. Skip Q4 only, answer everything else, finish.
   Expect: `information_capacity` absent from `family_readiness_profile`, and `q4_information_capacity` listed in the profile's `skipped` array. The admin snapshot shows "Moderate" as a **cautious default**, not as an answer.
2. Skip Q4, Q7, Q8, Q9.
   Expect: none of those keys present; `skipped` lists all four; admin defaults show moderate information, high privacy, low home change, "recommended with pricing".
3. Skipping Q2 means Q2b never appears at all, so the visible total drops to 9.

Nothing is inferred from a skip. The cautious defaults live in the rule engine only and are never written into the profile as if the family had said them.

---

## 5. CONDITIONAL Q2b — WORKS NOW

Case A — Q2 = "No, this is our first time". Q2b must not appear. Total stays 9. Q3 comes next.

Case B — Q2 = individual caregiver, agency, or several arrangements. Q2b appears immediately as question 3 of 10.

Verify on Case B:
- multi-select: tap several reasons, each shows a tick, tapping again removes it
- free text: type in "Anything you'd want us to know?"; leaving it blank is fine
- storage: reasons land in `prior_arrangement_end_reasons`, the text in `prior_arrangement_note`, and both appear under "Previous care experience" in the admin snapshot as "Ended because: …"

Edge case to confirm: go back to Q2 and switch to "first time" — Q2b disappears, but a previously saved reason list stays in the raw answers. Worth flagging if you consider that wrong.

---

## 6. RESUME / PROGRESS — WORKS NOW

1. Answer Q1 to Q4, then navigate away (dashboard, or close the tab).
2. Return to `/family/readiness-quiz`.

Expect a panel: "Pick up where you left off?" with the count of questions answered, and Continue / Start over. Continue restores answers, free text and position. Start over clears them.

What persists: answers, current position, free text, timestamp — all in localStorage under `tavara_readiness_assessment_progress`. **Nothing partial is written to the database**, so signing out on another device loses the partial run. That is current behaviour, not a bug to fix in this round.

---

## 7. RETAKE — WORKS NOW

1. Complete the assessment.
2. Return to `/family/readiness-quiz` — you land straight on the result.
3. Choose retake. You should be sent to `?retake=1` with a clean first question and no resume prompt.
4. Change several answers and finish.

Expect: `family_readiness_profile` replaced with the new values and a fresh `assessed_at`; one row in `family_readiness_history` for **each dimension that actually changed**, with previous and new value; `care_journey_stage`, `information_capacity` and `client_stage` re-written; the legacy `client_stage_quiz_responses` payload from any older run remains readable.

Note: retake clears the previous stage first, so if the save then fails you would be left without a stage. Watch for the error toast.

---

## 8. PER-DIMENSION PROFILE — high-caution answer set — WORKS NOW

Answer exactly:

- Q1: Actively arranging or replacing care
- Q2: No, this is our first time (so no Q2b)
- Q3: Mixed. I know we need help but it's a lot
- Q4: Just what I need for today, nothing more
- Q5: Only when it's urgent → Evenings
- Q6: WhatsApp
- Q7: Approve backup first **and** Ask before involving others **and** Keep household details private
- Q8: No changes right now, please
- Q9: Keep everything to essentials unless I ask

Stored profile should read:

```json
{
  "version": 2,
  "current_journey_stage": "action",
  "prior_care_experience": "none",
  "outside_care_comfort": "mixed",
  "information_capacity": "low",
  "communication_frequency": "urgent_only",
  "communication_window": "evenings",
  "management_preference": "whatsapp",
  "trust_privacy_sensitivity": "high",
  "privacy_selections": ["approve_backup", "ask_before_others", "keep_household_private"],
  "home_change_readiness": "low",
  "cost_presentation_preference": "essentials_only",
  "skipped": []
}
```

Also: `care_journey_stage` = "action", `information_capacity` = "low", `client_stage` = 3 (backward compatibility only, from Q1 alone). No total, no average, no single readiness number anywhere.

---

## 9. PACE SUPPORT REQUIRED — WORKS NOW (admin snapshot only)

Why it triggers on the set above: the family is in motion (action or established) **and** at least two cautious dimensions are present. Here there are five — low information capacity, high privacy, low home change, essentials-only cost, mixed comfort.

Where you see it: the amber "PACE SUPPORT REQUIRED" badge at the top right of the readiness snapshot in the admin user detail view.

The wording "Care is in motion. Introduce information and change gradually." exists in the rule engine and is available to consumers, but the snapshot currently renders only the badge — the sentence itself is **BUILT, NOT MOUNTED**.

Guidance lines you should see for that profile:
- One issue or action per contact
- Keep dashboard summaries short
- No optional or add-on recommendations right now
- Essentials only until they ask about more
- Ask permission before introducing another provider
- Approve any backup or stand-in caregiver with them first
- Keep household details out of wider notes
- Home-change recommendations paused
- First-time family: explain terms, employer and NIS side
- Confirm on whatsapp — a dashboard notice is not confirmation

---

## 10. ESTABLISHED / NON-CAUTIOUS FAMILY — WORKS NOW

- Q1: Care is already in place
- Q2: Yes, with an individual caregiver → Q2b appears; pick "Our needs changed"
- Q3: We're already doing it, it's part of our routine now
- Q4: Give me the full picture, I'm ready to move
- Q5: A few updates during the week → Anytime
- Q6: A combination
- Q7: I'm comfortable with all of this (only that one)
- Q8: I'm ready to make practical changes for care
- Q9: Show me what you recommend, with the pricing

Expect: journey "Care already in place", information capacity high (up to 4 non-urgent recommendations), privacy Low, home change High with "Home suggestions may be shared", cost "Recommended, with pricing", channels dashboard / WhatsApp / email / phone, **no PACE SUPPORT REQUIRED badge**, and a much shorter guidance list — the continuity line plus the confirmation-channel line.

---

## 11. PRIVACY / TRUST — WORKS NOW

Answer Q7 with: chosen caregiver is fine **plus** approve backup **plus** ask before others **plus** keep household private.

Storage: all four IDs stored literally in `privacy_selections`. Derived level = **High**, because three restrictive selections were made (two or more gives high, exactly one gives moderate).

Admin guidance should show: ask permission before introducing another provider; approve any backup or stand-in caregiver with them first; keep household details out of wider notes. Selecting "I'm comfortable with all of this" on its own gives Low and drops the approval requirements.

---

## 12. HOME CHANGE READINESS — mapping WORKS NOW, downstream gating NOT IMPLEMENTED

Q8 mapping:
- No changes right now → **Low**
- Small things only → **Moderate**
- Tell me your recommendations and I'll decide → **Moderate**
- Ready to make practical changes → **High**

Low suppresses home-environment recommendations in the rule engine, and the snapshot note reflects that. Being explicit: the home preparation / reset content on the family dashboard and journey does **not yet read this flag**, so nothing is actually hidden from the family today. That connection is not implemented.

---

## 13. COST PRESENTATION — stored literally WORKS NOW, suppression NOT IMPLEMENTED

All four Q9 options store verbatim in `cost_presentation_preference`. No sensitivity or affordability label is derived anywhere — confirm that by searching the stored profile for any such field; there is none.

- "essentials_only" sets an internal "do not show optional add-on services" decision and the snapshot note. No family-facing surface consumes it yet.
- "lower_cost_first" sets a reorder decision plus the guidance "Lead with lower-cost options, but do not hide the others". Actual reordering of any pricing surface is not implemented.

---

## 14. MANAGEMENT PREFERENCE VS PLATFORM ENGAGEMENT — partially implemented

Case A — Q6 = dashboard, brand-new account with no tracked activity. Expect the internal note: "Prefers the dashboard but hasn't used it — check whether they need help getting in."

Case B — Q6 = WhatsApp, no dashboard use. Expect **no** discrepancy. Preferring WhatsApp and not using the dashboard is consistent, not a problem.

Where engagement comes from: a 30-day count of that user's rows in `cta_engagement_tracking`, bucketed into none / low / regular / high. It is a rough behavioural signal, it is not dashboard-specific, and it is never treated as stated comfort. The bucket itself is **not displayed** in the snapshot yet — only its effect on the discrepancy note.

---

## 15. ADMIN READINESS SNAPSHOT — WORKS NOW

Sign in as admin → `/dashboard/admin` → user management → open the test family. The snapshot renders inside the user detail dialog, for family-role users only, below the care needs card and above the matching status toggle.

Fields shown: where they are now; previous care experience (with "Ended because…" when Q2b was answered); comfort with outside help; information capacity plus the recommendation cap; privacy sensitivity plus the literal boundary list; home change plus its note; how they want to be reached plus the action-required channels; update cadence plus best time; how they want cost presented plus the "do not show optional add-on services" note when relevant. Then coordination guidance, then "Things to check (internal only)", then the last-updated line with the source.

For the cautious family in section 8, expect the amber badge, the ten guidance lines listed in section 9, a cap of one non-urgent recommendation, and no discrepancy note (WhatsApp preference is consistent).

Readiness history is being written but there is **no timeline view** in admin — check it in the database instead.

---

## 16. CARE INTAKE COMPLETENESS — separate gate — WORKS NOW

The old form gate is now `MatchAccessGate` and its logs read "care intake completeness". The underlying checker function still carries the older name internally, which is cosmetic.

To test: create a family with name, phone, address, recipient name and relationship but **no** care assessment. On the dashboard, caregiver matches are replaced by the unlock modal. Complete the care needs assessment, reload, and matches appear.

The rule: registration fields plus at least one care preference, and a care assessment row with a recipient or contact name. The loved one's story is optional. Answering or skipping the entire readiness assessment must make **no difference** to this gate — verify by completing readiness first with intake still incomplete; matches must stay locked.

---

## 17. ANONYMOUS / PRE-SIGNUP QUIZ — WORKS NOW

Route: `/family/readiness-quiz` in a private window, signed out.

Take it through to the end. No database write happens for the profile; answers stay in localStorage. The result screen offers lead capture, which writes to `quiz_leads`. Leads are linked to the account afterwards by the existing `link_quiz_leads_to_profile` routine when the same email registers.

Caveat: because the profile is only cached locally, signing up on a different browser will not carry the answers across.

---

## 18. TYPE / BUILD VERIFICATION

- Latest build: **build OK** (2026-09-14 23:20 UTC), no errors.
- Type check: clean as of the last implementation turn.
- Automated tests: the project has a `jest` test script, but there are **no tests covering readiness**. The rule engine is pure and easy to test later; nothing exists today.
- Known gaps rather than failures: the legacy result card, the unmounted pace sentence, and the pre-existing Supabase linter findings (mutable function search paths, metadata-based RLS, security-definer grants, leaked-password protection, Postgres version) which this work did not introduce.

---

## 19. READ-ONLY DATABASE QUERIES

```sql
-- full profile for one family
select id, full_name, care_journey_stage, information_capacity, client_stage,
       client_stage_assessed_at, family_readiness_profile
from profiles
where id = '<family-uuid>';

-- flatten the dimensions
select id,
       family_readiness_profile->>'current_journey_stage'        as journey,
       family_readiness_profile->>'prior_care_experience'        as prior,
       family_readiness_profile->>'outside_care_comfort'         as comfort,
       family_readiness_profile->>'information_capacity'         as capacity,
       family_readiness_profile->>'trust_privacy_sensitivity'    as privacy,
       family_readiness_profile->>'home_change_readiness'        as home_change,
       family_readiness_profile->>'cost_presentation_preference' as cost,
       family_readiness_profile->>'management_preference'        as channel,
       family_readiness_profile->'privacy_selections'            as privacy_selections,
       family_readiness_profile->'skipped'                       as skipped
from profiles
where family_readiness_profile is not null;

-- history of changes
select dimension, previous_value, new_value, source, notes, created_at
from family_readiness_history
where profile_id = '<family-uuid>'
order by created_at desc;

-- checkpoints (should be empty until they are mounted)
select checkpoint_key, response, resolved_at, created_at
from family_understanding_checkpoints
where profile_id = '<family-uuid>';

-- anonymous leads
select id, email, created_at from quiz_leads order by created_at desc limit 20;
```

---

## 20. FINAL QA CHECKLIST

- [ ] registration redirects to the readiness assessment, not the dashboard
- [ ] 9 questions render, with correct numbering
- [ ] Q2b hidden for first-time families, shown for all others
- [ ] Q2b multi-select and optional free text both store correctly
- [ ] skip works on every question and leaves the dimension unset
- [ ] skipped dimensions are listed in `skipped` and nothing is inferred
- [ ] resume prompt appears with the right answered count and restores position
- [ ] retake starts fresh and writes history rows for changed dimensions
- [ ] each dimension stored separately in `family_readiness_profile`
- [ ] no averaged or combined readiness score anywhere
- [ ] `care_journey_stage`, `information_capacity`, `client_stage` all written
- [ ] cautious profile shows the PACE SUPPORT REQUIRED badge
- [ ] established profile does not, and shows fewer guidance lines
- [ ] privacy boundaries stored literally and reflected in guidance
- [ ] cost preference stored literally, no sensitivity label derived
- [ ] dashboard-preference-with-no-activity raises the internal check note
- [ ] WhatsApp preference with no dashboard use raises nothing
- [ ] admin snapshot renders every field for family users
- [ ] readiness answers do not affect the match access gate
- [ ] anonymous run still captures a lead into `quiz_leads`

### Known not-yet-live, so do not test
- Understanding checkpoints — BUILT, NOT MOUNTED
- Contextual readiness check-ins — BUILT, NOT MOUNTED
- Readiness history timeline in admin — NOT IMPLEMENTED
- Nudge composer reading the contact preference — NOT IMPLEMENTED
- Home preparation and cost surfaces obeying the pacing decisions — NOT IMPLEMENTED
- Family-facing per-dimension result screen — NOT IMPLEMENTED (legacy stage card still shown)
