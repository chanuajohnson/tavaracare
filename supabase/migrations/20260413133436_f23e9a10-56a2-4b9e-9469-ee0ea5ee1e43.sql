CREATE POLICY "Professionals can update own onboarding checklist"
  ON public.professional_onboarding_checklists
  FOR UPDATE
  TO authenticated
  USING (professional_id = auth.uid())
  WITH CHECK (professional_id = auth.uid());