CREATE POLICY "Admins read reel voiceovers"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'reel-voiceovers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins upload reel voiceovers"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'reel-voiceovers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete reel voiceovers"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'reel-voiceovers' AND public.has_role(auth.uid(), 'admin'));