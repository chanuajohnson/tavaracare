CREATE POLICY "Admins can view all professional documents in storage"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'professional-documents'
  AND public.has_role(auth.uid(), 'admin')
);