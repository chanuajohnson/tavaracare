

## Plan: Shift Check-In + Admin Activity Feed for Professionals

Three connected pieces — built on existing tables, zero auth changes, zero touch to the chat flow or registration.

---

### 1. "I'm on the job" check-in for Denise (and all caregivers)

A new section on the **Professional Dashboard** showing today's shifts. Each shift card gets:

- Big amber **"Start Shift"** button → on tap:
  1. Writes a row to a new `shift_attendance` table (`caregiver_id`, `care_shift_id`, `family_id`, `started_at`, `started_via='dashboard'`, optional GPS not collected).
  2. Updates `care_shifts.status` from `open` → `in_progress`.
  3. Opens **WhatsApp pre-filled to your central number (18687865357)** with: *"✅ Denise Narcis checked in for Carol Aimey (Peltier Care Plan) at 8:02 AM — 8 AM–4 PM shift."* She just hits send.
- After start, button flips to green **"End Shift"** → records `ended_at`, sets shift to `completed`, prompts her to *Open Daily Checklist*.

Why both DB record + WhatsApp: belt and braces — you get a permanent log even if WhatsApp doesn't get sent, AND a real-time ping on your phone.

```text
Today's Shift  ·  Carol Aimey (Peltier)
☀️ 8 AM – 4 PM Standard Daytime
[ 🟢 Start Shift ]   ← writes attendance + opens WhatsApp
```

After tap:
```text
Today's Shift  ·  Carol Aimey (Peltier)
🟢 ON SHIFT since 8:02 AM
[ Open Daily Checklist ]   [ ⏹ End Shift ]
```

---

### 2. Admin Activity tab — replaces "coming soon"

The empty Activity tab on Denise's profile modal becomes a real timeline. Three sections:

**A. This Week's Shifts (table view)**
| Date | Family | Scheduled | Checked In | Checked Out | Checklist | Notes |
|---|---|---|---|---|---|---|
| Apr 20 | Carol Aimey | 8 AM–4 PM | 🟢 8:02 AM | — | 🟡 In progress | – |
| Apr 17 | Carol Aimey | 8 AM–4 PM | ⚪ Not recorded | — | ✅ 100% (28/28) | View |
| Apr 16 | Carol Aimey | 8 AM–4 PM | ⚪ Not recorded | — | ✅ 100% | View |
| Apr 15 | Carol Aimey | 8 AM–4 PM | ⚪ Not recorded | — | ✅ 96% (27/28) | View |

> Past shifts before this feature ships will show "Not recorded" for check-in (the daily-log entries are still there — admin can click "View" to open the full checklist inline using the existing `AdminCareLogsTab` component).

**B. Recent Activity (last 30 days, scrollable)**
- 🟢 Apr 20, 8:02 AM — Started shift for Carol Aimey
- 📋 Apr 17, 3:29 PM — Submitted Daily Checklist (Carol Aimey, 100%)
- 📋 Apr 16, 3:40 PM — Submitted Daily Checklist (Carol Aimey, 100%)
- 📋 Apr 15, 3:12 PM — Submitted Daily Checklist (Carol Aimey, 96%)

Pulled from: `shift_attendance`, `daily_care_logs`, `medication_administrations` (filtered by `administered_by = caregiver_id`), and `cta_engagement_tracking` (login pings only — not page noise).

**C. Compliance summary (top of tab, color-coded)**
- Shifts this week: **3 of 5** (60%)
- Avg checklist completion: **98.7%** ✅
- Shifts started via dashboard: **1 of 3** ⚠️ (start using the check-in button so timing is recorded)
- Last activity: **Today, 8:02 AM**

---

### 3. Login persistence — diagnosis only, no auth changes

`supabase/client.ts` already has `persistSession: true, autoRefreshToken: true`. Sessions should last ~30 days. The "logging in every minute" is most likely:
- Using browser private/incognito mode
- A different device or browser each time
- Aggressive cookie clearing
- Multiple tabs/devices auto-signing-out the older session

**Action**: I'll add a tiny **"Stay signed in on this device"** confirmation banner on first login that explains how persistence works (one sentence + "Got it" button, stored in localStorage so it never shows again). No changes to AuthProvider, signOut logic, or session refresh — just user guidance.

If after this the issue persists, we'll diagnose with logs (separate task).

---

### Database changes

**One new table** (migration):
```sql
shift_attendance (
  id uuid PK,
  care_shift_id uuid FK → care_shifts,
  caregiver_id uuid FK → profiles,
  family_id uuid FK → profiles,
  care_plan_id uuid,
  started_at timestamptz,
  ended_at timestamptz,
  started_via text default 'dashboard',  -- 'dashboard' | 'admin_manual'
  notes text,
  created_at, updated_at
)
```
RLS:
- Caregivers: insert/update own rows
- Families: select rows where `family_id = auth.uid()`
- Admins: full access via `is_current_user_admin()`

No changes to `daily_care_logs`, `care_shifts`, `profiles`, or anything in `auth.*`.

---

### Files touched

**New**
- `supabase/migrations/<ts>_shift_attendance.sql` — table + RLS
- `src/components/professional/TodayShiftCheckInCard.tsx` — start/end shift card
- `src/components/admin/ProfessionalActivityTab.tsx` — replaces stub
- `src/hooks/useShiftAttendance.ts` — read/write attendance
- `src/utils/whatsapp/shiftCheckInTemplate.ts` — pre-filled message builder

**Modified (small)**
- `src/components/admin/UserDetailModal.tsx` — swap "Activity tracking coming soon..." with `<ProfessionalActivityTab />`
- `src/pages/professional/ProfessionalProfileHub.tsx` (or the dashboard page that's the professional's main view) — add `<TodayShiftCheckInCard />` at top
- `src/components/auth/...` — add the one-time persistence banner (read-only addition, no auth-logic change)

**Untouched (protected)**
- `App.tsx`, all routing, AuthProvider, registration pages, chat flow, `supabase/client.ts` auth config, `daily_care_logs` schema, `professionalOnboardingSections.ts`

---

### Out of scope (separate tasks if you want them later)

- GPS-verified check-in
- Auto-reminder WhatsApp to Denise if she hasn't checked in by 8:15 AM
- Family-side "your caregiver has arrived" banner (would also use `shift_attendance`)
- Deep auth/session debugging
- Telegram bot for check-in (we have the connector, but WhatsApp matches Tavara's central routing standard)

---

### Acceptance test (after build)

1. Log in as Denise → professional dashboard shows today's Carol Aimey 8 AM shift with a Start button
2. Tap Start → shift card flips to "ON SHIFT since 8:02 AM", WhatsApp opens to 18687865357 pre-filled, you receive the message after she sends
3. Open admin → Users → Denise Narcis → Activity tab → see this week's shifts with the new check-in time, plus the 3 historical daily logs from Apr 15/16/17 with completion %
4. Click "View" on a past log → existing daily checklist opens inline showing all 28 ticked items
5. Tap End Shift → status flips to completed, prompted to open the daily checklist

