
-- Blog comments
create table if not exists public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null,
  author_name text not null,
  author_email text not null,
  body text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  ip_hash text,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid
);

create index if not exists idx_blog_comments_slug_status_created
  on public.blog_comments (post_slug, status, created_at desc);
create index if not exists idx_blog_comments_iphash_created
  on public.blog_comments (ip_hash, created_at);

alter table public.blog_comments enable row level security;

-- Admins can fully manage
create policy "Admins manage blog comments"
on public.blog_comments
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Public-safe view (no email, no ip_hash)
create or replace view public.blog_comments_public as
select id, post_slug, author_name, body, created_at
from public.blog_comments
where status = 'approved';

grant select on public.blog_comments_public to anon, authenticated;

-- Blog post reactions (heart likes)
create table if not exists public.blog_post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null,
  reaction_hash text not null,
  created_at timestamptz not null default now(),
  unique (post_slug, reaction_hash)
);

create index if not exists idx_blog_post_reactions_slug
  on public.blog_post_reactions (post_slug);

alter table public.blog_post_reactions enable row level security;

create policy "Admins manage blog reactions"
on public.blog_post_reactions
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Public-safe aggregated view
create or replace view public.blog_post_likes as
select post_slug, count(*)::bigint as like_count
from public.blog_post_reactions
group by post_slug;

grant select on public.blog_post_likes to anon, authenticated;
