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
