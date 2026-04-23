

## Plan — Fix the cross-card reset bug + reposition the readiness banner so families see it sooner

### What's actually broken (root cause)

The screenshot shows that after tapping Reset on the "Optimization · Lifting the daily load" card:

- ✅ `FamilyReadinessQuickAccess` correctly disappeared
- ❌ `Stage4SupplyNudge` ("Tired of holding the list?") **stayed visible** even though it's gated on `hasStage && stage === 4`
- ❌ `ReadinessQuizBanner` ("Help us tailor your experience") **didn't appear** even though `hasStage` should now be false

Both bugs share the same root cause: **`useFamilyStage()` is called independently in 3 different components (`ReadinessQuizBanner`, `FamilyReadinessQuickAccess`, `Stage4SupplyNudge`), and each call has its own isolated `useState` — they don't share state**. So when `clearStage()` runs inside `FamilyReadinessQuickAccess`, only that component re-renders. The other two still hold the stale `stage=4, hasStage=true` from their own initial DB fetch.

The dashboard only "comes back to life" on a hard refresh because that's when every hook re-fetches.

### Fix Part A — Make `useFamilyStage` reactive across components

Change `useFamilyStage` so all instances stay in sync after a reset. Two minimal options, picking the simpler one:

- Emit a lightweight custom DOM event (`tavara:family-stage-changed`) inside `clearStage()` and the quiz-completion `persistStage()` path. Every `useFamilyStage()` instance subscribes to this event in a `useEffect` and re-runs `load()` when it fires.

This avoids introducing a context provider or React Query just for this one state, keeps the hook's signature unchanged, and is bulletproof across pages. Other places that mutate `client_stage` (the quiz completion path) will also dispatch the event so the dashboard updates without a refresh.

**File touched:** `src/hooks/useFamilyStage.ts` only — no schema, no provider tree change.

### Fix Part B — Tie the supply nudge to the readiness state, not floating on its own

Once Part A is in place, `Stage4SupplyNudge` will correctly disappear after reset (because `hasStage` becomes false in its own hook instance too). No code change needed there beyond Part A — the existing guard already handles it.

To be extra safe and match the user's expectation ("the second card is related to the first — they should rise and fall together"), we'll also add an explicit comment in `Stage4SupplyNudge` clarifying it depends on `hasStage`.

### Fix Part C — Reposition the readiness banner higher on the dashboard

Currently the order is:

```text
1. FamilyShortcutMenuBar
2. DailyCareQuickView           ← "Today's Care Activity"
3. Rate Info ($40–$50+/hr)      ← "Tavara Care Rates"
4. FamilyMatchNotification      ← "You have 6 caregiver matches"
5. SchedulingStatusBanner
6. CaregiverReadinessCard
7. ProfessionalChatRequestsSection
8. ReadinessQuizBanner          ← TOO LOW — buried below all care ops
9. FamilyReadinessQuickAccess   ← TOO LOW
10. Stage4SupplyNudge
```

The user wants the readiness check to sit **above "Today's Care Activity"** when the family hasn't taken it (so it's emotionally forward-facing), and **above "Tavara Care Rates"** when they have taken it (visible but not pushy).

**New order** (when the family has NOT taken the quiz yet — `!hasStage`):

```text
1. FamilyShortcutMenuBar
2. ReadinessQuizBanner          ← MOVED UP — emotional check-in front and centre
3. DailyCareQuickView
4. Rate Info
5. … (rest unchanged)
```

**New order** (when the family HAS taken the quiz — `hasStage`):

```text
1. FamilyShortcutMenuBar
2. DailyCareQuickView
3. FamilyReadinessQuickAccess   ← MOVED UP — above Rate Info, but below today's activity
4. Stage4SupplyNudge            ← stays right below the quick-access card (only at stage 4)
5. Rate Info
6. … (rest unchanged)
```

This is achieved by:
- Moving `<ReadinessQuizBanner />`, `<FamilyReadinessQuickAccess />`, and `<Stage4SupplyNudge />` out of their current position (lines 367–369) up into the section right after `<FamilyShortcutMenuBar />` (around line 230) and `<DailyCareQuickView />` (line 233)
- Keeping the components' internal `hasStage` gating — only one of `ReadinessQuizBanner` vs `FamilyReadinessQuickAccess` will ever render at a time, so the dashboard stays clean

### Fix Part D — Make the empty-state banner copy more emotional

Today the banner reads:

> **Help us tailor your experience**
> Take our 60-second readiness check so your dashboard fits where you are right now.

The user described it as an "emotional health check-in", not a UI personalization tool. New copy on the empty-state version (the in-progress version stays unchanged because it's task-focused):

> **How are you doing today?**
> Take a 60-second emotional check-in so we can meet you where you actually are — not where the platform assumes.

Same `<Link>`, same destination, same icon. Just warmer copy that matches the user's framing.

### Files touched

| File | Change |
|---|---|
| `src/hooks/useFamilyStage.ts` | Dispatch `tavara:family-stage-changed` event after `clearStage()` succeeds; subscribe to the same event in the hook's `useEffect` so all instances re-load in sync |
| `src/pages/family/FamilyReadinessQuizPage.tsx` | After successful `persistStage()` on quiz completion, also dispatch `tavara:family-stage-changed` so the dashboard's banner→quick-access transition is instant on return |
| `src/components/family/FamilyDashboard.tsx` | Move the 3 readiness-related elements (`<ReadinessQuizBanner />`, `<FamilyReadinessQuickAccess />`, `<Stage4SupplyNudge />`) from lines 367–369 to a new spot directly after `<DailyCareQuickView />` at line 234. Update `ReadinessQuizBanner` empty-state copy to the warmer "How are you doing today?" framing |

**No changes to:** `useFamilyStage`'s public signature, `FamilyReadinessQuickAccess`, `Stage4SupplyNudge` internals, `RetakeConfirmDialog`, schema, RLS, AppRoutes, AuthProvider, FamilyRegistration, scoring logic, or the lead capture flow.

### Acceptance test

1. Family with `client_stage=4` on `/dashboard/family` → sees `FamilyReadinessQuickAccess` (Optimization card) **above** the Tavara Care Rates card and **below** Today's Care Activity. Stage4 supply nudge sits right under it.
2. Same family taps the ⟲ Reset icon → confirms → toast appears → **both** the Optimization card AND the "Tired of holding the list?" card disappear in the same render (no refresh needed) → in their place, the warmer `ReadinessQuizBanner` ("How are you doing today?") appears, positioned right above Today's Care Activity.
3. Family taps that banner → goes to the quiz → completes Q1–Q6 → on return to `/dashboard/family`, the new `FamilyReadinessQuickAccess` card appears in the higher position immediately, no refresh needed.
4. Family who has never taken the quiz → opens dashboard for the first time → sees `ReadinessQuizBanner` directly under the shortcut menu bar, above Today's Care Activity.
5. Family at stage 1, 2, or 3 → sees their `FamilyReadinessQuickAccess` card in the higher position, and **no** Stage4 supply nudge (existing gate preserved).
6. Anonymous (logged-out) visitor to `/dashboard/family` → sees the welcome card (existing behavior), no readiness banner or quick-access card (gated on `user`).
7. Verify in DevTools: dispatching `window.dispatchEvent(new CustomEvent('tavara:family-stage-changed'))` triggers a re-fetch in all mounted `useFamilyStage()` instances.

### Out of scope

- Replacing `useFamilyStage` with React Query or a context provider (the event-bus fix is minimal and matches the existing patterns in the codebase)
- Adding analytics on banner impressions / quiz starts (separate workstream)
- Restyling the banner — only the copy changes; visual treatment stays
- Changing where the readiness card sits on any non-dashboard route

