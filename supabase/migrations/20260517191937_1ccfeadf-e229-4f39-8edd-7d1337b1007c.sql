-- Storage bucket for cached blog audio
insert into storage.buckets (id, name, public)
values ('blog-audio', 'blog-audio', true)
on conflict (id) do nothing;

-- Public read of audio files
create policy "Public read blog-audio"
on storage.objects for select
using (bucket_id = 'blog-audio');

-- blog_audio cache table
create table public.blog_audio (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  voice_id text not null default 'EXAVITQu4vr4xnSDxMaL',
  audio_url text not null,
  duration_seconds numeric not null,
  char_count integer not null,
  generated_at timestamptz not null default now(),
  unique (post_id, voice_id)
);

alter table public.blog_audio enable row level security;

create policy "Public can read audio for published posts"
on public.blog_audio for select
using (
  exists (
    select 1 from public.blog_posts p
    where p.id = blog_audio.post_id
      and p.status = 'published'
      and p.published_at <= now()
  )
);

create policy "Admins can read all blog audio"
on public.blog_audio for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));