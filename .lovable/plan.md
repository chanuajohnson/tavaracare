

## Fix: Nudge Logging, Repeat Scheduling Guard, and Admin Queue Display

### Problems Identified

1. **Nudge logging silently fails**: `logNudgeSent` in UserNudgeTab gets `adminId` from session but silently returns if null. The insert may also fail due to RLS without any user-visible error. Ana's two nudges sent today were not recorded in `admin_communications`.

2. **Family can schedule care repeatedly**: `ScheduleVisitModal` never checks if the user already has `visit_scheduling_status = 'ready_to_schedule'` or an active booking. They can submit over and over, creating duplicate admin requests.

3. **Admin queue shows "User1 Family Family"**: The profile `7d850934` has `full_name = 'User1 Family Family'` in the database — this is test data that needs a DB update. The admin scheduling dialog also shows this name without the user ID for identification.

---

### Changes

#### 1. Fix nudge logging (`src/components/admin/UserNudgeTab.tsx`)

- Add error toast + console.error when `adminId` is null so it's visible rather than silent
- Add toast.error on insert failure so admin knows logging failed
- This surfaces the root cause instead of silently dropping the log

#### 2. Prevent repeat scheduling (`src/components/family/ScheduleVisitModal.tsx`)

- On mount, fetch the user's profile to check `visit_scheduling_status`
- If status is `ready_to_schedule` or there's an active `visit_bookings` entry: show an "Already Scheduled" view instead of the booking form
  - Message: "Your care request has already been submitted! Our admin team is reviewing it and will be in touch within 24 hours."
  - Show a WhatsApp button: "Need to talk? Message us directly" → opens WhatsApp to Tavara business number (18687865357)
  - Show a "Cancel & Reschedule" option if they want to change their request

#### 3. Show real name + UID in admin scheduling queue (`src/components/admin/AdminSchedulingQueue.tsx`)

- Display the user ID (truncated, e.g., first 8 chars) below the name in the Family column for identification
- This helps admin match the request to the correct user regardless of name quality

#### 4. Fix "User1 Family Family" name in DB (database update)

- Update profile `7d850934-a44f-4348-944b-ae7182dca237` to set `full_name = 'Ana Maria Aimey'` — wait, that's wrong. Ana is `9874b53e`. The `7d850934` user is a different test user (Chanua Johnson's test account based on visit_bookings history showing `user_full_name: Chanua Johnson`). This is test data — the admin can update it via the existing profile management. No DB migration needed for this.

Actually, looking more carefully: the user in the scheduling queue IS `7d850934` with name "User1 Family Family" and phone 8687865357. The user wants admin to see the real name. Since this is a data issue (the profile has a test name), it needs a DB update.

- SQL: `UPDATE profiles SET full_name = 'Chanua Johnson' WHERE id = '7d850934-a44f-4348-944b-ae7182dca237'` — but the user may want a different name. Better to just show UID in the admin queue so the admin can identify users regardless.

---

### Files Changed

| Action | File | Description |
|--------|------|-------------|
| Modify | `src/components/admin/UserNudgeTab.tsx` | Surface logging errors with toasts instead of silent failures |
| Modify | `src/components/family/ScheduleVisitModal.tsx` | Check scheduling status on mount; show "already scheduled" view with WhatsApp contact option |
| Modify | `src/components/admin/AdminSchedulingQueue.tsx` | Show user ID (first 8 chars) below name in the Family column |
| Modify | `src/components/admin/ScheduleVisitDialog.tsx` | Show user ID in the preselected user display |

