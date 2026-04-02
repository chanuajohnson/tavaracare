

## Plan: Nudge/Resubmit Action + Fix RLS INSERT Policy

### Two Changes

#### 1. Add "Nudge to Resubmit" action in detail dialog

When a screening is completed/reviewed and has an AI recommendation of `reject` or `review`, show a **"Nudge to Resubmit"** button in the detail dialog actions section. This will:

- Reset the session status back to `pending` and clear responses/AI fields in the database
- Generate a new access token (by deleting the old session and creating a fresh one with the same template + professional)
- Send the new link via WhatsApp (using `onSendScreening`) or copy to clipboard
- Include a diplomatic message that does NOT expose the AI recommendation directly — something like: "We'd like you to complete the screening again to help us finalize the evaluation"

**File: `src/components/admin/ScreeningSessionManager.tsx`**

- Add `handleNudgeResubmit(session)` function that:
  1. Resets the session: `UPDATE screening_sessions SET status = 'pending', responses = '[]', ai_summary = null, ai_recommendation = null, access_token = gen_random_uuid()` where id = session.id
  2. Fetches the updated session to get the new access_token
  3. Sends the link via `onSendScreening` or copies to clipboard
  4. Shows toast: "Resubmission nudge sent!"
  5. Refreshes data and updates selectedSession

- Add button in the actions section (lines ~414-425): Show "Send Resubmission Nudge" button when session has `ai_recommendation` of `reject` or `review`, OR when status is `completed`/`reviewed`

- The WhatsApp message context passed via `onSendScreening` will use the same flow — the admin can customize the message before sending

#### 2. Fix RLS INSERT policy via migration

**New migration SQL:**

```sql
DROP POLICY IF EXISTS "Admins can manage screening sessions" ON public.screening_sessions;

CREATE POLICY "Admins can manage screening sessions"
  ON public.screening_sessions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Also fix the templates table policy for consistency
DROP POLICY IF EXISTS "Admins can manage screening templates" ON public.screening_question_templates;

CREATE POLICY "Admins can manage screening templates"
  ON public.screening_question_templates
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

This switches from `is_current_user_admin()` (JWT metadata) to `has_role(auth.uid(), 'admin')` (user_roles table), which is reliable since the admin user has a row in `user_roles`.

### Summary

- Admin can now send a resubmission nudge after reviewing a screening — resets the session and sends a fresh link without exposing rejection details
- RLS policy fix allows admin to create sessions for any template without the INSERT error

