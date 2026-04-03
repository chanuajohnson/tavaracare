
## Fix the Screening Telegram Alert So It Can Be Diagnosed and Retried Properly

### What I found
I inspected the current wiring and it is already hooked up correctly in code:

- `src/pages/screening/MobileScreeningPage.tsx` does invoke `notify-screening-complete` right after a session is marked `completed`
- `supabase/functions/notify-screening-complete/index.ts` is deployed and sending through the Telegram connector gateway
- the function logs show repeated Telegram API failures: `400 Bad Request: chat not found`

So this is not a missing frontend trigger anymore. The failure is happening at Telegram delivery time, and the current setup does not give you enough visibility or an easy way to retry from the admin screen after fixing the bot/chat setup.

### Updated implementation plan

#### 1. Harden the edge function with real diagnostics
Update `supabase/functions/notify-screening-complete/index.ts` so it does more than just fail with a generic error:

- trim and validate `TELEGRAM_CHAT_ID`
- validate request body (`session_id`) before querying
- when sending fails, return a structured error code instead of only raw text
- add Telegram-side diagnostics:
  - verify bot identity with `getMe`
  - verify chat reachability with `getChat` using the configured `TELEGRAM_CHAT_ID`
  - only then call `sendMessage`
- include the attempted chat ID and diagnostic step in the error payload/logs

This will let us distinguish:
- wrong chat ID
- bot not started / chat inaccessible
- wrong bot connection
- actual send failure

#### 2. Add persistent notification attempt logging
Add a small logging table via migration, for example `screening_notification_events`, to store:

- `session_id`
- `professional_id`
- `chat_id_used`
- `status` (`success` / `failed`)
- `diagnostic_stage` (`getMe`, `getChat`, `sendMessage`)
- `error_code`
- `error_message`
- raw gateway response
- timestamps

That gives you an audit trail instead of relying only on temporary function logs.

#### 3. Add a manual “Send / Retry Telegram Alert” action in the admin Screening UI
On `/admin/caregiver-screening`, extend `src/components/admin/ScreeningSessionManager.tsx` so each completed/reviewed session can be manually retried from the admin side.

Behavior:
- add a button in the detail dialog for completed/reviewed sessions
- invoke `notify-screening-complete` directly from the admin UI
- show the exact result in a toast:
  - success: notification delivered
  - failure: show the structured reason returned by the function

This removes the need to wait for another real submission just to test whether the fix worked.

#### 4. Show last Telegram delivery status in the session detail
In the same admin detail dialog, show the latest notification state:

- last attempt status
- when it was tried
- last error summary if failed

That way, if a professional finishes a screening and no message arrives, you can immediately see whether:
- no attempt happened
- delivery failed
- it was successfully sent

#### 5. Keep the mobile submission flow unchanged except for better observability
`src/pages/screening/MobileScreeningPage.tsx` should remain non-blocking for the caregiver/professional experience.

The screening should still submit successfully even if Telegram fails, but after this change:
- the failure will be logged permanently
- admin can retry from the Journey/Screening workflow
- the error will be actionable instead of silent

### Files to change

| File | Change |
|------|--------|
| `supabase/functions/notify-screening-complete/index.ts` | Add validation, Telegram diagnostics (`getMe`/`getChat`), structured errors, and attempt logging |
| `src/components/admin/ScreeningSessionManager.tsx` | Add manual retry button and last notification status display |
| `src/pages/screening/MobileScreeningPage.tsx` | Keep current invoke pattern; only adjust if needed to align with improved response handling |
| `supabase/migrations/*` | Create notification event log table for screening Telegram deliveries |

### Why this is the right fix
Right now the system can attempt delivery, but it cannot tell you clearly why it failed or let you re-test easily from the UI. Since the logs already prove the trigger is firing, the next useful step is not more frontend wiring — it is diagnostics, visibility, and retry.

### Expected result after implementation
After these changes, when a professional completes a screening:

- you will either receive the Telegram alert successfully
- or the admin screening page will clearly show why it failed
- and you will have a one-click retry button to confirm the fix immediately

### Verification plan
After implementation, I will verify using an already completed screening session from the admin caregiver screening page:

1. open a completed session
2. click the new Telegram retry button
3. confirm either:
   - message is received in your Telegram chat, or
   - the returned diagnostic identifies the exact blocker

This will give us a real end-to-end answer instead of guessing from “nothing arrived.”
