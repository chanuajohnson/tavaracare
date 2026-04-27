
-- Table 1: Reusable screening question templates
CREATE TABLE public.screening_question_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.screening_question_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage screening templates"
  ON public.screening_question_templates
  FOR ALL
  TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Authenticated users can view active templates"
  ON public.screening_question_templates
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Table 2: Screening sessions (one per candidate-nurse pairing)
CREATE TABLE public.screening_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.screening_question_templates(id) ON DELETE SET NULL,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  candidate_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'reviewed')),
  responses JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_summary TEXT,
  ai_recommendation TEXT,
  access_token UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_screening_sessions_access_token ON public.screening_sessions(access_token);

ALTER TABLE public.screening_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage screening sessions"
  ON public.screening_sessions
  FOR ALL
  TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Assigned nurse can view their sessions"
  ON public.screening_sessions
  FOR SELECT
  TO authenticated
  USING (assigned_to = auth.uid());

CREATE POLICY "Assigned nurse can update their sessions"
  ON public.screening_sessions
  FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- Allow anonymous access via access_token (for public mobile page)
CREATE POLICY "Public access via token"
  ON public.screening_sessions
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public update via token"
  ON public.screening_sessions
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Storage bucket for voice recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('screening-recordings', 'screening-recordings', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for screening recordings
CREATE POLICY "Anyone can upload screening recordings"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'screening-recordings');

CREATE POLICY "Anyone can read screening recordings"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'screening-recordings');
