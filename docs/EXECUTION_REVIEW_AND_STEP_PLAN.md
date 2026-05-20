# 실행 검토 및 세부 단계 계획서

## 1. 의도와 목적 재정의

최종 목적은 선생님이 웹에 접속해 분기 또는 학기 단위의 학생 성과보고서를 작성하고, 학부모에게 안전한 링크로 공유할 수 있는 서비스다. 학부모는 모바일에서 공유 URL을 열고, 학생 생년월일 6자리, 학부모 휴대폰 뒷자리 4자리, 보고서 PIN 또는 비밀번호를 입력한 뒤 학생 정보와 선생님 피드백 보고서를 볼 수 있어야 한다. 선생님과 학부모 모두 보고서를 모바일로 읽고 PDF로 저장할 수 있어야 한다.

현재 Google Apps Script 레슨 앱은 "당일 레슨 기록"에 맞는 기존 프로젝트로 유지한다. 새 성과보고서 웹앱은 "이번 분기/이번 학기 보고서"에 집중한다. 기존 Apps Script의 인증 구조나 PIN 해시 방식을 그대로 이식하지 않는다.

## 2. 목적 부합성 검토

사용자가 말한 요구와 본 계획의 대응은 다음과 같다.

| 사용자 요구 | 계획 반영 |
| --- | --- |
| 선생님이 웹에서 평가 입력 | Next.js 선생님 대시보드와 보고서 작성 화면 |
| 분기/학기 단위 보고서 | `period_name`, `period_start`, `period_end`, 누적 점수/피드백 구조 |
| 생성된 보고서 링크 공유 | `report_links`의 랜덤 토큰 기반 공유 URL |
| 링크만으로 접근 불가 | 학부모 인증 화면을 먼저 노출 |
| 학생 생년월일 6자리 + 휴대폰 뒷자리 4자리 등 보안 | HMAC 비교값 + PIN password hash + 실패 제한 |
| 학부모가 학생 정보와 피드백 보고서 열람 | 인증 성공 후 읽기 전용 보고서 페이지 |
| 모바일 HTML로 전달 가능 | 학부모 전용 모바일 우선 view |
| PDF 다운로드 가능 | 1차 브라우저 print/PDF, 2차 서버 PDF |
| 여러 학부모가 있어도 접근 통제 | 학생-학부모-보고서 링크 관계를 DB에 명확히 저장 |

결론: 방향은 부합한다. 다만 실제 구현에서는 "보안은 나중에"가 아니라 "인증과 데이터 권한을 먼저" 잡아야 한다.

## 3. 핵심 아키텍처 결정

### 3.1 저장소 구조

기존 Apps Script 파일은 루트에 유지하고, 새 웹앱은 별도 앱 폴더로 둔다.

```text
/
  Auth.gs
  Code.gs
  ...
  report-prototype/
  docs/
  apps/
    report-web/
      app/
      components/
      lib/
      supabase/
      tests/
```

이 구조를 쓰면 기존 Apps Script와 새 Next.js 앱의 책임이 섞이지 않는다.

### 3.2 기술 선택

- 웹앱: Next.js App Router + TypeScript
- 배포: Vercel
- DB/Auth: Supabase
- 스타일: CSS Modules 또는 Tailwind 중 하나로 고정. MVP에서는 Tailwind + shadcn/ui 없이 단순 컴포넌트 우선
- 검증: Zod
- 테스트: Vitest + Playwright
- PDF:
  - MVP: 브라우저 인쇄/PDF
  - 후속: 서버 렌더링 PDF

### 3.3 서버/클라이언트 책임

- 선생님 인증: Supabase Auth
- 선생님 데이터 접근: Supabase RLS + 서버 액션 ownership 검증
- 학부모 공유 인증: Next.js 서버 API 전담
- 학부모 보고서 데이터 조회: 인증 세션 확인 후 서버에서만 조회
- 브라우저에 Supabase service role key 노출 금지

## 4. 하네스 유지 전략

여기서 하네스는 구현이 흔들리지 않도록 잡는 검증 장치와 작업 규율을 뜻한다.

### 4.1 코드 하네스

모든 주요 데이터는 TypeScript 타입과 Zod 스키마를 먼저 둔다.

```text
StudentInputSchema
ReportDraftSchema
ReportPublishSchema
ParentAccessSchema
ReportScoreSchema
```

서버 액션/API는 반드시 스키마 검증을 통과한 입력만 처리한다. Next.js Server Actions는 UI에서만 호출되는 것이 아니라 직접 POST로도 호출 가능하므로 서버 검증을 생략하지 않는다.

### 4.2 DB 하네스

Supabase DB는 마이그레이션 파일로만 변경한다.

```text
apps/report-web/supabase/migrations/
```

테이블 생성 후 모든 public schema 테이블에 RLS를 켠다. Supabase 문서 기준으로 public schema의 RLS는 반드시 켜야 하며, 정책이 없으면 anon key 접근은 차단된다. 이 기본 차단 상태를 전제로 정책을 하나씩 연다.

### 4.3 보안 하네스

다음 케이스는 자동/수동 검증 체크리스트에 고정한다.

1. 로그인하지 않은 사용자는 `/teacher` 접근 불가
2. 선생님 A는 선생님 B의 학생/보고서 접근 불가
3. draft 보고서는 공유 링크 생성 불가
4. published 보고서만 학부모 링크 접근 가능
5. 링크만으로 보고서 본문이 내려오지 않음
6. 틀린 인증값 5회 후 잠금
7. 만료/폐기된 링크 접근 불가
8. 인증 성공 후에도 링크 폐기 시 view/PDF 접근 불가
9. PDF 다운로드 API도 같은 인증 확인 수행
10. access log에 생년월일/전화/PIN 원문 저장 금지

### 4.4 UI 하네스

반드시 확인할 viewport:

```text
390 x 844  iPhone 계열
430 x 932  큰 모바일
768 x 1024 태블릿
1440 x 900 데스크톱
```

확인 항목:

- 긴 학생 이름
- 긴 곡명
- 긴 기간명
- 긴 한국어 피드백 문장
- 프리셋을 여러 개 붙였을 때 보고서 overflow
- PDF 인쇄 시 입력 패널 제거
- 학부모 인증 화면에서 키보드가 올라와도 버튼 접근 가능
- 무공백 한국어 80자 이상에서도 보고서 폭이 깨지지 않음
- 자동 문장에서 `김지우은`, `자세이` 같은 조사 오류 없음

### 4.5 배포 하네스

PR 또는 main 배포 전 최소 명령:

```text
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Vercel Preview에서 수동 확인:

1. 선생님 로그인
2. 학생 생성
3. 보고서 draft 저장
4. 보고서 발행
5. 공유 링크 인증 실패
6. 공유 링크 인증 성공
7. 학부모 보고서 모바일 확인
8. 선생님 PDF 저장
9. 학부모 PDF 저장

## 5. 서브에이전트 활용 계획

사용자가 병렬 활용을 요청했으므로 구현 단계에서 다음처럼 쓴다. 단, 즉시 결정해야 하는 critical path 작업은 메인 작업자가 직접 수행한다.

### 5.1 서브에이전트 역할

1. 아키텍처/마이그레이션 검토 에이전트
   - DB 스키마, RLS, 마이그레이션 재실행 가능성 검토
   - 모델: 기본 상속 모델
   - 이유: 코드베이스 맥락과 SQL 검토가 필요하지만, 독립적으로 검토 가능

2. 보안 플로우 검토 에이전트
   - 공유 토큰, HMAC, PIN hash, rate limit, 쿠키 세션 검토
   - 모델: 기본 상속 모델, 필요 시 reasoning high
   - 이유: 실수 비용이 높고 메인 구현과 병렬 리뷰 가치가 큼

3. UX/PDF 검토 에이전트
   - 모바일 화면, 프리셋 UX, 긴 문장, print CSS 검토
   - 모델: 기본 상속 모델
   - 이유: 구현과 독립적으로 화면 리스크를 발견 가능

4. 테스트/QA 에이전트
   - Playwright 시나리오와 실패 케이스 작성
   - 모델: 기본 상속 모델
   - 이유: 메인 구현이 진행되는 동안 회귀 테스트를 병렬 준비 가능

### 5.2 모델 선택 원칙

- 기본은 현재 세션의 상속 모델을 사용한다.
- 명시적으로 더 작은 모델을 쓰지 않는다. 보안, DB, 인증은 작은 모델로 줄일 이유가 없다.
- 단순 문서 정리나 테스트 케이스 목록 작성만 별도라면 빠른 모델을 고려할 수 있지만, 현재 프로젝트에서는 기본 상속이 더 안전하다.
- 사용자가 다른 모델 사용을 명시하지 않는 한 override하지 않는다.

### 5.3 병렬화 타이밍

1. DB 스키마 초안 작성 직후
   - 보안 에이전트와 DB 에이전트에게 병렬 검토 요청

2. 보고서 작성 UI 1차 구현 직후
   - UX/PDF 에이전트에게 모바일/인쇄 리스크 검토 요청

3. 학부모 인증 API 구현 직후
   - 보안 에이전트에게 위협 모델과 우회 케이스 검토 요청
   - QA 에이전트에게 Playwright 케이스 작성 요청

4. Vercel Preview 배포 직후
   - UX/PDF 에이전트와 QA 에이전트에게 실제 URL 기준 검토 요청

## 6. 사용자 개입 시점과 필요한 액션

### 6.1 시작 전

사용자 액션:

1. Vercel 계정 로그인
2. GitHub `jnhn89-collab/suzuki-lesson-app` 저장소 연결 허용
3. Supabase 프로젝트 생성
4. Supabase project URL, anon key 확인
5. service role key는 절대 GitHub에 올리지 않고 Vercel 환경변수에 넣을 준비

사용자가 전달하거나 설정해야 할 값:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
APP_SECRET
PARENT_ACCESS_PEPPER
```

민감한 값은 채팅에 붙여 넣지 않는 것이 좋다. 내가 필요한 env 이름을 주면 사용자가 Vercel/Supabase 설정 화면에 직접 입력하는 방식이 안전하다.

### 6.2 DB 적용 시

사용자 액션:

1. 내가 작성한 SQL migration을 Supabase SQL Editor에서 실행하거나
2. Supabase CLI 연결을 허용해 로컬에서 migration을 적용

사용자 확인:

- 프로젝트 지역
- 무료 플랜 제한 확인
- Auth 이메일 로그인 사용 여부

### 6.3 Vercel 배포 시

사용자 액션:

1. Vercel 프로젝트 import
2. root directory를 `apps/report-web`로 설정
3. 환경변수 입력
4. 첫 배포 실행

내가 제공할 것:

- Vercel 설정값
- build command
- install command
- env var 목록
- 배포 후 확인 체크리스트

### 6.4 운영 전

사용자 액션:

1. 테스트 학생/학부모 데이터로 실제 공유 링크 테스트
2. 모바일에서 인증과 보고서 확인
3. PDF 저장 결과 확인
4. 학부모에게 보낼 안내 문구 확인

## 7. 세부 실행 단계

### Step 1. 저장소 작업 기준 확정

작업:

1. `apps/report-web` 폴더 생성
2. 기존 Apps Script 루트 파일은 변경하지 않음
3. 기존 `report-prototype`은 참고용으로 유지
4. Next.js 앱과 문서/SQL/테스트 위치 확정

완료 기준:

- `apps/report-web`에서 독립적으로 `npm run build` 가능
- 루트 Apps Script 파일과 충돌 없음

검증:

```text
npm run lint
npm run typecheck
npm run build
```

### Step 2. Next.js 스캐폴딩

작업:

1. Next.js App Router + TypeScript 생성
2. Supabase SSR 패키지 설치
3. 기본 layout, font, global CSS 구성
4. `/teacher`, `/teacher/reports/new`, `/r/[token]` 라우트 placeholder 작성

완료 기준:

- 로컬에서 teacher/report/public 라우트 접속 가능
- Vercel Preview 배포 가능

검증:

- 404 없는지 확인
- 모바일 viewport 기본 레이아웃 확인

### Step 3. 데이터 타입과 Zod 스키마 작성

작업:

1. 학생 타입 정의
2. 학부모 타입 정의
3. 보고서 draft 타입 정의
4. 보고서 발행 타입 정의
5. 학부모 인증 입력 타입 정의
6. 점수 범위 1-5 검증
7. 날짜/기간 검증

완료 기준:

- 클라이언트 form과 서버 action이 같은 스키마를 사용
- 잘못된 입력은 DB까지 가지 않음

엣지케이스:

- 생년월일 `000000`
- 윤년 날짜
- 전화 뒷자리 `0007`
- 기간 시작일이 종료일보다 늦은 경우
- 점수 누락
- 긴 한국어 문장

### Step 4. DB 마이그레이션 초안

작업:

1. `teacher_profiles`
2. `students`
3. `parents`
4. `reports`
5. `report_links`
6. `parent_report_sessions`
7. `report_access_logs`
8. 필요한 enum/status/index/FK 작성

중요 결정:

- `report_links`에는 `public_token` 원문 저장 금지
- `token_hash` 저장
- 생년월일/전화 뒷자리는 HMAC 컬럼 저장
- PIN은 password hash 저장

완료 기준:

- migration 재실행 가능
- 모든 public table RLS enabled
- 기본 anon 접근 차단

### Step 5. Supabase Auth와 선생님 profile 연결

작업:

1. 이메일 로그인 구현
2. 로그인 후 `teacher_profiles` 생성/조회
3. `/teacher` 보호
4. 서버에서 `auth.uid()` 기반 teacher 확인

완료 기준:

- 미로그인 시 teacher 페이지 접근 불가
- 로그인 후 본인 profile만 조회 가능

검증:

- RLS 정책 테스트
- 다른 user id로 접근 실패 테스트

### Step 6. 학생 관리 MVP

작업:

1. 학생 목록
2. 학생 등록
3. 생년월일 입력
4. 학부모 이름
5. 학부모 휴대폰 뒷자리
6. 현재 진도
7. 학생 비활성화

보안 처리:

- 생년월일 인증용 `birth_yyMMdd_hmac`
- 전화 뒷자리 인증용 `phone_last4_hmac`
- 문자열 값으로 처리해 앞자리 0 보존

완료 기준:

- 선생님이 학생을 등록/조회 가능
- 다른 선생님 데이터 접근 불가

### Step 7. 보고서 작성 UI 이식

작업:

1. `report-prototype/index.html`의 상태 구조를 React state로 변환
2. 프리셋 문장 컴포넌트화
3. 점수 입력 컴포넌트화
4. 보고서 preview 컴포넌트화
5. 모바일 parent view 컴포넌트 분리

완료 기준:

- `/teacher/reports/new`에서 프로토타입과 같은 작성 경험 제공
- localStorage 의존 없이 draft 저장 준비

디자인 주의:

- 카드 안 카드 남발 금지
- 긴 프리셋 버튼 두 줄 허용
- 한국어 줄바꿈 `word-break: keep-all`과 overflow 대응
- 390px에서 버튼/텍스트 겹침 없음

### Step 8. 보고서 draft 저장

작업:

1. 새 draft 생성
2. 명시적 저장 버튼
3. 저장 후 report id 부여
4. `updated_at` 기반 충돌 감지
5. 필수값 부족 시 draft 허용, publish는 차단

완료 기준:

- 새로고침해도 draft 유지
- 작성 중 실수로 보고서가 public 되지 않음

### Step 9. 보고서 발행 플로우

작업:

1. 발행 전 필수값 검증
2. status `draft -> published`
3. 발행 시 report snapshot 고정 여부 결정
4. 발행 후 수정 시 학부모에게 최신본을 보여줄지, 발행본을 보여줄지 정책 적용

권장 정책:

- MVP에서는 published report를 수정하면 학부모가 최신본을 본다.
- 추후 versioning을 추가한다.

완료 기준:

- draft는 공유 링크 생성 불가
- published만 공유 가능

### Step 10. 공유 링크 생성

작업:

1. 32바이트 랜덤 token 생성
2. DB에는 `token_hash`만 저장
3. 원문 token은 생성 직후 URL로만 표시
4. 링크 만료일 설정
5. PIN/password 설정
6. 기존 링크 재생성 시 이전 링크 폐기 옵션 제공

완료 기준:

- URL에 학생/보고서 ID 노출 없음
- DB 유출 시 URL 원문 복원 어려움

### Step 11. 학부모 인증 페이지

작업:

1. `/r/[token]` 인증 페이지
2. 생년월일 6자리 입력
3. 휴대폰 뒷자리 4자리 입력
4. PIN/password 입력
5. 서버 API에서 token hash 조회
6. HMAC/password hash 비교
7. 실패 횟수 원자적 증가
8. 성공 시 HttpOnly 쿠키 세션 발급

보안 응답:

- 없는 토큰/만료/폐기/틀린 값 모두 유사한 메시지
- 실패 사유 상세 노출 금지
- `Cache-Control: no-store`
- `Referrer-Policy: no-referrer`
- `X-Robots-Tag: noindex`
- OG 태그에 학생 정보 노출 금지

완료 기준:

- 링크만으로 보고서 본문 접근 불가
- 인증 성공 후 view 이동
- 5회 실패 시 잠금

### Step 12. 학부모 보고서 view

작업:

1. `/r/[token]/view`
2. HttpOnly 세션 확인
3. 링크 상태 재확인
4. report status 재확인
5. 학생/보고서 데이터 서버 조회
6. 읽기 전용 모바일 화면 렌더링

완료 기준:

- 인증 세션 없으면 인증 페이지로 이동
- 링크 폐기 후 기존 세션도 접근 불가
- 모바일에서 첫 화면에 학생 이름, 기간, 요약 표시

### Step 13. PDF MVP

작업:

1. `@media print` 정리
2. 선생님 화면에서 입력 패널 숨김
3. 학부모 화면에서 인증/버튼 영역 제외
4. PDF 버튼은 `window.print()` 호출

완료 기준:

- 선생님 화면 PDF 저장 가능
- 학부모 화면 PDF 저장 가능
- 모바일 브라우저에서 공유/인쇄 흐름 확인

후속:

- 서버 Playwright PDF는 별도 Phase로 둔다.

### Step 14. 접근 로그

작업:

1. 인증 성공 기록
2. 인증 실패 기록
3. PDF 다운로드 기록
4. 링크 폐기 기록
5. IP는 원문 대신 HMAC 또는 truncation
6. user agent는 길이 제한

완료 기준:

- 민감 입력값 원문 로그 없음
- 선생님이 보고서 접근 이력을 간단히 확인 가능

### Step 15. Vercel 배포

작업:

1. GitHub repo import
2. root directory `apps/report-web`
3. 환경변수 입력
4. build command 확인
5. preview 배포 확인
6. production 배포

사용자 액션:

- Vercel 계정에서 GitHub 연결
- env var 입력
- 필요 시 custom domain 연결

완료 기준:

- 배포 URL로 선생님 로그인 가능
- 학부모 공유 링크 동작

### Step 16. QA와 운영 리허설

테스트 데이터:

1. 학생 A, 학부모 1명
2. 학생 B, 학부모 2명
3. 생년월일/전화 뒷자리 앞자리 0 포함
4. 긴 이름
5. 긴 곡명
6. 긴 피드백

시나리오:

1. 보고서 draft 저장
2. 보고서 발행
3. 공유 링크 인증 성공
4. 공유 링크 인증 실패
5. 실패 5회 잠금
6. 링크 만료
7. 링크 폐기
8. PDF 저장
9. 모바일 확인
10. 다른 선생님 데이터 접근 실패

완료 기준:

- 위 시나리오를 전부 통과

## 8. 예상 엣지케이스와 대응

### 8.1 보안 엣지케이스

| 케이스 | 대응 |
| --- | --- |
| 링크 유출 | 추가 인증 필수 |
| DB 유출 | token 원문 저장 금지, HMAC/password hash 사용 |
| 짧은 PIN brute force | 실패 제한 + IP/token rate limit |
| 링크 잠금 DoS | IP/token 조합 제한과 잠금 메시지 완화 |
| 인증 후 링크 폐기 | view/PDF 매 요청마다 상태 재확인 |
| OG preview 노출 | 학생명/보고서 내용 meta tag 금지 |
| 로그에 민감정보 저장 | 입력값 원문 로그 금지 |

### 8.2 데이터 엣지케이스

| 케이스 | 대응 |
| --- | --- |
| `0007` 전화 뒷자리 | 숫자가 아니라 문자열로 처리 |
| `YYMMDD` 세기 모호성 | 인증용은 6자리, 내부 생년월일은 full date 선택 |
| 윤년/잘못된 날짜 | Zod refine으로 날짜 검증 |
| 동일 이름 학생 | 모든 접근은 id/token 기준 |
| 쌍둥이 | token + parent 인증 조합으로 보고서 선택 |
| 학부모 2명 이상 | parent row 여러 개 허용 |
| 학생 비활성화 | 새 링크 생성 차단, 기존 링크 정책 결정 |

### 8.3 UX/디자인 엣지케이스

| 케이스 | 대응 |
| --- | --- |
| 선생님 입력 부담 | 프리셋, 이전 보고서 복사, draft 저장 |
| 프리셋 문장 과다 | 카테고리 탭, 검색/필터 후속 |
| 프리셋 중복 누적 | 추가됨 상태, 중복 방지, 되돌리기 |
| 모바일 인증 입력 불편 | 숫자 키패드, 자동 포커스, 명확한 error |
| 긴 한국어 문장 | 줄간격, max-width, keep-all + overflow-wrap |
| PDF 잘림 | print CSS 별도 QA |
| 폰트 로딩 실패 | 시스템 한글 폰트 fallback |
| 보고서가 AI처럼 보임 | 자동 요약보다 선생님 선택 문장 중심 |
| 점수가 너무 앞에 보여 평가처럼 읽힘 | 학부모 모바일에서는 기간 요약/좋아진 점을 먼저 표시하고 점수는 보조 섹션으로 이동 |
| 자동 문장 조사 오류 | 조사 유틸을 만들거나 조사 회피 문장 구조 사용 |
| 빈 숫자값이 0분/0회로 표시 | publish 전 누락 검증, 빈 값은 미입력 상태로 표시 |
| 긴 메타 칩이 모바일 폭을 깨뜨림 | 칩 대신 라벨-값 리스트로 전환하거나 긴 값은 별도 행 처리 |

### 8.5 프로토타입에서 운영 앱으로 옮길 때 주의할 점

현재 `report-prototype/index.html`의 `#parent-view`는 에디터를 숨기는 보기 모드일 뿐, 실제 공유 기능이 아니다. 데이터도 `localStorage`에 저장되므로 학부모가 다른 기기에서 링크를 열면 선생님이 작성한 보고서가 보장되지 않는다. 운영 앱에서는 다음 원칙을 따른다.

1. 학부모 공유 데이터는 반드시 서버 DB에 저장한다.
2. 공유 URL은 token만 담고 report body를 직접 담지 않는다.
3. 학부모 view 컴포넌트는 인증 성공 후 서버에서 내려준 데이터만 렌더링한다.
4. `share-mode`는 운영 앱에서 "읽기 전용 렌더러" 개념으로만 계승한다.
5. localStorage 자동 저장은 프로토타입 편의 기능으로만 보고, 운영 draft 저장은 서버 기준으로 구현한다.

### 8.4 운영 엣지케이스

| 케이스 | 대응 |
| --- | --- |
| env var 누락 | startup/env validation |
| Supabase RLS 누락 | migration test와 정책 점검 |
| Vercel preview와 production env 차이 | env 문서화, preview/prod 분리 |
| 무료 플랜 제한 | 초기 MVP 트래픽 기준으로 모니터링 |
| 서버 PDF 비용 증가 | MVP는 browser print, 서버 PDF 후속 |

## 9. 사용자에게 요청할 정보 템플릿

### 9.1 Supabase 생성 후

사용자에게 요청할 설정 항목:

```text
Supabase Project URL
Supabase anon key
Supabase service role key는 채팅에 붙이지 말고 Vercel 환경변수에 직접 입력
```

내가 줄 env 이름:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
APP_SECRET
PARENT_ACCESS_PEPPER
```

### 9.2 Vercel 연결 후

사용자에게 요청할 설정:

```text
Framework: Next.js
Root Directory: apps/report-web
Build Command: npm run build
Install Command: npm install
Environment Variables: 위 env 목록
```

### 9.3 운영 테스트 전

사용자에게 요청할 샘플:

```text
테스트 학생 이름
테스트 학생 생년월일
테스트 학부모 휴대폰 뒷자리
보고서 PIN
학기/분기 명칭
스튜디오명 또는 선생님 표시명
```

민감하면 실제 정보 대신 테스트 정보로 진행한다.

## 10. 문서와 구현의 관계

현재 문서:

```text
docs/REPORT_APP_IMPLEMENTATION_PLAN.md
```

이 문서는 상위 구현 계획이다.

새 문서:

```text
docs/EXECUTION_REVIEW_AND_STEP_PLAN.md
```

이 문서는 실행 순서, 하네스, 사용자 액션, 서브에이전트 활용, 엣지케이스 대응을 포함한 작업 운영 계획이다.

구현 중 계획이 바뀌면 이 문서를 먼저 업데이트하고 코드를 변경한다.

## 11. 바로 다음 작업

1. `apps/report-web` Next.js 앱 생성
2. TypeScript/Zod 데이터 모델 작성
3. Supabase migration 초안 작성
4. 선생님 auth/RLS부터 구현
5. 보고서 UI 이식
6. draft 저장
7. publish/share/auth/view/PDF 순서로 진행

이 순서가 중요한 이유는 보고서 UI만 먼저 완성하면 개인정보 보호 구조가 뒤늦게 붙게 된다. 실제 운영 가능한 수준으로 가려면 Auth, RLS, token, session 설계를 먼저 고정해야 한다.

## 12. 참고한 공식 문서 기준

- Next.js Server Functions/Server Actions는 서버에서 실행되지만 직접 POST 요청으로도 호출될 수 있으므로 서버 측 입력 검증과 권한 확인을 반드시 둔다.
- Supabase public schema 테이블은 RLS를 켜고, 정책 없이는 anon key 접근을 차단하는 방식으로 시작한다.
- Supabase Auth + Next.js는 SSR/cookie 기반 구성을 사용한다.
- Vercel 환경변수는 배포 환경별로 설정하고, 변경 후 새 배포에 적용된다.
