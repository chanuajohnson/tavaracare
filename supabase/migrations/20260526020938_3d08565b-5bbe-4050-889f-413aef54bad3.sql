
alter view public.blog_comments_public set (security_invoker = true);
alter view public.blog_post_likes set (security_invoker = true);
