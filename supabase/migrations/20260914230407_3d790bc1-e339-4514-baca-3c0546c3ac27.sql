ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS family_readiness_profile jsonb,
  ADD COLUMN IF NOT EXISTS care_journey_stage text,
  ADD COLUMN IF NOT EXISTS information_capacity text;

COMMENT ON COLUMN public.profiles.family_readiness_profile IS 'Per-dimension family readiness profile. Never averaged into a single score.';
COMMENT ON COLUMN public.profiles.care_journey_stage IS 'exploring | researching | preparing | action | established';
COMMENT ON COLUMN public.profiles.information_capacity IS 'low | moderate | high';

CREATE INDEX IF NOT EXISTS idx_profiles_care_journey_stage
  ON public.profiles (care_journey_stage)
  WHERE care_journey_stage IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.family_readiness_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dimension text NOT NULL,
  previous_value text,
  new_value text,
  source text NOT NULL DEFAULT 'initial_quiz',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_family_readiness_history_profile
  ON public.family_readiness_history (profile_id, created_at DESC);

GRANT SELECT, INSERT ON public.family_readiness_history TO authenticated;
GRANT ALL ON public.family_readiness_history TO service_role;

ALTER TABLE public.family_readiness_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Families view their own readiness history"
  ON public.family_readiness_history FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Families add their own readiness history"
  ON public.family_readiness_history FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.family_understanding_checkpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  checkpoint_key text NOT NULL,
  response text,
  context jsonb,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, checkpoint_key)
);

CREATE INDEX IF NOT EXISTS idx_family_checkpoints_profile
  ON public.family_understanding_checkpoints (profile_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.family_understanding_checkpoints TO authenticated;
GRANT ALL ON public.family_understanding_checkpoints TO service_role;

ALTER TABLE public.family_understanding_checkpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Families view their own checkpoints"
  ON public.family_understanding_checkpoints FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Families create their own checkpoints"
  ON public.family_understanding_checkpoints FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Families update their own checkpoints"
  ON public.family_understanding_checkpoints FOR UPDATE TO authenticated
  USING (profile_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (profile_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_family_checkpoints_updated_at
  BEFORE UPDATE ON public.family_understanding_checkpoints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();