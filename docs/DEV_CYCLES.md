# Development Cycles

Working branch: `dev`

Production branch target: `main`

## Intent

최종 목적은 선생님이 웹에서 학생/기간을 선택해 평가를 입력하고, 학부모가 외부 URL에서 보호자 인증 후 여러 학기/분기 보고서를 모바일 또는 PDF로 확인하는 것이다. 개발은 "실제 보고서 1건이 학부모 손에 들어가는 거리"를 줄이는 순서로 진행한다.

## Dev 1: Golden Path Hardening

Goal: 선생님 작성 -> 보고서 발행 -> 학부모 보고서함 인증 -> 기간별 보고서 열람 -> PDF 저장의 기본 경로를 막는 문제를 제거한다.

Scope:

- 부모 포털 URL에서 DB UUID를 노출하지 않는 opaque token으로 변경.
- 학생별 보고서함 링크를 기본으로 유지하고, 보고서마다 PIN을 새로 만들지 않는다.
- 링크 만료 기본값, no-store/noindex 보안 헤더, service-role 서버 전용 import를 추가.
- 부모 인증 화면의 데모 인증값은 데모 토큰에서만 보인다.
- "학생 포털", "DB 저장", "draft" 같은 운영에 어색한 문구를 "학부모 보고서함", "보고서 저장", "임시 저장"으로 정리.
- 작성 화면에 PDF에 쓰이는 하루 연습 분/반복 횟수 입력을 노출.

Gate:

- `npm run lint`
- `npm run typecheck`
- 390px/430px/768px/1440px 모바일/데스크톱 시각 점검
- 실제 Preview URL에서 보호자 인증 실패/성공/보고서 목록/상세/PDF 저장 확인
- Supabase migration `0004_parent_portal_security.sql` 적용 확인

## Dev 2: Teacher Operations

Goal: 한 학생이 아니라 여러 학생과 여러 기간을 반복 운영할 수 있게 한다.

Scope:

- 기간 템플릿: 1학기, 2학기, 1-4분기, 방학특강, 커스텀.
- 기간 대시보드: 학생 x 보고서 상태, 누락 보고서, 최근 발행일.
- 보고서 목록/상세/수정/비공개/폐기 flow.
- 이전 보고서 복사, 임시 저장, 자동 저장 상태.
- 프리셋 검색, 이미 추가됨 표시, 되돌리기, 기술/연령/Book 단계 필터.

Gate:

- 선생님이 10명 학생에 대해 한 기간 보고서 생성 상태를 한 화면에서 판단 가능.
- 같은 학생의 여러 기간 보고서가 학부모 보고서함에 최신순으로 정렬.
- 긴 한글 이름, 긴 학교명, 긴 기간명, 긴 문장에서도 모바일/인쇄 레이아웃 깨짐 없음.
- Draft/publish/revoke의 DB 상태 전이가 테스트로 확인됨.

## Dev 3: Security, Data, And Quality Harness

Goal: 외부에 실제로 쓰기 전에 보안·개인정보·품질 게이트를 자동화한다.

Scope:

- 학생+학부모 생성, 보고서+포털 발행을 Supabase RPC transaction으로 이동.
- RLS 테스트: 교사 A가 교사 B의 학생/부모/기간/보고서를 참조해 insert/update할 수 없음.
- parent verify rate limit를 원자적 증가로 고정하고 lockout UX 추가.
- 접근 로그: 성공/실패/잠금/만료/조회/PDF/링크 재발급.
- Playwright e2e: signup/login, student create, period create, publish, parent fail/success, report list/detail, print button.
- PDF A4 렌더 스모크와 axe accessibility check.

Gate:

- CI에서 lint/typecheck/unit/e2e/RLS/a11y가 모두 통과해야 Preview를 신뢰.
- service role import가 서버 전용 모듈 밖에서 발견되면 실패.
- 토큰, 생년월일, 전화번호, PIN 원문이 로그에 남지 않음.
- Vercel Preview는 `dev`, Production은 `main`만 사용.

## User Action Points

- Dev 1 Preview가 뜨면 실제 또는 mock 학생 1명으로 외부 URL 테스트를 한다.
- Supabase SQL editor 또는 CLI에서 migration 적용 상태를 확인한다.
- Vercel Preview/Production env에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PARENT_ACCESS_PEPPER`가 모두 있는지 확인한다.
- Dev 2 전에 실제 선생님 문장 20-30개, 익명 학부모 질문 10개를 제공하면 프리셋 품질이 크게 올라간다.

## Stream 모델 (Ultraplan 후 재구조화, 2026-05-21)

기존 Dev 1/2/3 cycle은 일정 기반이었음. Ultraplan 결정으로 stream 모델로 재구조화 — 6렌즈 자가 점검과 사용자 명시 요구를 기준으로 5개 stream을 병렬 또는 순차로 진행.

### Stream A — First-impression & data lineage (사용자 가장 강조)

- A1: `/teacher` 대시보드를 숫자 카운트 → "오늘 할 일 카드"로 교체
- A2: ReportEditor에서 학생 선택 후 "학생 이름" 텍스트 필드 제거 → read-only 카드
- A3: 기간 선택 후 시작/종료/기간명 필드 제거 → read-only, "직접 입력" 토글 분기
- A4: 학생 등록 폼에서 학교명/입학년도/등록순서 선택 입력 강등, registrationSequence 100% 자동
- A5: 학생 등록을 모바일에서 step 3개로 쪼개기 (선택)
- A6: 빈 students/periods 시 ReportEditor 차단 + onboarding 카드

### Stream B — Report writing 마찰 줄이기

- B1: 점수 패널 default-collapse
- B2: 점수 차원 6 → 5로 압축 (음정/박자/음색/음악성/자세활) — 0005 마이그레이션
- B3: 점수 버튼 터치 영역 44×44px 보장 + 0.5 단위 입력
- B4: 프리셋 카테고리 4개로 정리
- B5: textarea 자동 저장 (debounce 800ms localStorage)
- B6: 보고서 DB draft 분기 (`intent: "draft"|"publish"`)

### Stream C — Publish/link/PIN 신뢰성

- C1: 발행 결과를 modal로 승격, 명시 dismiss만 닫음
- C2: 카톡 공유/SMS/클립보드 3-버튼 (Web Share API + fallback)
- C3: reset 라벨 정직성 ("기존 학부모에게 전달한 링크와 PIN은 즉시 무효화됩니다")
- C4: 학생 상세 페이지 `/teacher/students/[id]` — 보고서 history + token rotate/pin rotate 분리
- C5: 카톡 발송 템플릿 자동 생성 (선생님 이름·학생 이름·기간·링크·PIN·인증 안내 한 줄)

### Stream D — 학부모 모바일 경험 폴리시

- D1: 학부모 인증 페이지 상단에 선생님 이름·스튜디오명·발송일 노출
- D2: 인증 후 "홈 화면에 추가" PWA 안내
- D3: PDF 파일명 `[학생이름]_[기간명]_보고서.pdf`
- D4: 점수 마이크로 카피 "또래 대비가 아닌 이번 기간 관찰 결과" + 학생별 또래 대비 on/off
- D5: 한 학생 보고서 2건+ 시 "기간 비교" 1줄
- D6: 다음 보고서 발행 시 알림 (이메일 또는 Web Push)

### Stream E — 운영/신뢰

- E1: 학생/보고서 CSV/JSON 내보내기
- E2: 발행 후 수정 정책 명시 (학부모가 보는 본은 즉시 갱신)
- E3: 비밀번호 재설정 / OTP 로그인
- E4: Playwright e2e 1건 (보고서 1건 = 1 PR 시나리오)

### 우선순위

- **P0**: A2, A3, A4, A6, C1, C2, C3 — 사용자 명시 + turn 4 회귀 사후
- **P1**: A1, B1, B5, C4, C5, D1, D3
- **P2**: A5, B2~B4, B6, D2, D4~D6
- **P3**: E1~E4

### Stream 분담 (Claude/Codex)

- **Codex**: A2~A6, C1~C3 코드 변경
- **Claude**: 점수 시스템 (B2 schema 0005, priors.ts, deep research), Reference apps 비교, PR critique
- 매 PR마다 docs/PR_CHECKLIST.md 6렌즈 통과 메모 필수
