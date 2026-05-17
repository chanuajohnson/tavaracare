-- Blog posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL,
  reading_time TEXT,
  author_name TEXT NOT NULL DEFAULT 'Chanua Johnson',
  author_role TEXT DEFAULT 'Tavara Care Coordinator & Founder',
  author_avatar_url TEXT,
  cover_image_url TEXT,
  cta_label TEXT,
  cta_href TEXT,
  faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','published','hidden')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status_published ON public.blog_posts(status, published_at DESC);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read only published posts whose date has passed
CREATE POLICY "Public reads published blog posts"
  ON public.blog_posts FOR SELECT
  USING (status = 'published' AND published_at IS NOT NULL AND published_at <= now());

-- Admins full access
CREATE POLICY "Admins manage blog posts"
  ON public.blog_posts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Generic updated_at function (create if it doesn't exist)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for blog assets (avatars, covers)
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-assets', 'blog-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read blog assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-assets');

CREATE POLICY "Admins upload blog assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update blog assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'blog-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete blog assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-assets' AND public.has_role(auth.uid(), 'admin'));