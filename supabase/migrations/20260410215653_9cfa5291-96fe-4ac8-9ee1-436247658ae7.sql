
CREATE TABLE public.professional_onboarding_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  checked_items jsonb DEFAULT '{}'::jsonb,
  notes jsonb DEFAULT '[]'::jsonb,
  started_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_professional_onboarding UNIQUE (professional_id)
);

ALTER TABLE public.professional_onboarding_checklists ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage professional onboarding checklists"
ON public.professional_onboarding_checklists
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Professionals can view their own checklist
CREATE POLICY "Professionals can view own onboarding checklist"
ON public.professional_onboarding_checklists
FOR SELECT
TO authenticated
USING (professional_id = auth.uid());
