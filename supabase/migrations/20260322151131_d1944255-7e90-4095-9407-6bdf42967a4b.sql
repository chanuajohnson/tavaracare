
-- Add care_urgency column to profiles table using the existing enum
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS care_urgency care_urgency NULL;

COMMENT ON COLUMN public.profiles.care_urgency IS 'How soon the family needs care: immediate, within_week, within_month, flexible';
