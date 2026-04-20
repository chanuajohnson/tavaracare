

## Revised Plan: Use the Daily Checklist as the Check-In Signal

You're right — adding a separate "Start Shift" button duplicates work. The checklist itself becomes the check-in. **First save of a shift's checklist = "Denise is on the job."**

---

### What changes vs. the previous plan

| Previous plan | Revised |
|---|---|
| New `shift_attendance` table | ❌ Dropped — not needed |
| New `TodayShiftCheckInCard` button | ❌ Dropped |
| Two taps (Start Shift + Open Checklist) | ✅ One action — open checklist, tick first item |
| Manual WhatsApp on Start Shift | ✅ Auto WhatsApp the moment first checklist save happens |

---

### 1. Check-in via first checklist save

When Denise opens the daily checklist for today's shift and hits **Save** for the first time (i.e., creates the `daily_care_logs` row), the system:

1. **Stamps a `started_at` timestamp** on that row (new column, `now()` on insert).
2. **Fires a one-time WhatsApp to your central number (18687865357)** pre-filled and auto-sent via the existing WhatsApp routing pattern, OR opened in a tab for her to confirm send (matches existing handoff behaviour):
   > *"🟢 Denise Narcis started shift for Carol Aimey • 8 AM–4 PM • Logged in at 9:14 AM • Checklist 1/28 ticked"*
3. Adds gentle copy at the top of the checklist screen: **"Tip: tick your first item as soon as you arrive — that's how Tavara records you on the job."**

A **second column `last_activity_at`** is auto-updated on every subsequent checklist save so the admin view shows live progress, not just the start moment.

---

### 2. "On the job" timeliness signal

Because the start time is now real (whenever she first ticked anything) — not fake — the admin view can show a **timeliness indicator** by comparing `started_at` to `time_in`:

- 🟢 **On time** — first tick within 15 min of scheduled start
- 🟡 **Late** — first tick 15–60 min after start
- 🔴 **Very late / no log yet** — > 60 min late or no row at all by mid-shift

This directly answers your concern: *"if they start the checklist 4 PM and start checking off things at 8 PM, well, that's not gonna help me."* The `started_at` (first save) is the truth — `last_activity_at` shows ongoing engagement.

---

### 3. Admin Activity tab — same as before, simpler source

The admin Activity tab on Denise's profile (replacing the "coming soon" stub) shows:

**A. This Week's Shifts**
| Date | Family | Scheduled | First Log Saved | Last Activity | Checklist | Status |
|---|---|---|---|---|---|---|
| Apr 20 | Carol Aimey | 8 AM–4 PM | — | — | Not started | 🔴 No log |
| Apr 17 | Carol Aimey | 8 AM–4 PM | (legacy — unknown) | 3:29 PM | ✅ 28/28 | ✅ Logged |
| Apr 16 | Carol Aimey | 8 AM–4 PM | (legacy — unknown) | 3:40 PM | ✅ 28/28 | ✅ Logged |
| Apr 15 | Carol Aimey | 8 AM–4 PM | (legacy — unknown) | 3:12 PM | ✅ 28/28 | ✅ Logged |

> Note on the screenshot you saw earlier ("8:02 AM in progress") — that was illustrative copy in the previous plan, not real data. The real `daily_care_logs` rows only carry the typed `time_in` string ("08:00") and a `created_at` timestamp. Going forward the new `started_at` column will hold the truthful first-save moment.

**B. Recent Activity feed (last 30 days)**
- 🟢 Apr 20, 9:14 AM — Started checklist for Carol Aimey *(15 min late)*
- 📋 Apr 17, 3:29 PM — Submitted Daily Checklist (Carol Aimey, 28/28)
- 📋 Apr 16, 3:40 PM — Submitted Daily Checklist
- 📋 Apr 15, 3:12 PM — Submitted Daily Checklist

**C. Compliance summary**
- Logs this week: **3 of 5** (60%)
- On-time starts: **2 of 3** ✅
- Avg checklist completion: **98.7%** ✅
- Last activity: **Today, 9:14 AM**

---

### 4. Login persistence — unchanged from previous plan

Same one-time **"Stay signed in on this device"** banner. No auth code touched.

---

### Database changes (much smaller now)

Migration adds **two columns** to `daily_care_logs`:
```sql
ALTER TABLE daily_care_logs
  ADD COLUMN started_at  timestamptz,  -- set once on first insert
  ADD COLUMN last_activity_at timestamptz; -- bumped on every save
```

**No new table, no new RLS** — `daily_care_logs` already has the right policies.

---

### Files touched

**New**
- `supabase/migrations/<ts>_daily_care_logs_activity_timestamps.sql`
- `src/components/admin/ProfessionalActivityTab.tsx` (replaces Activity stub)
- `src/utils/whatsapp/checkInTemplate.ts` (pre-filled WA message builder)
- `src/hooks/useProfessionalActivity.ts` (admin-side data fetcher)

**Modified (small, surgical)**
- `src/components/professional/DailyChecklist.tsx` — on first insert, set `started_at = now()`; on every save, set `last_activity_at = now()`; trigger WA notify only on first insert
- `src/components/admin/UserDetailModal.tsx` — swap "Activity tracking coming soon..." for `<ProfessionalActivityTab />`
- Plus the one-time login persistence banner (small, isolated)

**Untouched (protected)**
- `App.tsx`, AuthProvider, registration flow, chat flow, all routing
- The checklist UI/behaviour itself — only the save-side mutation gains two timestamps and one WA call

---

### Out of scope (future)

- Auto-WA reminder *to Denise* if no log saved by 15 min after shift start
- Family-side "your caregiver has started today's checklist" banner (uses same `started_at`)
- GPS, Telegram, deep auth debugging

---

### Acceptance test

1. Denise logs in → opens Carol Aimey's daily checklist for today → ticks first item → hits Save
2. `daily_care_logs` row created with `started_at = now()`, `last_activity_at = now()`
3. WhatsApp opens (or auto-sends) to 18687865357: *"🟢 Denise Narcis started shift for Carol Aimey…"*
4. She continues ticking through the day — each save bumps `last_activity_at` (no extra WA)
5. Admin → Users → Denise → Activity tab shows today's shift with start time, on-time badge, current checklist progress, and historical logs from Apr 15/16/17 (legacy rows show "—" for start time, normal for last activity)

