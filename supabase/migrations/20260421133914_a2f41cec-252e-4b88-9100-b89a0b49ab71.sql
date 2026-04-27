-- Add acknowledgment columns to daily_care_log_feedback
ALTER TABLE public.daily_care_log_feedback
  ADD COLUMN IF NOT EXISTS author_role text NOT NULL DEFAULT 'family'
    CHECK (author_role IN ('family','professional','admin')),
  ADD COLUMN IF NOT EXISTS acknowledged_at timestamptz,
  ADD COLUMN IF NOT EXISTS acknowledged_by uuid REFERENCES auth.users(id);

-- Allow professionals to insert feedback on their own logs
DROP POLICY IF EXISTS "Professionals can insert feedback on own logs" ON public.daily_care_log_feedback;
CREATE POLICY "Professionals can insert feedback on own logs"
  ON public.daily_care_log_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.daily_care_logs dcl
      WHERE dcl.id = daily_care_log_feedback.log_id
        AND dcl.professional_id = auth.uid()
    )
  );

-- Allow admins to insert feedback on any log (for ack-on-behalf-of-family)
DROP POLICY IF EXISTS "Admins can insert feedback on any log" ON public.daily_care_log_feedback;
CREATE POLICY "Admins can insert feedback on any log"
  ON public.daily_care_log_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_current_user_admin());

-- Allow updates for acknowledgment (family on their logs, professional on their logs, admin on any)
DROP POLICY IF EXISTS "Users can acknowledge feedback on accessible logs" ON public.daily_care_log_feedback;
CREATE POLICY "Users can acknowledge feedback on accessible logs"
  ON public.daily_care_log_feedback
  FOR UPDATE
  TO authenticated
  USING (
    public.is_current_user_admin()
    OR EXISTS (
      SELECT 1 FROM public.daily_care_logs dcl
      WHERE dcl.id = daily_care_log_feedback.log_id
        AND (
          dcl.professional_id = auth.uid()
          OR dcl.family_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.care_plans cp
            WHERE cp.id = dcl.care_plan_id AND cp.family_id = auth.uid()
          )
        )
    )
  );

-- Index for fast lookup of unacknowledged notes per log
CREATE INDEX IF NOT EXISTS idx_daily_care_log_feedback_log_ack
  ON public.daily_care_log_feedback(log_id, acknowledged_at);