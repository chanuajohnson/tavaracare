

## Add "Nudge via WhatsApp" Button for Pending Sessions in Detail Dialog

### Problem
The detail dialog (eye icon) shows no action buttons for **pending** screening sessions. The WhatsApp nudge button on the session row (RefreshCw icon) still works, but when you open the detail view for a pending session like Denise's "Team / Rotation Fit", you see "No responses yet" with zero actionable buttons.

### What will change

**File: `src/components/admin/ScreeningSessionManager.tsx`**

1. **Add a "Nudge via WhatsApp" button in the detail dialog** for `pending` and `in_progress` sessions -- this is the missing piece. It will call the same `handleResendScreening` function that the row-level button uses.

2. **Add a "Send via WhatsApp" button in the detail dialog** that is always visible regardless of session status, so you can always nudge from the detail view.

3. The button will show as: `📲 Nudge via WhatsApp` for pending sessions, making it clear this is a reminder to complete the next screening step.

### Specific code change

In the actions section (around line 507), add a new button block for pending sessions:

```
{/* Nudge for pending/in_progress */}
{(selectedSession.status === 'pending' || selectedSession.status === 'in_progress') && (
  <Button size="sm" onClick={() => handleResendScreening(selectedSession)}>
    📲 Nudge via WhatsApp
  </Button>
)}
```

This reuses the existing `handleResendScreening` which already includes the template position context (e.g., "Template 2 of 4") in the WhatsApp message.

### No new files, no backend changes
Single file edit, ~5 lines added.

