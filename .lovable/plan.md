

## Telegram Notification When Professional Completes a Screening Session

### What This Does
When a professional submits a screening questionnaire, you'll receive a Telegram message like:

```
✅ SCREENING COMPLETED

👤 Tricia Cumm
📋 "Clinical Competency" (Template 2 of 6)
🧑‍⚕️ Candidate: Denise Narcis
⏰ 4/3/2026, 2:45 PM

5 questions answered (3 voice, 2 text)
```

### Prerequisites (Before Code Changes)

1. **Connect Telegram**: Link the Telegram connector to this project via `standard_connectors--connect`. This provides `TELEGRAM_API_KEY` automatically.
2. **Add `TELEGRAM_CHAT_ID` secret**: Your admin chat ID (e.g. `8356234924`) needs to be stored as a project secret.

### Implementation

**1. Create Edge Function: `supabase/functions/notify-screening-complete/index.ts`**

A new edge function that:
- Receives `{ session_id }` in the request body
- Fetches the completed session from `screening_sessions` (joins template name)
- Fetches the professional's name from `profiles`
- Counts sibling sessions for the same professional to show "Template X of Y" context
- Sends an HTML-formatted Telegram message via the connector gateway
- Returns success/failure

**2. Update `src/pages/screening/MobileScreeningPage.tsx`**

After the successful submission (line 271, after `if (error) throw error`), add a fire-and-forget call:

```typescript
// Fire-and-forget Telegram notification
supabase.functions.invoke('notify-screening-complete', {
  body: { session_id: session.id }
}).catch(console.error);
```

This is non-blocking -- if Telegram fails, the user's submission still succeeds.

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/notify-screening-complete/index.ts` | New edge function: fetches session data, sends Telegram alert via gateway |
| `src/pages/screening/MobileScreeningPage.tsx` | Add fire-and-forget call to the new edge function after successful submission |

### Secrets Required

| Secret | Purpose |
|--------|---------|
| `TELEGRAM_API_KEY` | Provided automatically by Telegram connector |
| `TELEGRAM_CHAT_ID` | Your personal/admin chat ID for receiving alerts |
| `LOVABLE_API_KEY` | Already exists |

