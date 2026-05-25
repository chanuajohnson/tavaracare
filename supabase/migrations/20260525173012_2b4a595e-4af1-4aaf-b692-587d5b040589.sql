CREATE TABLE public.blog_analytics_annotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  occurred_on DATE NOT NULL,
  label TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX blog_analytics_annotations_occurred_on_idx
  ON public.blog_analytics_annotations (occurred_on DESC);

ALTER TABLE public.blog_analytics_annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view annotations"
  ON public.blog_analytics_annotations
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert annotations"
  ON public.blog_analytics_annotations
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete annotations"
  ON public.blog_analytics_annotations
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));