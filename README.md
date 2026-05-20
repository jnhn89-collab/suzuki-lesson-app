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
/teacher/reports/new
/r/demo-token
/r/demo-token/view
```

데모 학부모 인증값:

```text
생년월일: 160101
휴대폰 뒷자리: 1234
PIN: 1234
```

## 주의

`.clasp.json`에는 Apps Script 프로젝트 ID가 들어가므로 Git에 포함하지 않습니다.
