CREATE POLICY "Families can update their own onboarding checklist"
ON public.onboarding_checklists
FOR UPDATE
TO authenticated
USING (family_id = auth.uid())
WITH CHECK (family_id = auth.uid());