-- Add care_plan_id and family_id to daily_care_logs
ALTER TABLE public.daily_care_logs 
  ADD COLUMN IF NOT EXISTS care_plan_id uuid REFERENCES care_plans(id),
  ADD COLUMN IF NOT EXISTS family_id uuid REFERENCES profiles(id);

-- RLS policy: families can view logs for their care plans
CREATE POLICY "Families can view logs for their care plans"
  ON public.daily_care_logs FOR SELECT TO authenticated
  USING (family_id = auth.uid());

-- RLS policy: admins can view all logs
CREATE POLICY "Admins can view all daily care logs"
  ON public.daily_care_logs FOR SELECT TO authenticated
  USING (public.is_current_user_admin());

-- Create feedback table
CREATE TABLE public.daily_care_log_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id uuid REFERENCES daily_care_logs(id) ON DELETE CASCADE NOT NULL,
  family_id uuid REFERENCES profiles(id) NOT NULL,
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.daily_care_log_feedback ENABLE ROW LEVEL SECURITY;

-- Family can insert and read their own feedback
CREATE POLICY "Families manage own feedback" 
  ON public.daily_care_log_feedback
  FOR ALL TO authenticated 
  USING (family_id = auth.uid()) 
  WITH CHECK (family_id = auth.uid());

-- Professionals can read feedback on their logs
CREATE POLICY "Professionals read feedback on own logs" 
  ON public.daily_care_log_feedback
  FOR SELECT TO authenticated
  USING (log_id IN (SELECT id FROM daily_care_logs WHERE professional_id = auth.uid()));

-- Admins can view all feedback
CREATE POLICY "Admins can view all log feedback"
  ON public.daily_care_log_feedback
  FOR SELECT TO authenticated
  USING (public.is_current_user_admin());