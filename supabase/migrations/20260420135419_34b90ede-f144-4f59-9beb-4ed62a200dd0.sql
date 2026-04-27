ALTER TABLE public.daily_care_logs
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_activity_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_daily_care_logs_professional_started
  ON public.daily_care_logs (professional_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_daily_care_logs_professional_activity
  ON public.daily_care_logs (professional_id, last_activity_at DESC);