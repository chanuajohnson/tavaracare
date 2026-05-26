
drop view if exists public.blog_comments_public;
drop view if exists public.blog_post_likes;

create or replace function public.get_blog_comments(_post_slug text)
returns table(id uuid, post_slug text, author_name text, body text, created_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select id, post_slug, author_name, body, created_at
  from public.blog_comments
  where post_slug = _post_slug and status = 'approved'
  order by created_at desc
$$;

create or replace function public.get_blog_like_count(_post_slug text)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint from public.blog_post_reactions where post_slug = _post_slug
$$;

grant execute on function public.get_blog_comments(text) to anon, authenticated;
grant execute on function public.get_blog_like_count(text) to anon, authenticated;
