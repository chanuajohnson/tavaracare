

## Plan — Authenticated-user quiz persistence: "see your result first, retake only if things changed"

### The gap today

Right now if a signed-in family taps the readiness quiz link — from anywhere except the dashboard's *"View full result"* link — they land on **Q1 of a fresh quiz**, even though they already have a saved stage. That's wrong: it suggests their previous answers were lost and quietly invites them to overwrite a result they never said was stale.

The dashboard quick-access card (`FamilyReadinessQuickAccess`) is great — but it's the only path that respects their saved state. Every other entrypoint (direct URL, deep links, "Take the quiz" CTAs elsewhere) ignores it.

### What we'll change

For **authenticated users with a saved `client_stage`**, the quiz route becomes a **result-first experience** with two clear paths back into the quiz, rather than an unconditional Q1.

```text
Signed-in family visits /family/readiness-quiz
  │
  ├─ Has saved stage? ──▶ Show RESULT screen by default
  │                        ┌────────────────────────────────┐
  │                        │ Your readiness · Stage name    │
  │                        │ (full result card + CTAs)      │
  │                        │                                │
  │                        │ ─ Last checked: 12 days ago    │
  │                        │ ─ [Things changed — retake]    │
  │                        │ ─ [See my answers]             │
  │                        └────────────────────────────────┘
  │
  └─ No saved stage? ───▶ Show Q1 (current behavior, unchanged)
```

**Two explicit retake paths:**

1. **"Things changed — retake"** → confirmation modal *("Your last answers will be replaced. Continue?")* → starts fresh Q1, clears stage from local cache only after they answer Q1 (so abandoning keeps the old result intact)
2. **"See my answers"** → expandable inline panel showing each of the 6 questions and which option they previously chose, so they can verify whether their reality has actually shifted before committing to a retake

### Part 1 — Result-first quiz route for authenticated returners

**File: `src/pages/family/FamilyReadinessQuizPage.tsx`**

On mount, when `user?.id` exists AND `hasStage` resolves true AND there is no `?retake=1` query param:
- Default `showResult = true` (currently only happens with `?view=result`)
- Suppress the resume-progress prompt (irrelevant — they already have a final result)
- Render the existing `QuizResultCard` exactly as on the dashboard's "View full result" link

This unifies behavior: any authenticated entry to the quiz with a saved stage = see your result, not Q1.

### Part 2 — "Last checked" timestamp + freshness hint

**File: `src/components/family/quiz/QuizResultCard.tsx`** *(small additive change — does not touch reflection or lead capture)*

Read `client_stage_assessed_at` (already saved on completion) and render a soft line above the CTAs:

> *Last checked: 12 days ago* · `[Things changed — retake]` · `[See my answers]`

Freshness language is gentle, never nagging:
- < 14 days → *"Last checked: X days ago"*
- 14–60 days → *"Last checked: X days ago — does this still feel right?"*
- 60+ days → *"It's been a while since you took this — life may have shifted. Want to refresh?"*

For anonymous users (no DB timestamp), this section is hidden — they get the existing lead-capture flow instead.

### Part 3 — Confirmation before overwriting

**File: `src/components/family/quiz/RetakeConfirmDialog.tsx`** *(NEW, small — uses existing `AlertDialog` from `@/components/ui/alert-dialog`)*

Triggered by **"Things changed — retake"**. Copy:

> **Retake your readiness check?**
> Your previous answers will be replaced when you finish the new quiz. Your old result stays in place until you complete all 6 questions, so you can back out anytime.
>
> `[Cancel]`  `[Yes, retake]`

On confirm → navigate to `/family/readiness-quiz?retake=1` → quiz page sees the param, skips the result-first shortcut, starts at Q1 with empty answers, **but does not yet clear the saved stage from `profiles`**. The existing `persistStage` only fires on completion of all 6 questions, so abandonment naturally preserves the old stage. We just need to make sure no in-progress localStorage from a stale resume contaminates the new attempt — clear `READINESS_PROGRESS_LOCAL_KEY` when `?retake=1` is present.

### Part 4 — "See my answers" expandable panel

**File: `src/components/family/quiz/PreviousAnswersPanel.tsx`** *(NEW)*

Triggered by **"See my answers"** toggle. Reads `client_stage_quiz_responses` from the profile (already loaded by the existing reflection effect — extend that query to also return the answer map), then renders a compact list:

```text
1. How are you feeling about your situation right now?
   ✓ "I'm ready for someone to take more off my plate"

2. What feels hardest right now?
   ✓ "Feeling mentally and emotionally stretched"

…
```

Read-only. No edit-in-place — that's what retake is for. Stays compact (collapsed by default).

### Part 5 — Anonymous users: no behavior change

The result-first shortcut and "Last checked" line are **gated on `user?.id` AND `hasStage` from DB**, not localStorage. Anonymous quiz-takers continue exactly as today: Q1 first, lead-capture at the end. (Their localStorage stage doesn't qualify as "authoritatively saved" for this UX — saved-on-device ≠ saved-to-account.)

### Files touched

| File | Change |
|---|---|
| `src/pages/family/FamilyReadinessQuizPage.tsx` | Result-first mount logic for signed-in users with saved stage; honor new `?retake=1` to bypass; clear in-progress localStorage on `?retake=1`; load `client_stage_quiz_responses.answers` for the previous-answers panel |
| `src/components/family/quiz/QuizResultCard.tsx` | Add "Last checked" freshness line + "Things changed — retake" + "See my answers" controls (signed-in only) — placed above existing CTAs, does not touch reflection field or lead capture block |
| `src/components/family/quiz/RetakeConfirmDialog.tsx` | NEW — small AlertDialog wrapper |
| `src/components/family/quiz/PreviousAnswersPanel.tsx` | NEW — collapsible read-only list of past answers |
| `src/components/family/FamilyReadinessQuickAccess.tsx` | Tiny copy nudge: change *"Retake"* link to also pass `?retake=1` so it triggers the same confirmation flow on the quiz page (consistency) |

**No changes to:** `useFamilyStage`, scoring logic, reflection field, anonymous lead capture, dashboard layout, schema, RLS, AppRoutes, AuthProvider, FamilyRegistration, App.tsx, chat flow.

### Acceptance test

1. Signed-in family with `client_stage = 3` visits `/family/readiness-quiz` directly → lands on **result screen for Stage 3** (not Q1), sees "Last checked: X days ago" with retake + see-answers controls
2. Same family taps **"See my answers"** → inline panel expands showing the 6 questions and the option they previously chose for each → tap again to collapse
3. Same family taps **"Things changed — retake"** → confirmation modal → Cancel → returns to result, nothing changed in DB
4. Same family taps retake → Confirm → lands on Q1 with empty state, in-progress localStorage cleared, **DB stage still shows 3** until they complete all 6
5. Family abandons mid-retake (closes tab on Q3) → returns later → still sees Stage 3 result (old stage preserved), with the existing in-progress resume prompt offering to continue the partial retake
6. Family completes the retake with different answers → new stage saved, `client_stage_assessed_at` updated, "Last checked" resets to "today"
7. Family with stage assessed > 60 days ago → sees gentler nudge copy *"It's been a while since you took this — life may have shifted. Want to refresh?"*
8. Anonymous visitor to `/family/readiness-quiz` → Q1 first (unchanged), lead capture at end (unchanged) — no result-first shortcut, no "Last checked" line
9. Dashboard quick-access card's "Retake" link → also opens with `?retake=1` and triggers the confirmation modal (consistency with direct-route retake)

### Out of scope

- Editing individual past answers in place (retake is the path)
- Scheduled re-quiz reminders / push notifications
- Admin override UI for `client_stage`
- Showing reflection text in the previous-answers panel (already echoed back inside the result card by existing logic)
- Anonymous users seeing freshness — they have no DB timestamp and lead capture is the better hook for them

