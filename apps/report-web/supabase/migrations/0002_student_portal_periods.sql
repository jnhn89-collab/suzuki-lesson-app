alter table public.students
  add column if not exists school_name text not null default '',
  add column if not exists enrollment_year integer,
  add column if not exists registration_year integer,
  add column if not exists registration_sequence integer,
  add column if not exists student_code text,
  add column if not exists notes text not null default '';

create unique index if not exists students_teacher_student_code_key
on public.students(teacher_id, student_code)
where student_code is not null;

create table if not exists public.academic_periods (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teacher_profiles(id) on delete cascade,
  name text not null,
  period_type text not null default 'semester',
  starts_on date not null,
  ends_on date not null,
  school_year integer,
  sort_order integer not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint academic_periods_valid_range check (starts_on <= ends_on)
);

alter table public.reports
  add column if not exists academic_period_id uuid references public.academic_periods(id) on delete set null,
  add column if not exists report_version integer not null default 1,
  add column if not exists visible_to_parent boolean not null default false;

create table if not exists public.parent_portal_links (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teacher_profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  parent_id uuid references public.parents(id) on delete set null,
  token_hash text not null unique,
  pin_hash text not null,
  max_attempts integer not null default 5,
  failed_attempts integer not null default 0,
  locked_until timestamptz,
  expires_at timestamptz,
  last_success_at timestamptz,
  last_failed_at timestamptz,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table if not exists public.parent_portal_sessions (
  id uuid primary key default gen_random_uuid(),
  portal_link_id uuid not null references public.parent_portal_links(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  parent_id uuid references public.parents(id) on delete set null,
  session_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists academic_periods_teacher_idx
on public.academic_periods(teacher_id, starts_on desc);

create index if not exists reports_student_period_idx
on public.reports(student_id, period_start desc);

create index if not exists parent_portal_links_token_hash_idx
on public.parent_portal_links(token_hash);

create index if not exists parent_portal_links_student_idx
on public.parent_portal_links(student_id);

alter table public.academic_periods enable row level security;
alter table public.parent_portal_links enable row level security;
alter table public.parent_portal_sessions enable row level security;

create policy "teachers can manage own academic periods"
on public.academic_periods
for all
to authenticated
using ((select auth.uid()) = teacher_id)
with check ((select auth.uid()) = teacher_id);

create policy "teachers can manage own parent portal links"
on public.parent_portal_links
for all
to authenticated
using ((select auth.uid()) = teacher_id)
with check ((select auth.uid()) = teacher_id);

create or replace function public.increment_parent_portal_link_failure(
  p_link_id uuid,
  p_locked_until timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.parent_portal_links
  set
    failed_attempts = failed_attempts + 1,
    last_failed_at = now(),
    locked_until = p_locked_until
  where id = p_link_id;
end;
$$;

revoke all on function public.increment_parent_portal_link_failure(uuid, timestamptz) from public;
revoke all on function public.increment_parent_portal_link_failure(uuid, timestamptz) from anon;
revoke all on function public.increment_parent_portal_link_failure(uuid, timestamptz) from authenticated;

