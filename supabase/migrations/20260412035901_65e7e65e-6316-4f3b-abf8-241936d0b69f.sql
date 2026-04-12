CREATE POLICY "Admins can view all professional documents"
ON public.professional_documents
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));