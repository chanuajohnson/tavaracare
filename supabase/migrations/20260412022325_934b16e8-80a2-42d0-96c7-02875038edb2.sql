CREATE POLICY "Users can delete their own administrations"
ON public.medication_administrations
FOR DELETE
TO authenticated
USING (administered_by = auth.uid());

CREATE POLICY "Admins can delete any administration"
ON public.medication_administrations
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));