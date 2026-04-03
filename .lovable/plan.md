

## Implement Telegram Notification for Screening Completion

### Prerequisites -- One Secret Needed

`TELEGRAM_API_KEY` and `LOVABLE_API_KEY` are already available. We need to add one more:

- **`TELEGRAM_CHAT_ID`** -- Your personal Telegram chat ID where you want to receive alerts. To find it: message @userinfobot on Telegram, it replies with your chat ID (e.g., `8356234924`).

I will use the `add_secret` tool to request this from you before deploying.

### Changes

**1. New Edge Function: `supabase/functions/notify-screening-complete/index.ts`**

- Receives `{ session_id }` in the request body
- Uses `SUPABASE_SERVICE_ROLE_KEY` to fetch:
  - The completed session (with template name via join on `screening_question_templates`)
  - The professional's name from `profiles`
  - Sibling session count for "Template X of Y" context
- Counts voice vs text responses from the session's `responses` array
- Sends an HTML-formatted Telegram message via the connector gateway:

```
✅ SCREENING COMPLETED

👤 Denise Narcis
📋 "Clinical Competency" (Template 2 of 6)
🧑‍⚕️ Candidate: Denise Narcis
⏰ 4/3/2026, 2:45 PM

5 questions answered (3 voice, 2 text)
```

- Uses the same CORS headers and pattern as the existing `transcribe-screening` function

**2. Update: `src/pages/screening/MobileScreeningPage.tsx`**

After line 271 (after `if (error) throw error;`), add a fire-and-forget call:

```typescript
supabase.functions.invoke('notify-screening-complete', {
  body: { session_id: session.id }
}).catch(err => console.error('Telegram notification failed:', err));
```

Non-blocking -- if Telegram fails, the user's submission still succeeds.

### Technical Details

| Item | Detail |
|------|--------|
| Files created | `supabase/functions/notify-screening-complete/index.ts` |
| Files modified | `src/pages/screening/MobileScreeningPage.tsx` (1 line added) |
| Secrets needed | `TELEGRAM_CHAT_ID` (will prompt you) |
| Secrets already available | `LOVABLE_API_KEY`, `TELEGRAM_API_KEY` |
| Gateway URL | `https://connector-gateway.lovable.dev/telegram/sendMessage` |

