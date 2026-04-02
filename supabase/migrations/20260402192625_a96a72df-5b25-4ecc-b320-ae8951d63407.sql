CREATE POLICY "Professionals can delete their own pending references"
ON public.professional_references
FOR DELETE
TO authenticated
USING (auth.uid() = professional_id AND status = 'pending');