# Suzuki Report Web

분기/학기 성과보고서 작성과 학부모 공유를 위한 Next.js 앱입니다.

## 현재 구현 범위

- 선생님 보고서 작성 데모: `/teacher/reports/new`
- 학부모 인증 데모: `/r/demo-token`
- 인증 후 학부모 모바일 보고서: `/r/demo-token/view`
- PDF 저장: 브라우저 인쇄 기반
- Supabase migration 초안: `supabase/migrations/0001_initial_report_app.sql`

## 로컬 실행

```bash
npm install
npm run dev
```

## 검증

```bash
npm run lint
npm run typecheck
npm run build
```

## 환경변수

`env.example`을 기준으로 Vercel에 설정합니다.

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
APP_SECRET
PARENT_ACCESS_PEPPER
```

민감한 값은 Git에 커밋하지 않습니다.
