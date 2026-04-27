-- Backfill orphan daily_care_logs by matching to care_shifts on the same date
UPDATE public.daily_care_logs d
SET 
  family_id = COALESCE(d.family_id, s.family_id),
  care_plan_id = COALESCE(d.care_plan_id, s.care_plan_id),
  started_at = COALESCE(d.started_at, d.created_at),
  last_activity_at = COALESCE(d.last_activity_at, d.created_at)
FROM public.care_shifts s
WHERE d.professional_id = s.caregiver_id
  AND d.shift_date = (s.start_time AT TIME ZONE 'UTC')::date
  AND (d.family_id IS NULL OR d.care_plan_id IS NULL);

-- Catch-all: backfill timestamps for any remaining logs missing started_at/last_activity_at
UPDATE public.daily_care_logs
SET 
  started_at = COALESCE(started_at, created_at),
  last_activity_at = COALESCE(last_activity_at, created_at)
WHERE started_at IS NULL OR last_activity_at IS NULL;