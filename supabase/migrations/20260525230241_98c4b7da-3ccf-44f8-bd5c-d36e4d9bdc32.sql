-- Video templates
create table public.video_templates (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  duration_seconds int not null,
  scene_schema jsonb not null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.video_templates enable row level security;

create policy "Admins can view video templates"
  on public.video_templates for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage video templates"
  on public.video_templates for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger update_video_templates_updated_at
  before update on public.video_templates
  for each row execute function public.update_updated_at_column();

-- Brand snippets feeding AI copy
create table public.video_brand_snippets (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  text text not null,
  notes text,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.video_brand_snippets enable row level security;

create policy "Admins can view brand snippets"
  on public.video_brand_snippets for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage brand snippets"
  on public.video_brand_snippets for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger update_video_brand_snippets_updated_at
  before update on public.video_brand_snippets
  for each row execute function public.update_updated_at_column();

-- Scripts (one per video the admin builds)
create table public.video_scripts (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.video_templates(id) on delete restrict,
  title text not null,
  topic text,
  scenes jsonb not null,
  rendered_url text,
  render_status text not null default 'draft',
  render_notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index idx_video_scripts_created_by on public.video_scripts(created_by);
create index idx_video_scripts_status on public.video_scripts(render_status);

alter table public.video_scripts enable row level security;

create policy "Admins can view video scripts"
  on public.video_scripts for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert video scripts"
  on public.video_scripts for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update video scripts"
  on public.video_scripts for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete video scripts"
  on public.video_scripts for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create trigger update_video_scripts_updated_at
  before update on public.video_scripts
  for each row execute function public.update_updated_at_column();

-- Seed: Village 8s template
insert into public.video_templates (slug, name, description, duration_seconds, scene_schema) values
('village-8s', 'Village 8s', 'Tavara village hero — 5 scenes, 9 seconds, navy on cream.', 9,
'{
  "scenes": [
    {"id": "scene1", "label": "Scene 1 — Opening line", "type": "two_line", "maxWords": 8, "placeholder": "Caring for someone\nyou love…"},
    {"id": "scene2", "label": "Scene 2 — Tension line", "type": "two_line_emphasis", "maxWords": 8, "placeholder": "shouldn''t mean\ncarrying it alone."},
    {"id": "scene3", "label": "Scene 3 — Anchor word", "type": "eyebrow_plus_word", "maxWords": 3, "placeholder": "It takes a / village."},
    {"id": "scene4", "label": "Scene 4 — Three bullets", "type": "stacked_bullets", "maxBullets": 4, "maxWordsPerBullet": 6, "placeholder": "A matched care team. / A coordinator who knows / your loved one. / One plan. One village."},
    {"id": "scene5", "label": "Scene 5 — Lockup", "type": "lockup", "maxWords": 12, "placeholder": "Care, coordinated. / It takes a village to care. / All coordinated by your care coordinator. Tavara."}
  ]
}'::jsonb);

-- Seed: starter brand snippets
insert into public.video_brand_snippets (category, text, notes) values
('tagline', 'It takes a village to care.', 'Primary brand tagline'),
('tagline', 'Care, coordinated.', 'Logo lockup line'),
('value_prop', 'A matched care team.', null),
('value_prop', 'A coordinator who knows your loved one.', null),
('value_prop', 'One plan. One village.', null),
('value_prop', 'Continuity, not gigs.', null),
('value_prop', 'A care team built around your loved one.', null),
('closing', 'All coordinated by your care coordinator. Tavara.', 'Default outro line'),
('closing', 'Tavara. The care coordination platform.', null);