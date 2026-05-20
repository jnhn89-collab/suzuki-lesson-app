# Suzuki Report Web

분기/학기 성과보고서 작성과 학부모 공유를 위한 Next.js 앱입니다.

## 현재 구현 범위

- 선생님 로그인: `/teacher/login`
- 학생 등록/관리: `/teacher/students`
- 학기/분기 관리: `/teacher/periods`
- 선생님 보고서 작성 및 DB 발행: `/teacher/reports/new`
- 학부모 보고서함 데모: `/p/demo-portal`
- 학부모 보고서함 목록: `/p/demo-portal/reports`
- PDF 저장: 브라우저 인쇄 기반
- Supabase migration: `supabase/migrations/`

## 로컬 실행

```bash
npm install
npm run dev
```

## 검증

```bash
npm run lint
npm run typecheck
npm run quality
npm run build
```

## 환경변수

`env.example`을 기준으로 Vercel에 설정합니다.

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
PARENT_ACCESS_PEPPER
```

민감한 값은 Git에 커밋하지 않습니다.

## 공유 모델

- `/p/:token`: 학생별 학부모 보고서함 링크. 운영 기본 경로입니다.
- 학부모 보고서함에서는 발행된 여러 학기/분기 보고서를 목록으로 확인합니다.
- 학생 식별자는 학교명, 등록연도, 등록순번을 조합한 `student_code`를 사용합니다.
- 보고서함 링크는 opaque token으로 발급하고 DB에는 token hash만 저장합니다.
- PIN은 학생 보고서함 단위로 유지하며, 링크/PIN을 잊었을 때만 재발급합니다.

## 브랜치 운영

- `dev`: 기능 개발과 Vercel preview 테스트
- `main`: 검증 후 production 배포
- 작업 흐름: `dev` push → preview 확인 → PR → `main` merge → production deploy
