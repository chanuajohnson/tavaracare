
-- Add render tracking columns to video_scripts
ALTER TABLE public.video_scripts
  ADD COLUMN IF NOT EXISTS render_id text,
  ADD COLUMN IF NOT EXISTS render_progress numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS render_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS render_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS render_bucket_name text,
  ADD COLUMN IF NOT EXISTS render_function_name text;

-- Public bucket for finished MP4s
INSERT INTO storage.buckets (id, name, public)
VALUES ('video-renders', 'video-renders', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, admin write
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read video renders' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Public read video renders"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'video-renders');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage video renders' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Admins manage video renders"
      ON storage.objects FOR ALL
      USING (bucket_id = 'video-renders' AND public.has_role(auth.uid(), 'admin'))
      WITH CHECK (bucket_id = 'video-renders' AND public.has_role(auth.uid(), 'admin'));
  END IF;
END$$;
