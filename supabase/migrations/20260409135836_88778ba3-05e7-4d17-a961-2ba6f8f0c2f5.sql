
create table public.daily_care_logs (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid references auth.users(id) on delete cascade not null,
  client_name text,
  shift_date date not null default current_date,
  shift_type text check (shift_type in ('morning', 'afternoon', 'night')),
  checklist_data jsonb not null default '{}'::jsonb,
  notes text,
  time_in text,
  time_out text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.daily_care_logs enable row level security;

create policy "Professionals manage own logs"
  on public.daily_care_logs for all
  to authenticated
  using (professional_id = auth.uid())
  with check (professional_id = auth.uid());

create index idx_daily_care_logs_professional on public.daily_care_logs(professional_id);
create index idx_daily_care_logs_date on public.daily_care_logs(shift_date);
