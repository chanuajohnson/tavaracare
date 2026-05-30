
-- 1. Media assets catalogue
CREATE TABLE public.blog_media_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_path TEXT,
  public_url TEXT NOT NULL,
  width INT,
  height INT,
  mime_type TEXT,
  source TEXT NOT NULL DEFAULT 'uploaded',
  prompt TEXT,
  anchor_id TEXT,
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_media_assets_created_at ON public.blog_media_assets(created_at DESC);
CREATE INDEX idx_blog_media_assets_source ON public.blog_media_assets(source);
CREATE INDEX idx_blog_media_assets_post_id ON public.blog_media_assets(post_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_media_assets TO authenticated;
GRANT ALL ON public.blog_media_assets TO service_role;

ALTER TABLE public.blog_media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage blog media assets"
  ON public.blog_media_assets
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_blog_media_assets_updated
  BEFORE UPDATE ON public.blog_media_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Seed the 6 already-regenerated covers
INSERT INTO public.blog_media_assets (public_url, source, post_id, tags)
SELECT bp.cover_image_url, 'seeded', bp.id,
  ARRAY[bp.slug, COALESCE(bp.category, 'blog')]::text[]
FROM public.blog_posts bp
WHERE bp.cover_image_url IS NOT NULL
  AND (bp.cover_image_url LIKE '%/blog-covers/%' OR bp.cover_image_url LIKE '%/blog-assets/covers/%')
ON CONFLICT DO NOTHING;
