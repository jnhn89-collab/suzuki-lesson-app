# Process Log

## 2026-05-21

### Harness

- Current cmux workspace: `workspace:7`
- Codex surface: `surface:21`
- Claude surface: `surface:20`
- Communication rule file updated: `COMMUNICATION_RULE.md`
- Working branch: `dev`
- Remote: `origin/dev`

### Claude Cross-Review

Claude's first critique was that the requested persona/factbook/fanout workflow can become too large for the current repo. The useful correction was to pin Dev 1 to a golden path spike: teacher creates one real report, parent opens it from an external URL, and PDF/mobile viewing works.

Accepted adjustments:

- Keep research/persona records because the user explicitly requested them.
- Compress planning docs into `docs/FACTBOOK.md`, `docs/DEV_CYCLES.md`, `docs/PROCESS_LOG.md`.
- Put structured source/persona/use-case data under `data/research`.
- Do not let research delay Dev 1 blockers.

### Subagent Findings Integrated

UX/content:

- Report creation is too manual and lacks draft/update/copy.
- Presets need search, already-added state, filters, and paired suggestions.
- Production copy should not say `DB 저장`, `draft`, or "학생 포털" when the real audience is parents.
- Demo credentials should not render on production-token parent forms.
- Parent portal is really a guardian report archive, so "학부모 보고서함" is clearer.

Security/QA:

- Portal tokens exposed DB UUIDs through `pl_<uuid>`.
- Portal links had nullable expiry.
- Service-role parent reads need explicit tenant checks.
- Failure counting should use atomic DB functions.
- RLS must verify related row ownership, not only `teacher_id`.
- CI/e2e/RLS/a11y/PDF checks are missing.

Architecture:

- Current implemented flow exists but is insert-only and publish-immediate.
- Teacher pages still fall back to demo data in signed-out states.
- Student+parent and report+portal writes are not transactional.
- `/p/:token` is the real parent portal. The legacy `/r/:token` single-report demo was removed from the app.

### Dev 1 Changes Started

- Replaced generated portal tokens with random opaque tokens.
- Stopped token lookup by DB ID; parent portal now looks up only by token hash.
- Added tenant checks to parent portal service-role queries.
- Added default two-year portal link expiry and stronger RLS policy migration.
- Hid demo credentials outside demo parent routes.
- Renamed parent-facing UI from "학생 포털" to "학부모 보고서함".
- Added security headers for noindex/no-store/referrer/frame/content-type.
- Added Korean webfont imports for Pretendard/SUIT.
- Exposed daily practice minutes/reps in the report editor.
- Removed the legacy `/r` single-report demo route so the operational path is `/p/:token`.
- Claude regression review caught a migration issue: `expires_at = null` legacy links must be revoked, not silently extended. `0004` and app null-expiry handling were corrected.

### Next Checks

- `npm run lint -- --no-cache`: passed.
- `npm run typecheck -- --incremental false`: passed.
- `npm run build`: passed.
- Runtime smoke on `next start -p 3001`: `/`, `/teacher`, `/p/demo-portal` returned 200; `/p/demo-portal/reports` redirects to auth before cookie; demo verify returns 303 with scoped cookie.
- After removing `/r`, `.next` cache was cleared and `npm run lint`, `npm run typecheck`, `npm run build` passed again. Build route list now includes only `/p` parent routes.
- Existing-link regression was corrected: when a report is added for a student with an active report함 link, the app issues a fresh opaque URL that keeps the existing PIN; reset revokes other active links and creates a new PIN.
- `supabase` CLI is not installed locally, so migration `0004_parent_portal_security.sql` still needs Supabase project application/verification.

### Dev 2 Changes

- Added quick period registration templates for the current Korean school-year flow: 1학기, 2학기, 1-4분기.
- Split period registration into "빠른 기간 등록" and "직접 기간 등록" so teachers do not have to type common dates repeatedly.

### Dev 3 Changes

- Added `npm run quality`.
- The quality gate verifies research data counts, source/use-case data, core docs, removal of `/r`, opaque token structure, and presence of migration `0004`.
- Dev 2/3 validation: `npm run quality`, `npm run lint -- --no-cache`, `npm run typecheck -- --incremental false`, and `npm run build` passed.
- Read Claude's blocker list once it finishes.
- Push `dev` after checks pass, then verify Vercel Preview from the external URL.

### Claude Turn 4 회귀 검토

- Reg#1 (opaque token 2번째 발행 시 portalUrl=null) — Codex가 route.ts에서 fresh 링크 발급 + 기존 PIN 유지 패턴으로 수정 완료. resetPortalPin=true 분기에서만 PIN 회전 + 기타 active 링크 revoke.
- Reg#2 (0004 NULL expires_at 자동 +730일) — 0004는 production 적용 완료. 사후 검증 쿼리 대기.
- Reg#3 (/r/[token] dead code) — Codex가 디렉토리 + ParentAccessForm + demo report 상수 + next.config /r 블록 + README 안내 일괄 삭제 완료.

### Ultraplan 결정 사항 (Claude turn 5 + 사용자 결정)

- Cycle 모델 → Stream 모델로 전환 (DEV_CYCLES.md §Streams).
- 6렌즈 PR self-review checklist 도입 (docs/PR_CHECKLIST.md).
- 점수 시스템 재설계 결정:
  - 입력 1-5 · 0.5 단위 (9-point)
  - 표시 0-100 derive (anchor=60)
  - 또래 대비는 학생별 on/off
  - Book level별 ceiling 도입
  - 차원 6 → 5 압축 (음정/박자/음색/음악성/자세활) — ABRSM 5차원 매핑 + PubMed PMC11496144 빈도 top 5

### Claude Turn 5 자율 진행 작업

- `docs/SCORING_RESEARCH.md` v2 (PubMed 시스템 리뷰, Suzuki↔ABRSM/RCM/ASTA 매핑, Bregman 단계별 timeline, KCI 한국 루브릭 방법론, Prior 시드값 표 v1, Book 1-10 ceiling 설계).
- `docs/REFERENCE_APPS.md` 1차본 (ClassDojo/Seesaw/하이클래스/MyMusicStaff 비교, Stream 매핑).
- `docs/PR_CHECKLIST.md` 6렌즈 self-review template.
- `apps/report-web/supabase/migrations/0005_scoring_v2.sql` 작성 (대기, Codex DB 적용 결정 시).
- `apps/report-web/src/lib/scoring/priors.ts` Prior 상수 + derive/peerMean/overall 유틸.

### URGENT Queue (Codex 처리 대기)

- DB password 회전 후 새 비번 Vercel env 갱신
- 0004 NULL row 사후 검증 쿼리 실행 결과
- supabase npm dep 제거 (옵션 C 동의됨)

### Claude Turn 7 — P0 코드 변경 자율 진행 (사용자 위임)

사용자가 "끝까지 다해 알아서" 위임. Codex는 URGENT 대기 중이므로 P0 코드 변경 7개 항목 Claude가 인계 처리.

- **A2** — `ReportEditor.tsx` 학생 선택 시 별도 "학생 이름" 텍스트 입력 제거 → 선택 select + read-only 카드(이름·연령대) 한 쌍.
- **A3** — period 선택 시 시작/종료/기간명 inputs 제거 → read-only 카드 + "기간 직접 입력으로 전환" 토글. 직접 입력 모드에선 다시 inputs 노출 + "등록된 기간 선택으로 돌아가기" 토글.
- **A4** — `teacher/students/page.tsx` 학교명/입학연도/등록연도/등록순번을 `<details>` "학교·등록 정보 (선택)"로 collapse. 기본 폼은 필수 6개만 (이름·생일·학부모·휴대폰뒷4·나이대·현재진도). 학교명 zod schema에서 `min(1)` 제거 → 비우면 `buildStudentCode`가 "STUDIO" fallback.
- **A6** — `teacher/reports/new/page.tsx` context.ready + (students=[] or periods=[]) 시 ReportEditor 차단 + onboarding 카드 (학생 등록·기간 등록 액션 링크 + ✓ 완료 표시).
- **C1** — `ReportEditor.tsx` 발행 결과를 `PublishResultModal`로 승격. fixed inset-0 backdrop + 명시 dismiss + sessionStorage 영속화로 새로고침 복구. 카드 dismiss는 "나중에" 또는 "확인 — 학부모에게 전달했어요" 버튼만.
- **C2** — modal 안에 학부모 전달 메시지 자동 생성 (선생님·학생·기간·링크·PIN·인증 안내). 4-버튼: 카톡/메시지 공유 (Web Share API), 전체 메시지 복사, 링크만 복사, SMS 앱 (`sms:?body=...`). Web Share 미지원 시 자동 clipboard fallback. PIN 표시 시 "이 PIN과 링크는 지금만 표시됩니다" 경고.
- **C3** — reset 체크박스 라벨 정직성 ("새 링크와 새 PIN을 발급합니다. 기존 학부모에게 전달한 링크와 PIN은 즉시 무효화되니, 학부모가 분실했을 때만 사용해 주세요.")

### Stream B 사전 작업

- `apps/report-web/supabase/migrations/0005_scoring_v2.sql` — students.suzuki_book_level + show_peer_comparison 컬럼. DB 적용 대기.
- `apps/report-web/src/lib/scoring/priors.ts` — Prior μ 표(Book 1-10 × 5 차원), Book ceiling, deriveDisplayScore, peerMean (Bayesian blend), overallScore. 기존 코드 미연결 (활성화는 Stream B 본 PR).

### 검증

- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS (route list `/r` 없음, `/p` only)

### 6렌즈 자가 점검 (Turn 7 P0)

- **L1 (0 data)**: A6로 빈 students/periods 차단. 신규 가입자가 sampleStudent로 위장된 작성 화면 진입 불가. ✓
- **L2 (반복)**: A2/A3로 학생·기간 선택 시 폼 마찰 줄임. 토요일 5명 작성 시 학생당 추가 클릭 ≥3개 감소. ✓
- **L3 (lineage)**: A2(학생 이름 derive), A3(period 정보 derive), A4(registrationSequence 자동) 적용. ✓
- **L4 (모바일)**: 모달은 `inset-0 px-4 py-6` + `max-h-full overflow-auto`로 390px 키보드 시나리오 대응. 버튼은 stack grid로 도달 영역 충분. 자세 확인은 dev 서버에서 검증 필요. ⚠
- **L5 (복구)**: C1 sessionStorage로 새로고침 복구. 명시 dismiss만 카드 닫음. PIN 분실 경로 보존. ✓
- **L6 (6개월 후)**: A4 details collapse로 반복 학생 등록 시 인지 부하 ↓. C2 카톡 템플릿 자동 생성으로 매번 발송 문구 작성 마찰 ↓. ✓

### 알려진 후속 (P1 이후)

- L4 dev 서버 실 모바일 viewport 점검 필요
- 0005 DB 적용 후 점수 schema 재정의 (Stream B 본 PR)
- A1 대시보드 "오늘 할 일 카드"
- B1~B6 점수 입력 UX
- D1~D6 학부모 화면 폴리시
- E1~E4 운영 후속

### Codex Turn 8 — P0 리뷰 보강 및 커밋 준비

- `ReportEditor.tsx` 발행 결과 sessionStorage에 학생/기간/선생님 snapshot까지 저장하도록 보강. 새 보고서 작성/실패/새로고침에서 이전 링크·PIN이 다른 학생명으로 보이는 문제 방지.
- 수동 기간 입력 시 `academicPeriodId`를 보내지 않도록 수정. 등록 기간 선택 모드로 돌아갈 때 선택 기간 값을 다시 반영.
- 학생 변경 및 발행 성공 후 `resetPortalPin` 체크를 자동 해제해 다음 학생/다음 보고서에서 의도치 않게 기존 링크/PIN을 무효화하지 않도록 수정.
- 발행 결과 모달에 `role="dialog"`, `aria-modal`, label, 초기 focus, Escape 닫기를 추가.
- 학생 등록 액션에서 선택 입력(학교명/입학연도/등록연도/등록순번)이 비어도 현재연도/STUDIO/자동순번으로 처리되도록 서버 파싱 보강.
- `0005_scoring_v2.sql`는 DB 적용하지 않고 Stream B 준비물로 유지. partial state 대비 `show_peer_comparison` default/backfill/not-null 보강, constraint idempotency 보강, scoring JSON 변경 문구는 "후속 앱 스키마 변경 계획"으로 정리.
- Supabase local reset용 빈 `seed.sql` 추가. `.env*.local`과 `supabase/.temp`는 ignore 유지.

### Codex Turn 8 검증

- `git diff --check`: PASS
- `npm run lint -- --no-cache`: PASS
- `npm run typecheck -- --incremental false`: PASS
- `npm run quality`: PASS
- `npm run build`: PASS

### Codex Turn 8 배포 방침

- Vercel/Supabase CLI는 추가 사용하지 않음.
- `dev` 브랜치 push 후 GitHub 연동된 Vercel Preview가 자동 배포하는 방식으로 진행.
- `0005`는 아직 운영 DB에 push하지 않음. 현재 런타임은 0005 컬럼을 사용하지 않으므로 Preview 동작에는 영향 없음.

### Codex Turn 9 — D3 PDF 파일명

- `PrintButton`에 `fileName` prop 추가.
- 선생님 미리보기와 학부모 보고서 상세의 PDF 저장 흐름에서 출력 직전 document title을 `{학생명}_{기간명}_보고서`로 바꾸고 출력 후 원래 title로 복구.
- 브라우저의 "PDF로 저장" 기본 파일명이 더 알아보기 쉬운 한글 파일명으로 제안되도록 개선.

### Codex Turn 9 검증

- `npm run lint -- --no-cache`: PASS
- `npm run typecheck -- --incremental false`: PASS
- `npm run quality`: PASS
- `npm run build`: PASS

### Codex Turn 9 — D1 학부모 인증 발신자 맥락 + 모바일 QA

- `/p/[token]` 보호자 확인 페이지에 "보낸 곳" 카드 추가.
- 실제 토큰은 service-role로 유효한 portal link를 확인한 뒤 teacher profile의 선생님/스튜디오명과 링크 발송일만 표시.
- 인증 전에는 학생명, 생년월일, 전화 단서, 보고서 내용은 표시하지 않음.
- 데모 토큰은 샘플 선생님/스튜디오 맥락과 데모 안내 표시.
- Chrome CDP actual mobile viewport 390x844에서 `/teacher`, `/teacher/reports/new`, `/teacher/students`, `/p/demo-portal`, `/p/demo-portal/reports`, `/p/demo-portal/reports/demo-report-2026-spring` 모두 `scrollWidth=390` 확인.
- PDF button title swap 검증: 출력 순간 `김지우_이번_학기_보고서`, 출력 후 원래 title 복구.

### Codex Turn 9 추가 검증

- `npm run lint -- --no-cache`: PASS
- `npm run typecheck -- --incremental false`: PASS
- `npm run quality`: PASS
- `npm run build`: PASS

### Claude Turn 9 — Stream B 시안 트랙

- Codex가 D1을 진행 중인 동안 Claude는 충돌 회피를 위해 Stream B orphan 시안만 작업.
- `apps/report-web/src/components/scoring/HexRadar.tsx`
  - 5축 SVG radar, 4-ring grid, gradient fill.
  - 점수 미입력/N/A vertex 생략.
  - `aria-label` 지원.
- `apps/report-web/src/components/scoring/ScoreSliderRow.tsx`
  - 1-5점 0.5 단위 9-point 입력 버튼.
  - whole/half score 시각 차등, `aria-pressed`, optional N/A 버튼.
- `docs/STREAM_B_SKETCH.md`
  - schema/types/wire 순서, 결정 대기 항목, 리스크, 본 PR 진입 조건 정리.
- 두 컴포넌트는 routed page import 0인 orphan 상태. `0005` DB push와 schema/types 동시 변경 전까지 활성화하지 않음.
- Claude 검증: lint/typecheck/build PASS.

### Turn 9 통합 상태

- 최종 커밋 순서:
  - `672f854` A1 대시보드 TodayCard
  - `7f8ccbb` Stream B orphan 시안
  - `3a01e21` D1 학부모 인증 발신자 맥락
- `dev` push 완료. Vercel GitHub 연동 Preview는 push마다 자동 재배포 대상.

### Stream B Entry — User Decisions

- Legacy 6차원 → 5차원 backfill은 0005 적용과 동시에 진행.
- Book level 입력은 학생 상세 페이지에서 한 번 설정.
- Hex radar는 학부모 포털 카드와 보고서 상세 둘 다 표시.
- 0005 DB push는 지금 진행하기로 결정.

### Claude Turn 11/12

- `eb2f0f1`: `0006_scoring_dimension_backfill.sql` 추가.
  - legacy `posture` + `bow` 평균을 `technique`으로 변환.
  - `intonation`, `rhythm`, `tone`, `musicality`는 기존 값을 유지.
  - legacy key가 없으면 재실행 영향이 없는 멱등 backfill.
- `294f826`: scoring v2 타입/legacy mapper/schema 추가.
  - `lib/scoring/types.ts`: v2 `Scores`, nullable `ScoreValue`, legacy type.
  - `lib/scoring/legacy.ts`: `legacyToScores`, `coerceScores`.
  - `lib/report/schema.ts`: `scoreV2Schema` 추가.
- `419f4ac`: 학부모/보고서 화면 Stream B wiring.
  - `ReportDocument`: HexRadar + 5차원 bar.
  - `ParentPortalView`: 최신 보고서 StudentRadarCard.
  - legacy/v2 모두 `coerceScores`로 호환.

### Codex Turn 11 — Teacher Input, Settings, DB Status

- `ReportEditor` 점수 패널을 `ScoreSliderRow` 기반 5차원 0.5 단위 입력으로 전환.
- `musicality`는 N/A 허용.
- `reportStoreSchema`의 `scores`를 v2 schema로 전환.
- `/teacher/reports` POST에서 `coerceScores`를 먼저 적용해 legacy/v2 payload 모두 저장 가능하게 처리.
- `ReportData.scores`, sample content, score helper, portal normalize를 v2 nullable scores에 맞춤.
- `/teacher/students/[studentId]` 학생 상세 페이지 추가.
  - `suzuki_book_level` 설정.
  - `show_peer_comparison` 토글.
  - 학생 목록에서 상세 설정 링크 추가.
- DB push dry-run 결과:
  - 적용 대상은 `0005_scoring_v2.sql`, `0006_scoring_dimension_backfill.sql` 두 개만 확인.
- 실제 DB push는 `SUPABASE_DB_PASSWORD` 누락으로 blocked.
  - Supabase CLI temp login role 인증 실패 및 pooler circuit breaker 발생.
  - `SUPABASE_DB_PASSWORD` 설정 후 재시도 필요.
- `0004` NULL row verification도 현재 로컬 secret 값이 비어 있어 blocked.

### Codex Turn 11 검증

- `git diff --check`: PASS
- `npm run lint -- --no-cache`: PASS
- `npm run typecheck -- --incremental false`: PASS
- `npm run quality`: PASS
- `npm run build`: PASS

### Claude Turn 14 — Stream B Cross-Review

- `eb49692` pull 후 통합 `build/lint/typecheck` PASS.
- 6렌즈 리뷰 결과:
  - L1 학생 없음 `notFound()` 분기 OK.
  - L2 form prefill OK.
  - L3 teacher ownership + action zod UUID validation OK.
  - L4 모바일 시각 QA는 dev 환경에서 추가 확인 필요.
  - L5 malformed UUID URL이 Supabase error를 통해 500으로 갈 수 있는 edge case 확인.
  - L6 학생별 설정 copy는 반복 입력 부담을 늘리지 않음.

### Codex Turn 12 — Student Detail URL Guard

- `getTeacherStudentDetailData`에 UUID 사전 검증 추가.
- malformed `/teacher/students/[studentId]` URL은 Supabase query 전에 `student: null`로 반환되어 기존 `notFound()` 경로로 처리.
- `supabase db push --linked --dry-run` 재확인:
  - pending: `0005_scoring_v2.sql`
  - pending: `0006_scoring_dimension_backfill.sql`
- 실제 DB push와 `0004` NULL row verification은 여전히 `SUPABASE_DB_PASSWORD` 및 실 Supabase secret 부재로 blocked.

### Codex Turn 12 검증

- `npm run typecheck -- --incremental false`: PASS
- `npm run lint -- --no-cache`: PASS
- `npm run quality`: PASS
- `npm run build`: PASS
