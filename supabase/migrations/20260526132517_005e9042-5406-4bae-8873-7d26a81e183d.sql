ALTER TABLE public.blog_audio
  ADD COLUMN IF NOT EXISTS word_timings jsonb,
  ADD COLUMN IF NOT EXISTS narration_text text;