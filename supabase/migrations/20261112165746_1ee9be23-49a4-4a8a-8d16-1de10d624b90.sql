CREATE TABLE public.reel_voice_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  script text NOT NULL DEFAULT '',
  caption_story text NOT NULL DEFAULT '',
  voice_path text,
  voice_duration numeric,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reel_voice_presets TO authenticated;
GRANT ALL ON public.reel_voice_presets TO service_role;
ALTER TABLE public.reel_voice_presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage reel voice presets" ON public.reel_voice_presets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER reel_voice_presets_updated BEFORE UPDATE ON public.reel_voice_presets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();