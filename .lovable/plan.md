

## Plan: Two-way acknowledge + nudge on caregiver shift notes

You're right — Carol's "Items needed" note from Apr 16 is sitting in the log with no way for the family to confirm they've seen it, no way for the admin to ping the family, and no return path when the family adds their own note. Let's close that loop.

---

### What's already there (good news)

- `daily_care_log_feedback` table exists (family→log comments, RLS already wired for family/professional/admin)
- `send-nudge-whatsapp` edge function exists and is used elsewhere (NudgeSystem, UserDetailModal)
- Family already has a "Leave Feedback" textarea on each log in `DailyCareLogsTab`
- Admin already views logs per-professional via the new `ProfessionalCareLogsList`

What's missing: **acknowledgement state on the caregiver note**, **a one-tap nudge from admin**, and **a mirrored "Family Note" with caregiver-side acknowledgement**.

---

### The fix — three small additions

**1. New columns on `daily_care_log_feedback`** (one migration)

```sql
ALTER TABLE public.daily_care_log_feedback
  ADD COLUMN author_role text NOT NULL DEFAULT 'family'
    CHECK (author_role IN ('family','professional','admin')),
  ADD COLUMN acknowledged_at timestamptz,
  ADD COLUMN acknowledged_by uuid REFERENCES auth.users(id);
```

Plus widen the existing RLS: professionals can **insert** feedback on their own logs (currently only families can). Same select policy already covers reads.

This turns the table into a unified two-way thread per log (caregiver notes, family replies, ack receipts), without touching `daily_care_logs.notes` itself.

**2. Acknowledge button + Nudge family button (admin + family views)**

In `src/components/admin/ProfessionalCareLogsList.tsx` (the modal you screenshotted):
- Below the existing "Caregiver Notes" block, add two compact actions:
  - **✓ Mark family as informed** — admin acknowledges on behalf of family (writes `acknowledged_at`, `acknowledged_by = admin.id`)
  - **📲 Nudge family on WhatsApp** — opens a confirm dialog that sends a templated message via `send-nudge-whatsapp` to the log's `family_id`. Template:
    > *"Hi [Family first name] — your caregiver [Carol] left a note on [Apr 16]: '[first 200 chars of note]…' Tap to view & confirm: [tavara.care link to /family/care-plan/{carePlanId}]"*
  - If `family_id` is null (legacy logs like Carol's Apr 16 entry), show a small inline hint *"Legacy log — no family linked. Use the manual nudge from the family profile."* and disable the nudge button.
- Once acknowledged, replace buttons with a small green chip: *"Family informed by Admin · Apr 21, 9:42 AM"*

In `src/components/care-plan/DailyCareLogsTab.tsx` (family-facing daily logs):
- Above the existing "Leave Feedback" section, surface the caregiver's note as a clearly-styled card with an **"✓ Got it — I've read this"** button. Click writes `acknowledged_at`, `acknowledged_by = user.id` (with `author_role='family'` on a synthetic ack row, so the caregiver sees a confirmation).

**3. Mirror it for family notes → caregiver acknowledgement**

The family textarea already exists. Tag every family-submitted feedback row with `author_role='family'`. Then in the **professional's** Daily Checklist app (`src/components/professional/DailyChecklist.tsx`), surface unacknowledged family notes at the top of the matching shift with a **"✓ Acknowledge"** button → writes `acknowledged_at`, `acknowledged_by = professional.id`.

Admin sees both ack states in the existing log expansion (small green chip per note: *"Acknowledged by Carol Apr 21, 8:01 AM"*).

---

### Files touched

| File | Change |
|---|---|
| `supabase/migrations/<timestamp>_add_log_feedback_acks.sql` | **NEW** — add `author_role`, `acknowledged_at`, `acknowledged_by`; allow professional inserts |
| `src/components/admin/ProfessionalCareLogsList.tsx` | Add Acknowledge + Nudge family buttons under Caregiver Notes; show ack chip when set |
| `src/components/care-plan/DailyCareLogsTab.tsx` | Add "Got it" ack button on caregiver note; tag new feedback with `author_role='family'` |
| `src/components/professional/DailyChecklist.tsx` | Surface unacknowledged family notes for the active shift with Acknowledge button |
| `src/integrations/supabase/types.ts` | Auto-regen after migration |

**Not touched:** routing, AuthProvider, registration, chat flow, `daily_care_logs` table itself, the existing `send-nudge-whatsapp` edge function. No new edge functions.

---

### What admin sees (acceptance test)

1. Admin → Tricia Cumm (or Carol Aimey) → Activity → **View all logs**
2. Expand the Apr 16 "Items needed" entry → caregiver note shows with two buttons: **✓ Mark family as informed** · **📲 Nudge family on WhatsApp**
3. Click *Nudge* → confirm dialog shows the WA message preview → confirm → toast *"Nudge sent to Denise Narcis"*, button row replaced by chip *"Nudged Apr 21, 9:42 AM by Admin"*
4. (Carol's Apr 16 log specifically: `family_id IS NULL` — nudge button is disabled with the *"Legacy log"* hint, ack button still works)
5. Click *Mark family as informed* → green chip *"Family informed by Admin · Apr 21, 9:43 AM"*
6. Family logs in → Daily Care Logs → sees "Items needed" note with **✓ Got it — I've read this** button → clicks → both family & admin see *"Acknowledged by [family name]"*
7. Family adds their own note ("Picked up gloves and vinegar — still need slippers") → caregiver opens shift in Daily Checklist next day → sees yellow banner *"New note from family"* with **✓ Acknowledge** button
8. Caregiver acknowledges → admin sees both ack chips on the same log expansion

---

### Out of scope (for later, if you want)

- Auto-nudge family if caregiver note isn't acknowledged within 24h (cron job)
- Email fallback when family has no WhatsApp number on file
- Threaded replies (currently flat list — fine for MVP)

