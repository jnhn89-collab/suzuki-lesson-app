-- Stream A 점수 시스템 v2: Book-aware rubric + 또래 대비 옵션 + 0.5 단위 입력
-- 근거: docs/SCORING_RESEARCH.md (PubMed PMC11496144 시스템 리뷰, Reddesert Suzuki↔ABRSM 매핑)

alter table public.students
  add column if not exists suzuki_book_level smallint,
  add column if not exists show_peer_comparison boolean;

update public.students
set show_peer_comparison = false
where show_peer_comparison is null;

alter table public.students
  alter column show_peer_comparison set default false,
  alter column show_peer_comparison set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'students_suzuki_book_level_check'
      and conrelid = 'public.students'::regclass
  ) then
    alter table public.students
      add constraint students_suzuki_book_level_check
      check (suzuki_book_level is null or (suzuki_book_level between 1 and 10)) not valid;
  end if;
end $$;

-- Stream B 계획: scores_json 형식은 int → numeric 0.5 단위 + nullable per dimension으로 확장 예정.
-- 현재 마이그레이션은 학생별 Book level/또래 대비 설정만 추가하고, 보고서 점수 구조는 앱 스키마 일괄 변경 때 처리한다.

-- N/A 차원 표시 규약: scores_json[dim] === null 또는 키 부재
-- Book 1-2의 음악성 등은 N/A 권장. UI는 N/A를 종합 점수 분모에서 제외.

-- Prior 시드값은 코드 상수(@/lib/scoring/priors)로 시작. 학원 데이터 N≥10 후 admin UI + DB table 승격.

-- 인덱스: Book level별 통계 쿼리 가속
create index if not exists students_book_level_idx
on public.students(teacher_id, suzuki_book_level)
where suzuki_book_level is not null and status = 'active';
