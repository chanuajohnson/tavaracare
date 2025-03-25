
-- Add registration_skipped column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS registration_skipped BOOLEAN DEFAULT FALSE;
