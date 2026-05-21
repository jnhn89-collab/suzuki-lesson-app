-- Stream B 본 PR 진입 준비:
-- 기존 6차원(posture·intonation·rhythm·tone·bow·musicality) scores_json을
-- 새 5차원(intonation·rhythm·tone·musicality·technique)으로 backfill.
-- technique = posture와 bow의 평균(한쪽만 있으면 그쪽 값). 둘 다 없으면 null.
-- 0005가 먼저 적용되어야 하며 (suzuki_book_level / show_peer_comparison 컬럼이 있음을 가정),
-- 이 migration은 read 경로가 새 키를 기대하기 직전에 적용되어야 한다.
-- 멱등: posture/bow 키가 이미 없으면 매칭되지 않아 재실행 안전.

update public.reports
set scores_json = jsonb_build_object(
  'intonation',
  case when scores_json ? 'intonation' then (scores_json->>'intonation')::numeric else null end,
  'rhythm',
  case when scores_json ? 'rhythm' then (scores_json->>'rhythm')::numeric else null end,
  'tone',
  case when scores_json ? 'tone' then (scores_json->>'tone')::numeric else null end,
  'musicality',
  case when scores_json ? 'musicality' then (scores_json->>'musicality')::numeric else null end,
  'technique',
  case
    when (scores_json ? 'posture') and (scores_json ? 'bow') then
      round(
        ((scores_json->>'posture')::numeric + (scores_json->>'bow')::numeric) / 2.0,
        1
      )
    when scores_json ? 'posture' then (scores_json->>'posture')::numeric
    when scores_json ? 'bow' then (scores_json->>'bow')::numeric
    else null
  end
)
where scores_json ? 'posture' or scores_json ? 'bow';

-- 검증 쿼리 (선택):
-- select id, scores_json from public.reports where scores_json ? 'posture' or scores_json ? 'bow';
-- 위 쿼리가 0건이면 backfill 완료.
