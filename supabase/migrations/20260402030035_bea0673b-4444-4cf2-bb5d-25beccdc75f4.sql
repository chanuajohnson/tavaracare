-- Fix screening_sessions RLS to use has_role() instead of is_current_user_admin()
DROP POLICY IF EXISTS "Admins can manage screening sessions" ON public.screening_sessions;

CREATE POLICY "Admins can manage screening sessions"
  ON public.screening_sessions
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fix screening_question_templates RLS for consistency
DROP POLICY IF EXISTS "Admins can manage screening templates" ON public.screening_question_templates;

CREATE POLICY "Admins can manage screening templates"
  ON public.screening_question_templates
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));