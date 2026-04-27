-- screening_sessions: allow authenticated users to read and update
CREATE POLICY "Professional can view own sessions"
ON public.screening_sessions
FOR SELECT
TO authenticated
USING (professional_id = auth.uid());

CREATE POLICY "Authenticated access via token"
ON public.screening_sessions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated update via token"
ON public.screening_sessions
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- screening_question_templates: allow anon to read active templates
CREATE POLICY "Anon can view active templates"
ON public.screening_question_templates
FOR SELECT
TO anon
USING (is_active = true);