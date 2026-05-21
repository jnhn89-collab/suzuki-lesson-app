# CLAUDE_TURN_8

## 상태

- `dev` 최신(`855fcf4`) 동기화 완료. Codex `09ae75f`의 보강 코드 그대로 사용.
- Codex가 D3 PDF 파일명을 처리 중이므로 Claude는 D3 회피하고 A1로 분담.
- 모바일 QA는 다음 반복에서 (이번 턴은 정적 검증만).

## 진행: A1 "오늘 할 일" 대시보드

### 변경 파일
- `apps/report-web/src/lib/teacher/data.ts` — `getTeacherHomeData` 확장
  - 추가 반환: `recentReports`(최근 5건 published, students join), `activePeriods`(active 상태 3건, starts_on desc)
  - `RecentReportItem`, `ActivePeriodItem` 타입 export
  - students 조인 반환 시 single/array 양쪽 케이스 안전 처리

- `apps/report-web/src/app/teacher/page.tsx` — 대시보드 재설계
  - 시간대별 인사말 (`buildGreeting`): 늦은 밤/좋은 아침/오후/저녁 + 선생님 이름
  - **TodayCard**: 슬레이트 950 강조 카드. 상태 기반 CTA:
    - students=0 → "첫 학생을 등록해 주세요" → /teacher/students
    - students>0, periods=0 → "평가 기간을 등록해 주세요" → /teacher/periods
    - 둘 다 있고 reports=0 → "첫 보고서를 작성해 주세요" → /teacher/reports/new
    - 모두 있음 → "새 보고서 작성" → /teacher/reports/new
  - **최근 발행 보고서** 섹션: 5건 list, 학생 이름·기간명·상대 시간(오늘/어제/N일 전/N주 전/날짜)
  - **활성 기간** 사이드바: 3건, 이름·기간 범위
  - 기존 stat 3카드는 하단으로 이동 + 학생·기간 카드는 클릭 가능 (`href`)
  - 보조 nav: 학생 등록 / 학기 분기 / 학부모 보고서함 데모

### 6렌즈 자가 점검

- **L1 (0 data state)**: TodayCard가 상태별 CTA를 분기. 신규 사용자가 "어디로 가야 할지 모름" 해소. ✓
- **L2 (반복)**: 매 로그인 시 시간대 인사 + 다음 액션 + 최근 5건이 한 화면. 토요일 오후 5명 작성 시작 시점에 첫 화면에서 즉시 시작 가능. ✓
- **L3 (data lineage)**: recentReports는 reports 테이블 + students join에서 derive. activePeriods는 academic_periods.status=active에서 derive. 카운트는 head:true 효율 쿼리. ✓
- **L4 (모바일 390px)**: stat 3카드 sm:grid-cols-3, 활성 기간은 lg:grid-cols-[1fr_280px]. 모바일에선 stack. TodayCard padding 5/value text 2xl. dev 서버 실 viewport 확인은 다음 반복으로. ⚠
- **L5 (failure)**: students join 결과가 single/array 양쪽 형태로 올 수 있어 둘 다 처리. formatRelativeDate에 try/catch + Number.isNaN 가드. ✓
- **L6 (6개월 후)**: 시간대 인사 + 최근 보고서 = 매일 다른 컨텍스트로 보임. 인지 부하 누적 ↓. ✓

### 검증
- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS (route list 동일)

## 후속 의도

- Codex D3 (PDF 파일명) 머지 후 모바일 QA 묶어서 같이
- D1 (학부모 인증 상단 발신자 맥락): 다음 턴 후보. 토큰 hash로 link → student → teacher_profile 조회 후 발신자 표시. 인증 전 노출이라 privacy trade-off 검토 필요
- A1 미해결: "이번 학기에 보고서 누락된 학생 N명" 카운트. 현재 active period × students 매트릭스가 없음. Stream B에서 보고서 schema 정리 시 함께 도입 가능

## 알려진 미점검
- 실제 모바일 390px viewport에서 TodayCard padding/typography 점검 필요
- activePeriods가 0개일 때 lg grid의 사이드바 비어 보임 — empty state 카피는 들어가 있으나 시각 균형 추가 검토
