ALTER TABLE public.reel_exports ADD COLUMN IF NOT EXISTS is_primary boolean NOT NULL DEFAULT false;
GRANT UPDATE, DELETE ON public.reel_exports TO authenticated;
CREATE POLICY "Admins update reel exports" ON public.reel_exports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete reel exports" ON public.reel_exports FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));