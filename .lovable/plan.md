

## Plan — Stop silent log loss + give Denise (and you) certainty about save status

### What's actually happening

I queried the DB directly. Denise has **only 3 logs total** in `daily_care_logs` — Apr 15, 16, 17. There is **nothing past Apr 17** anywhere (not in `daily_care_logs`, not in `work_logs`, no orphan rows). The admin UI is showing the truth.

So the question isn't "why doesn't the admin show her logs" — it's **"why does Denise believe she saved when she didn't?"**

Reading `DailyChecklist.tsx`, the most likely cause is in the draft auto-restore logic (lines 117-140):

> Local drafts are only restored when `draft.shiftDate === today`. If she ticked items yesterday and didn't hit Save, today's open shows a **blank checklist** — but yesterday's draft is still sitting in `localStorage` (never cleared). She has no signal that yesterday's work was lost.

Combined with the Save button likely being below the fold on mobile (and no persistent "Unsaved changes" indicator), it's plausible she's been ticking items thinking auto-save covers her, then closing the tab.

### Fix — three changes that prevent this from ever happening again

**1. "Unsaved changes" sticky banner inside `DailyChecklist.tsx`**

Add a small amber sticky bar at the **top** of the checklist whenever `checkedItems` (or notes/time) has changed since the last successful save. Says: *"You have unsaved changes — tap Save Daily Log at the bottom to record this shift."* with a `Save Now` button right in the bar that calls the same `handleSave()`. This means she literally cannot tick items without seeing a clear path to persist them. The banner disappears the instant a save succeeds.

**2. Auto-stale draft warning + recovery**

When she opens the checklist and there's a **stale local draft** for a different date (e.g. yesterday's draft when today is a new day), show a **one-time toast + small recovery card**: *"You have an unsaved draft from Apr 22 (14 items ticked). [Open it] · [Discard]"*. If she taps Open, we set `shiftDate` to that date and restore the draft so she can save it now. This rescues any in-flight work she may already have lost over the past week.

**3. Save success/failure visibility upgrade**

- Replace the small `toast.success(...)` after save with a brief inline confirmation panel: ✅ *"Saved at 11:42 AM. Tavara recorded you on the job."* — visible until she navigates away or starts editing again. This is the trust signal she needs.
- On save failure (network error, RLS rejection, etc.), instead of just `toast.error`, also write the failed payload + error message to `localStorage` under a `tavara_checklist_save_errors_${userId}` key and show a persistent red bar: *"Save failed — your work is preserved locally. [Retry] · [Show error]"*. This way if it ever IS a backend issue, we have evidence.

### Bonus — admin-side visibility into "drafted but never saved"

Add a small line in the admin Activity tab compliance summary:

> "📝 0 logs saved past Apr 17 — last activity Apr 17, 3:29 PM"

Pulls `MAX(last_activity_at)` for the professional and surfaces the gap in plain English so you don't have to manually count rows.

### Files touched

| File | Change |
|---|---|
| `src/components/professional/DailyChecklist.tsx` | Add `lastSavedSnapshot` state + `isDirty` derived flag; render sticky `<UnsavedChangesBanner />` when dirty; add inline post-save confirmation panel; add stale-draft detection that surveys localStorage on mount and offers recovery; on save failure, persist failure record to `localStorage` and show red retry bar |
| `src/components/professional/UnsavedChangesBanner.tsx` (NEW) | Small amber sticky bar with "Save Now" CTA — pure presentational |
| `src/components/professional/StaleDraftRecoveryCard.tsx` (NEW) | One-time card shown above the form when a different-date draft exists; "Open it" / "Discard" actions |
| `src/components/admin/ProfessionalActivityTab.tsx` | Add a one-line "Last logged activity: {date, time}" + "Days since last log: N" to the Compliance Summary card so the gap is impossible to miss |

No DB schema changes. No RLS changes. No touch to `App.tsx`, AuthProvider, registration, or chat flow. The save logic itself (lines 417-526) is correct and stays untouched — we're only adding visibility/safety scaffolding around it.

### Acceptance test

1. Tick 5 items in the checklist → amber sticky banner appears at top: *"You have unsaved changes — Save Now"* — both `Save Now` button and the existing bottom button work
2. Hit Save → banner disappears, green inline panel shows ✅ *"Saved at HH:MM"* — verify a new row in `daily_care_logs` for today
3. Tick more items after save → banner reappears (dirty state restored)
4. Close browser without saving (with ticked items) → reopen tomorrow → toast appears: *"Unsaved draft from {yesterday} — Open it / Discard"* — Open restores and lets her save retroactively
5. Force a save failure (e.g. disconnect network, hit Save) → red persistent bar appears: *"Save failed — work preserved locally. Retry."* → reconnect, click Retry → succeeds, red bar clears
6. Open admin → Denise's Activity tab → Compliance Summary now shows *"Last logged activity: Apr 17, 3:29 PM · 6 days since last log"* — instant signal even before opening shift table
7. Have Denise herself open the checklist on her phone → she sees the amber banner the moment she ticks the first item, can't miss the Save action

### Out of scope

- Auto-save to DB on every tick (rejected — would create incomplete log rows that pollute compliance metrics)
- Push notifications for unsaved drafts (separate workstream)
- Touching the chat flow, registration, AuthProvider, App.tsx
- Touching the actual save SQL — it's correct
- Backfill for Apr 18-23 (no data exists to backfill — those shifts genuinely have no logs)

