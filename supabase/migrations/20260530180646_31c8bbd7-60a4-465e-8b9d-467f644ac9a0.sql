
CREATE TABLE public.blog_media_rejections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID,
  storage_path TEXT,
  public_url TEXT,
  source TEXT,
  anchor_id TEXT,
  prompt TEXT,
  tags TEXT[],
  post_id UUID,
  reason TEXT NOT NULL,
  reason_category TEXT,
  rejected_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.blog_media_rejections TO authenticated;
GRANT ALL ON public.blog_media_rejections TO service_role;

ALTER TABLE public.blog_media_rejections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view rejections"
  ON public.blog_media_rejections FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert rejections"
  ON public.blog_media_rejections FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_blog_media_rejections_anchor_created
  ON public.blog_media_rejections (anchor_id, created_at DESC);
