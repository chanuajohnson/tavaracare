CREATE TABLE public.social_share_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook','instagram','whatsapp','tiktok','linkedin')),
  campaign TEXT NOT NULL,
  content_slug TEXT NOT NULL,
  full_url TEXT NOT NULL,
  caption TEXT,
  generated_by UUID,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  copied_at TIMESTAMPTZ
);

CREATE INDEX idx_social_share_links_post ON public.social_share_links(post_id);
CREATE INDEX idx_social_share_links_campaign ON public.social_share_links(campaign);

ALTER TABLE public.social_share_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ssl_admin_select" ON public.social_share_links
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "ssl_admin_insert" ON public.social_share_links
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "ssl_admin_update" ON public.social_share_links
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));