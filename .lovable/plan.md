

## Plan — Make "Retake" actually reset the stage so the dashboard reverts to the quiz banner

### The bug you're hitting

Today, both Retake controls on the **"Optimization · Lifting the daily load"** card on the dashboard (the small ⟲ icon top-right and the "Retake" link bottom-right) just navigate to `/family/readiness-quiz?retake=1`. That route shows Q1 of a fresh quiz, but **the saved stage in `profiles.client_stage` is never cleared until they finish all 6 questions**. So:

- The dashboard `FamilyReadinessQuickAccess` card stays exactly the same (because `hasStage` is still true)
- They can't "start over from a clean dashboard" — only re-take to a new result
- If they bail mid-retake, they're left with the old card silently still showing

You want: tapping Retake on the dashboard should **wipe the saved stage** so the dashboard flips back to the original `ReadinessQuizBanner` ("Help us tailor your experience"), as if the quiz had never been done. Then they can choose to take it again on their own terms.

### What we'll change

**Two retake paths, two different intents — make them explicit:**

1. **Reset from dashboard** (the card's ⟲ icon and "Retake" link) → confirms, **clears the saved stage from DB + localStorage**, dashboard immediately reverts to the quiz banner. No navigation. They restart the quiz from the banner whenever they're ready.
2. **Retake from result page** (the "Things changed — retake" button on `/family/readiness-quiz?view=result`) → still goes to Q1 with `?retake=1`, but **also clears the saved stage on confirmation** so abandoning mid-retake doesn't leave a stale card. The previous behavior of "preserve old stage until completion" was clever, but it created the exact confusion you hit — the dashboard card felt unkillable.

Both paths use the **same `RetakeConfirmDialog`** with updated copy that reflects the new clearing behavior.

### Part 1 — Add a `clearFamilyStage` helper

**File: `src/hooks/useFamilyStage.ts`** — extend the hook to expose a `clearStage()` function that:

- Clears `localStorage.tavara_readiness_stage`, `tavara_readiness_responses`, and the in-progress `tavara_readiness_quiz_progress` keys
- If signed in, sets `profiles.client_stage = null`, `client_stage_assessed_at = null`, `client_stage_quiz_responses = null`
- Refreshes local state so `hasStage` immediately becomes false → dashboard re-renders banner

```text
useFamilyStage() now returns:
  { stage, hasStage, isLoading, refresh, clearStage }
```

### Part 2 — Wire dashboard Retake to actually reset

**File: `src/components/family/FamilyReadinessQuickAccess.tsx`**

- Replace both `<Link to="/family/readiness-quiz?retake=1">` controls (the ⟲ icon and the "Retake" link) with `<button>` elements that open a confirmation dialog
- On confirm → call `clearStage()` from the hook → toast *"Your readiness check has been reset. Take it again whenever you're ready."* → component automatically unmounts (because `hasStage` becomes false) and the `ReadinessQuizBanner` takes its place on the dashboard
- The "View full result" link stays unchanged (read-only path)

### Part 3 — Update RetakeConfirmDialog copy (one dialog, two contexts)

**File: `src/components/family/quiz/RetakeConfirmDialog.tsx`**

Make the dialog accept a `mode` prop: `"reset"` (from dashboard) or `"retake-now"` (from result page).

- **`mode="reset"`** copy:
  > **Reset your readiness check?**
  > This clears your current result so your dashboard goes back to the quiz invitation. You can take the check again anytime — no answers are kept.
  > `[Cancel]` `[Yes, reset]`

- **`mode="retake-now"`** copy:
  > **Retake your readiness check now?**
  > Your current result will be cleared so we can capture where you are today. You'll start at question 1.
  > `[Cancel]` `[Yes, retake]`

### Part 4 — Update the result-page "Things changed — retake" to also clear

**File: `src/pages/family/FamilyReadinessQuizPage.tsx`** (in `handleRetake`)

Change behavior: on confirmation, **clear the stage from DB and localStorage immediately** (using the new `clearStage()` helper), then navigate to `/family/readiness-quiz?retake=1`. This way:

- If they complete the new quiz → fresh stage saved (existing behavior)
- If they abandon mid-retake → their dashboard card is gone; they see the `ReadinessQuizBanner` with the existing in-progress resume prompt (*"Finish your readiness check (3 of 6 answered)"*), which is the right next step

This trades the "preserve old result until new one completes" safety net for clarity. The user just told us the old behavior was confusing — explicit reset wins.

### Part 5 — Edge cases handled

- **Anonymous users**: `clearStage()` only touches localStorage, no DB call attempted. The lead-capture flow on the result page is unaffected.
- **In-progress quiz state**: `clearStage()` also clears `READINESS_PROGRESS_LOCAL_KEY` so a fresh start really is fresh.
- **Toast feedback**: Both reset paths show a confirmation toast so the user knows the wipe succeeded. No silent state changes.
- **Failure**: If the DB update fails, we surface a toast (*"Couldn't reset just now — please try again"*) and leave the dashboard card in place. No partial state.

### Files touched

| File | Change |
|---|---|
| `src/hooks/useFamilyStage.ts` | Add `clearStage()` returning a Promise; wipes DB columns (signed-in) + 3 localStorage keys; refreshes local state |
| `src/components/family/FamilyReadinessQuickAccess.tsx` | Replace both Retake `<Link>`s with buttons that open `RetakeConfirmDialog` in `mode="reset"`; on confirm call `clearStage()` and toast |
| `src/components/family/quiz/RetakeConfirmDialog.tsx` | Add `mode` prop with two copy variants ("reset" / "retake-now"); default to "retake-now" for backward compatibility |
| `src/components/family/quiz/QuizResultCard.tsx` | Pass `mode="retake-now"` to the dialog (no behavior change for the user, just clearer copy) |
| `src/pages/family/FamilyReadinessQuizPage.tsx` | `handleRetake` now calls `clearStage()` before navigating to `?retake=1`, so the old DB stage is wiped immediately |

**No changes to:** AppRoutes, AuthProvider, FamilyRegistration, scoring logic, `ReadinessQuizBanner` (it already reads `hasStage` correctly), reflection field, lead capture, or any schema/RLS.

### Acceptance test

1. Family with `client_stage=4` on `/dashboard/family` sees the "Optimization · Lifting the daily load" card → taps the small ⟲ icon top-right → confirmation dialog appears with reset copy → confirm → toast appears → card disappears → `ReadinessQuizBanner` ("Help us tailor your experience") shows in its place
2. Verify in DB: `profiles.client_stage`, `client_stage_assessed_at`, `client_stage_quiz_responses` are all `null` for that user
3. Same flow via the bottom-right "Retake" link on the card → identical result
4. Family on `/family/readiness-quiz?view=result` taps "Things changed — retake" → dialog shows retake-now copy → confirm → DB stage cleared, localStorage cleared, navigated to Q1 of fresh quiz
5. Family abandons that mid-retake (closes tab on Q3) → returns to dashboard → sees `ReadinessQuizBanner` with progress nudge ("Finish your readiness check (3 of 6 answered)"), NOT the old optimization card
6. Anonymous user on result page → still sees lead capture flow unchanged (no `clearStage` DB call attempted, only localStorage cleared on retake)
7. Retake then complete the new quiz → new stage saved → dashboard now shows the new `FamilyReadinessQuickAccess` card with the new stage

### Out of scope

- Showing the quiz result anywhere else after reset (it's gone — that's the point)
- Soft-delete / undo of a reset (confirmation dialog is the safety net)
- Admin override / restore of a cleared stage
- Touching the `Stage4SupplyNudge` dismissal (separate localStorage key, behaves correctly when stage clears because `hasStage` becomes false)

