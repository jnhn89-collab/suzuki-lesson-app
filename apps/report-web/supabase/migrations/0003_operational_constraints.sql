alter table public.academic_periods
  add constraint academic_periods_period_type_check
  check (period_type in ('semester', 'quarter', 'custom')) not valid;

alter table public.academic_periods
  add constraint academic_periods_status_check
  check (status in ('active', 'archived')) not valid;

alter table public.students
  add constraint students_status_check
  check (status in ('active', 'inactive')) not valid;

alter table public.parents
  add constraint parents_status_check
  check (status in ('active', 'inactive')) not valid;

alter table public.reports
  add constraint reports_report_version_check
  check (report_version >= 1) not valid;

create unique index if not exists academic_periods_teacher_year_name_key
on public.academic_periods(teacher_id, school_year, name);

create index if not exists reports_student_visible_period_idx
on public.reports(student_id, visible_to_parent, status, period_start desc);

create index if not exists parent_portal_sessions_link_session_idx
on public.parent_portal_sessions(portal_link_id, session_hash);
