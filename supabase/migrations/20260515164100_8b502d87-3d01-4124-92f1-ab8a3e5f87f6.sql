CREATE POLICY "Active care team can view assigned family onboarding checklist"
  ON public.onboarding_checklists FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.care_team_members ctm
      WHERE ctm.family_id = onboarding_checklists.family_id
        AND ctm.caregiver_id = auth.uid()
        AND ctm.status = 'active'
    )
  );

CREATE POLICY "Active care team can view assigned family payment records"
  ON public.family_payment_records FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.care_team_members ctm
      WHERE ctm.family_id = family_payment_records.family_user_id
        AND ctm.caregiver_id = auth.uid()
        AND ctm.status = 'active'
    )
  );