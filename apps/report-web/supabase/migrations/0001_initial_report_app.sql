create extension if not exists "pgcrypto";

create type report_status as enum ('draft', 'published', 'archived', 'revoked');

create table public.teacher_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  studio_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teacher_profiles(id) on delete cascade,
  name text not null,
  birth_ymd date,
  birth_yymmdd_hmac text not null,
  age_group text not null default '',
  current_piece text not null default '',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.parents (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teacher_profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  parent_name text not null default '',
  phone_last4_hmac text not null,
  relation text not null default 'parent',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teacher_profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  period_name text not null,
  period_start date not null,
  period_end date not null,
  total_lessons integer not null default 0,
  completed_pieces integer not null default 0,
  current_piece text not null default '',
  scores_json jsonb not null default '{}'::jsonb,
  focus_tags_json jsonb not null default '[]'::jsonb,
  strengths text not null default '',
  growth_area text not null default '',
  home_support text not null default '',
  practice_plan text not null default '',
  daily_minutes integer not null default 0,
  daily_reps integer not null default 0,
  teacher_summary text not null default '',
  status report_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.report_links (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teacher_profiles(id) on delete cascade,
  report_id uuid not null references public.reports(id) on delete cascade,
  parent_id uuid references public.parents(id) on delete set null,
  token_hash text not null unique,
  pin_hash text not null,
  max_attempts integer not null default 5,
  failed_attempts integer not null default 0,
  locked_until timestamptz,
  expires_at timestamptz not null,
  last_success_at timestamptz,
  last_failed_at timestamptz,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table public.parent_report_sessions (
  id uuid primary key default gen_random_uuid(),
  report_link_id uuid not null references public.report_links(id) on delete cascade,
  report_id uuid not null references public.reports(id) on delete cascade,
  parent_id uuid references public.parents(id) on delete set null,
  session_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.report_access_logs (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references public.teacher_profiles(id) on delete cascade,
  report_id uuid references public.reports(id) on delete cascade,
  report_link_id uuid references public.report_links(id) on delete set null,
  event_type text not null,
  success boolean not null default false,
  failure_reason_code text,
  ip_hmac text,
  user_agent_truncated text,
  created_at timestamptz not null default now()
);

create index students_teacher_id_idx on public.students(teacher_id);
create index parents_teacher_student_idx on public.parents(teacher_id, student_id);
create index reports_teacher_student_idx on public.reports(teacher_id, student_id);
create index report_links_token_hash_idx on public.report_links(token_hash);
create index report_access_logs_report_id_idx on public.report_access_logs(report_id);

alter table public.teacher_profiles enable row level security;
alter table public.students enable row level security;
alter table public.parents enable row level security;
alter table public.reports enable row level security;
alter table public.report_links enable row level security;
alter table public.parent_report_sessions enable row level security;
alter table public.report_access_logs enable row level security;

create policy "teachers can manage own profile"
on public.teacher_profiles
for all
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "teachers can manage own students"
on public.students
for all
to authenticated
using ((select auth.uid()) = teacher_id)
with check ((select auth.uid()) = teacher_id);

create policy "teachers can manage own parents"
on public.parents
for all
to authenticated
using ((select auth.uid()) = teacher_id)
with check ((select auth.uid()) = teacher_id);

create policy "teachers can manage own reports"
on public.reports
for all
to authenticated
using ((select auth.uid()) = teacher_id)
with check ((select auth.uid()) = teacher_id);

create policy "teachers can manage own report links"
on public.report_links
for all
to authenticated
using ((select auth.uid()) = teacher_id)
with check ((select auth.uid()) = teacher_id);

create policy "teachers can view own access logs"
on public.report_access_logs
for select
to authenticated
using ((select auth.uid()) = teacher_id);

create or replace function public.increment_report_link_failure(
  p_link_id uuid,
  p_locked_until timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.report_links
  set
    failed_attempts = failed_attempts + 1,
    last_failed_at = now(),
    locked_until = p_locked_until
  where id = p_link_id;
end;
$$;

revoke all on function public.increment_report_link_failure(uuid, timestamptz) from public;
revoke all on function public.increment_report_link_failure(uuid, timestamptz) from anon;
revoke all on function public.increment_report_link_failure(uuid, timestamptz) from authenticated;

