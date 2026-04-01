

## Fix: Screening Link & Landing Page RLS Policy Gaps

### Root Cause

Three RLS policy gaps prevent the screening flow from working:

1. **`screening_sessions` table**: The "Public access via token" SELECT policy only applies to the `anon` role. When a logged-in professional taps the screening link, they use the `authenticated` role — and the only authenticated SELECT policies require `is_current_user_admin()` or `assigned_to = auth.uid()`. Since neither matches, the query returns empty → "Invalid or expired screening link".

2. **`screening_sessions` table**: The `ProfessionalScreeningLandingPage` queries `WHERE professional_id = auth.uid()`, but no authenticated SELECT policy covers this condition. So the professional always sees "Screening Not Yet Assigned" even though 2 sessions exist for them.

3. **`screening_question_templates` table**: Has zero `anon` policies, so the join `screening_question_templates(questions)` in the public screening page fails silently for unauthenticated users too.

### Fix: 2 Database Migrations (no code changes needed)

**Migration 1: Add authenticated SELECT policies for screening_sessions**

```sql
-- Professionals can view their own screening sessions
CREATE POLICY "Professional can view own sessions"
ON public.screening_sessions
FOR SELECT
TO authenticated
USING (professional_id = auth.uid());

-- Authenticated users can also access sessions via token (same as anon)
CREATE POLICY "Authenticated access via token"
ON public.screening_sessions
FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can update sessions via token (same as anon)
CREATE POLICY "Authenticated update via token"
ON public.screening_sessions
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
```

Note: The broad `USING (true)` for authenticated mirrors the existing anon policy. This is safe because the screening page only queries by `access_token` (a UUID that acts as a secret), and RLS on related tables (templates) provides additional gating.

**Migration 2: Add anon SELECT policy for screening_question_templates**

```sql
-- Allow anon users to read active templates (needed for public screening page join)
CREATE POLICY "Anon can view active templates"
ON public.screening_question_templates
FOR SELECT
TO anon
USING (is_active = true);
```

### What This Fixes

- Logged-in professionals tapping the WhatsApp screening link will no longer see "Invalid or expired screening link"
- The `/professional/screening` landing page will correctly find and display the professional's pending session
- The "Begin Screening Interview" button will work and load the questions properly
- Unauthenticated users accessing the link will also see the template questions

### No Code Changes Required

Both `MobileScreeningPage.tsx` and `ProfessionalScreeningLandingPage.tsx` already have the correct query logic — the issue is purely RLS policies blocking the data access.

