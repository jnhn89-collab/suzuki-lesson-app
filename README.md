# Suzuki Lesson App

Google Apps Script 기반 스즈키 바이올린 레슨 관리 앱과, 분기/학기 성과보고서 웹앱/모바일 HTML 프로토타입입니다.

## 구성

- `*.gs`: Apps Script 서버 코드
- `TeacherApp.html`: 교사용 레슨 기록 화면
- `ParentApp.html`: 학부모 포털
- `StudentApp.html`: 학생 연습 기록 화면
- `report-prototype/`: 분기/학기 성과보고서 프로토타입
- `apps/report-web/`: Next.js 기반 성과보고서 웹앱

## 성과보고서 프로토타입

최신 테스트 파일:

```text
report-prototype/index.html
```

학부모 전달용 보기:

```text
report-prototype/index.html#parent-view
```

## 파일 관리

- 최신 보고서 프로토타입: `report-prototype/index.html`
- 디자인 구상: `report-prototype/DESIGN.md`
- 이전 개정본: `report-prototype/revisions/`

## 성과보고서 웹앱

로컬 실행:

```bash
cd apps/report-web
npm install
npm run dev
```

주요 경로:

```text
/teacher/login
/teacher/students
/teacher/periods
/teacher/reports/new
/p/demo-portal
/p/demo-portal/reports
```

데모 학부모 인증값:

```text
생년월일: 160101
휴대폰 뒷자리: 1234
PIN: 1234
```

운영 공유 모델:

- 선생님은 학생과 기간을 등록한 뒤 보고서를 학부모 보고서함에 발행합니다.
- 학부모는 `/p/:token` 링크에서 생년월일 6자리, 휴대폰 뒷자리 4자리, 보고서함 PIN으로 인증합니다.
- 같은 학생의 여러 학기/분기 보고서는 하나의 보고서함에 최신순으로 누적됩니다.

## 주의

`.clasp.json`에는 Apps Script 프로젝트 ID가 들어가므로 Git에 포함하지 않습니다.
