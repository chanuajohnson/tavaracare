

## Plan: Add Resend & Delete Actions to Screening Sessions

### What's Changing

Add two action buttons to each screening session row in `ScreeningSessionManager.tsx`:
1. **Resend** (Send icon) — re-opens the WhatsApp link for the candidate, same as the initial send flow
2. **Delete** (Trash icon) — deletes the screening session from the database with a confirmation

### File: `src/components/admin/ScreeningSessionManager.tsx`

**1. Import `Trash2` and `RefreshCw` icons** from lucide-react (line 10)

**2. Add `handleResendScreening` function** (~after line 152)
- Finds the candidate from the `candidates` array using `session.professional_id`
- If `onSendScreening` is available and candidate has a phone number, calls it with the screening link
- Otherwise falls back to copying the link to clipboard with a toast

**3. Add `handleDeleteSession` function**
- Shows a `window.confirm()` dialog: "Are you sure you want to delete this screening session for {candidate_name}?"
- On confirm, deletes the row from `screening_sessions` where `id = session.id`
- Calls `fetchData()` to refresh the list
- Shows success/error toast

**4. Add two buttons to each session row** (between the copy-link and view-details buttons, lines 241-246)
- Resend button: `<RefreshCw>` icon, calls `handleResendScreening(s)`
- Delete button: `<Trash2>` icon with `text-destructive` color, calls `handleDeleteSession(s)`

The row will show: `[Status Badge] [Copy Link] [Resend] [Delete] [View Details]`

