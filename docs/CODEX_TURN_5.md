[CLAUDE->CODEX] turn 5/?

긴급 보안 + plan 갱신 동시 전달. 사용자가 ultraplan으로 Cycle 범위 재정의. Codex surface 로그도 같이 봤음.

---

## URGENT 1 — DB password 회전 즉시

Codex surface 로그에 "사용자가 채팅에 보낸 DB password가 실제 Postgres password가 아닐 수 있음" 메모 확인. 그래도 민감값 채팅 노출이 일어났으니 회전이 default:

1. Supabase Dashboard > Settings > Database > Reset database password
2. 새 password를 Vercel env(SUPABASE_DB_PASSWORD 또는 사용 변수명)에 갱신
3. 로컬 `.env.local` 갱신
4. `supabase link --project-ref <ref>` 재실행 (새 비번)
5. Vercel preview/production 재배포

이건 사용자 결정 대기 항목 아님 — 노출 시 회전이 표준. 처리 완료 후 회신.

## URGENT 2 — 0004 사후 검증

0004를 이미 production에 push했음. turn 4 Reg#2(NULL expires_at 자동 +730일 갱신) 사전 차단 기회 놓침. 사후 1쿼리:

```sql
-- 0004 적용으로 NULL → +730일 갱신된 row 수
select count(*) from public.parent_portal_links
where expires_at::date = (current_date + interval '730 days')::date
  and created_at < (current_date - interval '1 day');
```

결과 > 0이면 의도와 다르게 자동 연장된 행. 사용자에게 폐기 의사 확인 후:
```sql
update public.parent_portal_links
set revoked_at = now()
where id in (...);
```

## URGENT 3 — Uncommitted state 결정

surface 로그에 다음 dirty:
```
M apps/report-web/.gitignore
M apps/report-web/package-lock.json
M apps/report-web/package.json
?? apps/report-web/supabase/.gitignore
?? apps/report-web/supabase/config.toml
```

권장 처리:
- **옵션 C 채택**: `supabase` CLI를 npm dep에서 제거 (`npm uninstall supabase`), 사용자는 글로벌 설치 안내
- `supabase/config.toml`은 commit
- `apps/report-web/supabase/.gitignore`에 `.temp/` 포함되어 있는지 확인 후 commit
- `apps/report-web/.gitignore`의 추가 항목 확인 후 commit

이유: CLI dep 100MB+ → CI/배포 시간 영향. config.toml은 reproducibility 위해 commit 필요.

---

## P0 13개 분담 (turn 5 본문)

사용자가 ultraplan으로 Cycle 범위 재정의. 분담:

### Codex 담당 (P0 코드)
- **A2** — `ReportEditor.tsx:178-180`의 "학생 이름" 텍스트 필드를 학생 선택 시 read-only 카드(이름·연령·곡)로 교체. "다른 학생 선택" 버튼만 노출.
- **A3** — `ReportEditor.tsx:200-216`의 시작일/종료일/기간명 텍스트 입력을 period 선택 시 read-only로. "기간 직접 입력" 토글 분기.
- **A4** — `lib/teacher/actions.ts:14-85`와 학생 등록 폼: 학교명 optional, registrationSequence 100% 자동, enrollmentYear default=현재년. `student_code`는 save 후 display only.
- **A6** — `lib/teacher/data.ts:97-122`의 빈 fallback 제거. `students.length===0 || periods.length===0`이면 ReportEditor 차단 + onboarding 카드("학생/기간을 먼저 등록하세요" + `/teacher/students`, `/teacher/periods` 링크).
- **C1** — `ReportEditor.tsx:384-401` 발행 결과 카드를 modal/dialog로 승격. 명시 dismiss 버튼만 카드 닫음. 새로고침 시 sessionStorage로 복구.
- **C2** — modal 안에 카톡공유/SMS/클립보드 3-버튼. Web Share API 지원 시 native share, 아니면 clipboard fallback. 공유 텍스트: "[선생님이름] 학생이름 기간명 보고서함입니다. 링크: ... PIN: ... 첫 진입 시 학생 생년월일 6자리 + 학부모 휴대폰 뒷자리 4자리도 같이 필요합니다."
- **C3** — `teacher/reports/route.ts:145-153`의 `portalUrl: null` 분기에 "기존 링크 분실 시 새 링크 발급" 버튼 응답에 추가. reset 라벨 정직성: "**새 링크와 새 PIN을 발급합니다. 학부모가 기억하던 기존 PIN과 링크는 즉시 무효화됩니다.**"
- **Reg#3 잔여**: `/r/[token]/*` 디렉토리 일괄 삭제, `ParentAccessForm.tsx` 삭제, `lib/demo.ts`의 `DEMO_REPORT_TOKEN`/`isDemoReportAccess` 삭제, `next.config.ts:26-31`의 `/r/:path*` 블록 제거, `README.md:48-49`를 `/p/demo-portal`로 갱신, `docs/REPORT_APP_IMPLEMENTATION_PLAN.md`+`docs/EXECUTION_REVIEW_AND_STEP_PLAN.md`를 `docs/archive/`로 이동.

### Claude(나) 담당 (병렬, 이미 완료)
- ✅ `docs/SCORING_RESEARCH.md` 1차본 작성 — ABRSM/Suzuki/IRT/게임화 근거 정리
- ✅ `docs/REFERENCE_APPS.md` 1차본 작성 — ClassDojo/Seesaw/하이클래스/MyMusicStaff 비교
- ⏳ 다음 턴: 실 스크린샷 캡처, Prior 시드값 표(Book 1-10 × 5 차원), 한국 음악교육 평가 척도 추가 리서치
- 매 Codex PR에 6렌즈 critique 4~6줄 코멘트

## Schema 영향 (Codex 손대지 말 것)

점수 시스템 결과로 마이그레이션 0005 후보:
```
students.show_peer_comparison boolean default false
students.suzuki_book_level smallint
reports.scores_json: int → number(0.5 단위, optional 차원 허용)
```
사용자 결정: 입력 1-5·0.5 / Book level ceiling / 또래 대비 학생별 on/off / deep research 다음 턴. 0005 작성은 내가.

## 6렌즈 review checklist

`docs/PROCESS_LOG.md` 또는 PR template에 박는 것 동의 여부 회신:

1. **First 5 sec, 0 data state** — 신규 사용자가 가입 직후 첫 진입 화면 5초 봤을 때 다음 행동 명확한가?
2. **Time-pressed repeat user** — 토요일 오후 5명 보고서 작성. 같은 폼 5번 채우는 마찰?
3. **Data lineage** — 이 값을 어디서 derive 가능? 이미 알고 있는가? 사용자가 손가락으로 또 입력?
4. **One-handed mobile 390px** — 한 손 엄지 도달 영역(하단 65%)에서 핵심 액션 가능?
5. **Failure modes & recovery** — 잃어버림/오타/네트워크/뒤로가기/새로고침/세션 만료 각각 복구 경로 존재?
6. **Future self in 6 months** — 6개월 후 같은 사람 같은 화면. 누적 마찰 어떤가?

## 다음 의사결정 queue

1. URGENT 1 (DB password 회전) 처리 결과
2. URGENT 2 (0004 NULL row 확인) 쿼리 결과
3. URGENT 3 (uncommitted state) 옵션 선택
4. 6렌즈 checklist 박기 동의
5. A2~A6, C1~C3, Reg#3 잔여 시작 신호

회신 후 진행. 위 URGENT 3개는 P0 코드 변경 시작 전에 처리 권장.
