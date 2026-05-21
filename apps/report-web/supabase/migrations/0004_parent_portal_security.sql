update public.parent_portal_links
set revoked_at = now()
where expires_at is null
  and revoked_at is null;

alter table public.parent_portal_links
  alter column expires_at set default (now() + interval '730 days');

update public.parent_portal_links
set expires_at = now() + interval '730 days'
where expires_at is null;

alter table public.parent_portal_links
  alter column expires_at set not null;

create index if not exists parent_portal_links_teacher_student_active_idx
on public.parent_portal_links(teacher_id, student_id, created_at desc)
where revoked_at is null;

grant execute on function public.increment_report_link_failure(uuid, timestamptz) to service_role;
grant execute on function public.increment_parent_portal_link_failure(uuid, timestamptz) to service_role;

drop policy if exists "teachers can manage own parents" on public.parents;
create policy "teachers can manage own parents"
on public.parents
for all
to authenticated
using ((select auth.uid()) = teacher_id)
with check (
  (select auth.uid()) = teacher_id
  and exists (
    select 1
    from public.students
    where students.id = parents.student_id
      and students.teacher_id = (select auth.uid())
  )
);

drop policy if exists "teachers can manage own reports" on public.reports;
create policy "teachers can manage own reports"
on public.reports
for all
to authenticated
using ((select auth.uid()) = teacher_id)
with check (
  (select auth.uid()) = teacher_id
  and exists (
    select 1
    from public.students
    where students.id = reports.student_id
      and students.teacher_id = (select auth.uid())
  )
  and (
    reports.academic_period_id is null
    or exists (
      select 1
      from public.academic_periods
      where academic_periods.id = reports.academic_period_id
        and academic_periods.teacher_id = (select auth.uid())
    )
  )
);

drop policy if exists "teachers can manage own report links" on public.report_links;
create policy "teachers can manage own report links"
on public.report_links
for all
to authenticated
using ((select auth.uid()) = teacher_id)
with check (
  (select auth.uid()) = teacher_id
  and exists (
    select 1
    from public.reports
    where reports.id = report_links.report_id
      and reports.teacher_id = (select auth.uid())
  )
  and (
    report_links.parent_id is null
    or exists (
      select 1
      from public.parents
      where parents.id = report_links.parent_id
        and parents.teacher_id = (select auth.uid())
    )
  )
);

drop policy if exists "teachers can manage own parent portal links" on public.parent_portal_links;
create policy "teachers can manage own parent portal links"
on public.parent_portal_links
for all
to authenticated
using ((select auth.uid()) = teacher_id)
with check (
  (select auth.uid()) = teacher_id
  and exists (
    select 1
    from public.students
    where students.id = parent_portal_links.student_id
      and students.teacher_id = (select auth.uid())
  )
  and (
    parent_portal_links.parent_id is null
    or exists (
      select 1
      from public.parents
      where parents.id = parent_portal_links.parent_id
        and parents.teacher_id = (select auth.uid())
    )
  )
);
