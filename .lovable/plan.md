

## Plan — Make Denise's daily logs visible in the admin Activity tab

### What's actually happening

I queried Denise's records directly in the database. Her logs ARE saved — just invisible in the admin UI for three reasons that compound:

| What you see in admin | What's in the DB | Why it doesn't render |
|---|---|---|
| "0 / 4 logs this week" | 3 logs exist on Apr 15, 16, 17 | Those dates are **last week** (week starts Mon Apr 20). The "logs this week" counter only counts current-week rows. |
| "This Week's Shifts" → all rows show "No log" | Denise has 7 shifts last week + 4 this week | Even her last-week shifts show "No log" because the table is filtered to current week only — last week's shifts (where her logs exist) aren't shown at all. |
| Each log row in DB has `family_id = NULL`, `care_plan_id = NULL`, `started_at = NULL` | The current save code (DailyChecklist.tsx) writes all of these, but Denise's 3 logs predate that fix — they're **legacy rows** | The shift↔log matcher in `useProfessionalActivity.ts` joins on `care_plan_id OR family_id`. Both NULL → no match → her shift rows render as "No log" even on dates a log exists. |

The "Recent Activity" feed at the bottom of the same screen DOES show her 3 saves correctly — that's the proof her data is there. The compliance summary and shift table are just filtering it out.

### Fix — three small, surgical changes

**1. Backfill Denise's 3 legacy logs** (one-time SQL update)

Set `family_id`, `care_plan_id`, `started_at`, and `last_activity_at` on her 3 existing logs by matching to her shifts on the same date. Concretely:

- Apr 15 log → care_plan `3d634783...`, family `9874b53e...` (Ana Maria Aimey), `started_at = created_at`, `last_activity_at = created_at`
- Apr 16 log → same family/plan, `started_at = created_at`, `last_activity_at = created_at`
- Apr 17 log → same family/plan, `started_at = created_at`, `last_activity_at = created_at`

This makes the shift↔log join work retroactively for her existing data and gives the admin UI real timestamps to display.

**2. Generic backfill for other professionals with the same legacy gap**

Same pattern, applied to ALL `daily_care_logs` rows where `family_id IS NULL` AND `care_plan_id IS NULL` — match each orphan log to a `care_shifts` row on the same `shift_date` for the same `professional_id`/`caregiver_id`, and copy over the shift's `family_id` and `care_plan_id`. Backfill `started_at` and `last_activity_at` from `created_at` where null. This silently fixes any other caregiver with pre-fix logs sitting in the same trap.

**3. Fix `useProfessionalActivity.ts` to widen the visible range**

Two small edits in the hook (admin Activity tab):

- **Compliance Summary "Logs this week"**: today, "this week" = Mon→Sun starting current Monday. Change to a **7-day rolling window** (last 7 days) so logs from the prior week still register while admins are reviewing. The "/4" denominator becomes count of shifts in that same 7-day window. *(This is the metric the user is staring at when they say "Denise has been entering her logs.")*
- **"This Week's Shifts" table**: rename to **"Recent Shifts"** and show the **last 14 days** of shifts (not just current calendar week). Same row design, same columns, same badges. This way Apr 15–17 logs show up alongside Apr 20–24 upcoming shifts in one continuous view, and admins can immediately verify recent compliance without needing to click through to "View all logs."

No other component touched. The fallback log entries (orphan logs with no matching shift) already render correctly via the existing code path at lines 209–230 of the hook.

### Files touched

| File | Change |
|---|---|
| New migration `supabase/migrations/<ts>_backfill_orphan_care_logs.sql` | UPDATE Denise's 3 logs explicitly + generic UPDATE joining `daily_care_logs` ↔ `care_shifts` for any other orphans; backfill `started_at`/`last_activity_at` from `created_at` |
| `src/hooks/useProfessionalActivity.ts` | Replace `startOfWeekIso()` usage with `last7DaysIso()` for weekly counters; replace the `thisWeekShifts` filter in `ProfessionalActivityTab.tsx` with a 14-day rolling filter |
| `src/components/admin/ProfessionalActivityTab.tsx` | Change card title `"This Week's Shifts"` → `"Recent Shifts (last 14 days)"`; reuse new `recentShifts` from filter |

No DailyChecklist save logic changes (the save flow is already correct for new logs — verified at lines 444–469). No RLS changes. No new tables. No effect on family-side care log display.

### Acceptance test

1. Open admin → Denise's profile → Activity tab → **Compliance Summary now shows "3 / 7 Logs this week"** (3 logs Apr 15–17 against 7 weekday shifts Apr 13–17 + Apr 20–24 inside the 7-day window — exact denominator depends on today's date, but the numerator is **3**, not 0)
2. **"Recent Shifts (last 14 days)"** table now lists Apr 13 → Apr 24, with green ✓ badges on Apr 15/16/17 rows showing "First Log Saved" timestamps and checklist completion ratios pulled from her actual checklist_data
3. The 4 future shifts (Apr 20/21/22/24) still show "Upcoming" / "No log" appropriately
4. **Recent Activity feed** continues to show the 3 "Saved Daily Checklist" entries (no regression)
5. Run query on a different professional with a similar orphan log → their admin Activity tab also resolves correctly post-migration
6. Open DailyChecklist as a caregiver → save a new log → confirm `family_id`, `care_plan_id`, `started_at`, `last_activity_at` are all populated (no regression on the fix that's already in place)

### Out of scope

- Restructuring the chat flow, registration, or any chat-protected component
- Touching `App.tsx`, AuthProvider, family-side care log views
- Editing `DailyChecklist.tsx` save logic (already correct)
- The 5 unrelated security findings shown in the side panel
- Real-time push of new logs into the admin tab (still requires manual Refresh)

