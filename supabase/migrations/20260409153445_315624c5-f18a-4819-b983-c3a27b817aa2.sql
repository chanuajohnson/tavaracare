ALTER TABLE public.daily_care_logs DROP CONSTRAINT IF EXISTS daily_care_logs_shift_type_check;
ALTER TABLE public.daily_care_logs ADD CONSTRAINT daily_care_logs_shift_type_check 
  CHECK (shift_type IN ('morning', 'afternoon', 'night', 'scheduled', 'other'));