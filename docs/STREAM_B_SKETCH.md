# Stream B 활성화 계획 (시안)

> 점수 시스템 v2(차원 5개·0.5단위·N/A·또래 대비·Book ceiling) 본 PR 진입 전 준비물 정리. 현 시점은 orphan 컴포넌트와 priors 상수만 존재, wiring 0.

## 0. 전제

- 0005 마이그레이션: 코드 커밋만 됨. DB push 대기. push 신호는 사용자 또는 Codex가 supabase CLI/Dashboard로.
- 현 reports.scores_json은 정수 6차원 (posture·intonation·rhythm·tone·bow·musicality).
- 새 차원: 음정·박자·음색·음악성·자세활 (5개, posture+bow 통합).
- 학원 데이터 누적 후 prior μ calibration.

## 1. Wire 순서 (활성화 본 PR)

### 1.1 Schema/Validation
- `lib/report/schema.ts`의 `scoreSchema`를 새 5차원으로 교체. 각 필드 `z.number().multipleOf(0.5).min(1).max(5).nullable()`.
- 기존 6차원 input은 import 시점에 legacy mapper로 변환 (posture+bow 평균 → 자세활).
- DB persistence는 `scores_json` 그대로 jsonb 사용. 새 형식 키는 새 dim 이름.

### 1.2 Types
- `lib/report/types.ts`의 `ScoreMap`을 `Record<ScoringDimension, number | null>`로 변경.
- 기존 `ScoreCategoryId` 타입 사용처 (ReportEditor의 score 패널, ReportDocument의 영역별 기록)를 새 `ScoringDimension`으로 마이그레이트.

### 1.3 UI 연결
- **선생님 입력**: `components/report/ReportEditor.tsx`의 영역별 점수 Panel을 `ScoreSliderRow` 5개로 교체.
- **학부모 화면**: `components/report/ReportDocument.tsx`의 영역별 기록 SVG bar 5개 + 학생별 또래 대비 표시 분기.
- **학생/학부모 hex radar**: `ParentPortalView.tsx` 상단에 `HexRadar`. `students.show_peer_comparison=true`일 때 또래 prior μ 점선 overlay.

### 1.4 Score 산출 / 표시
- `lib/scoring/priors.ts`의 `deriveDisplayScore(1.0~5.0) → 0-100` 사용.
- `peerMean(...)` 사용 시 studio aggregates 필요 — 학원 데이터 집계 query 추가.
- Book ceiling 표시: 학생 `suzuki_book_level`이 있으면 ceiling 위 영역을 회색 처리 + "Book N+1로 가야 풀림" 캡션.

### 1.5 Migration 적용
- `supabase db push` (Codex가 처리).
- legacy 보고서 데이터는 별도 backfill 함수로 새 형식 채움 (db function 또는 Node 1회 스크립트). 결정 필요.

## 2. 결정 대기 항목

| 항목 | 옵션 | 결정자 |
|---|---|---|
| Legacy 6→5 마이그레이션 시점 | (a) 0005와 동시 / (b) 별도 0006 / (c) read-time on-the-fly | 사용자·Codex |
| Book level 입력 UX | 학생 상세에서 한 번 설정 / 보고서 작성 시마다 확인 | 사용자 |
| Hex radar 위치 | 학부모 카드 상단 / 보고서 상세 상단 / 둘 다 | 사용자 |
| Peer mean 점선 overlay 색 | 회색 점선 / 노란색 점선 / 없음 | 디자인 |
| Score 입력 마찰 측정 | A/B (slider vs row) / 일단 row 고정 | 사용자 |

## 3. 위험

- **L1**: 5차원 압축으로 legacy 6차원 보고서가 변환 누락 → 학부모 화면 빈 영역. 대응: import 시 fallback null → "N/A" 표시.
- **L2**: 0.5 단위 처리 누락 시 1-5 정수 호환은 됨(.0). 반대(0.5 입력 후 정수로 round)는 데이터 손실. 대응: jsonb 그대로, 모든 read 경로에서 number 처리.
- **L3**: peerMean 산출에서 N_studio 너무 작아 prior로 거의 동일 → "또래 대비"가 사실상 prior. 학생별 on/off로 보호.
- **L4**: ceiling 도달 학생이 "정체 같다" 느낌 → "Book N+1 진입" 카피로 동기 부여 필수.

## 4. 미해결 깊이

- 시간축 진척 그래프 (logistic fit overlay) — Cycle C
- Hex radar의 hover/touch interaction — Stream B 본 PR
- 학원 데이터 admin UI (prior 표 calibration) — Stream B 후속
- 한국어 dim label localization 외 영어 fallback — 다국어 자체가 미지원, deferred

## 5. 산출물 (이 턴 작성)

- `apps/report-web/src/components/scoring/HexRadar.tsx` — 5축 SVG radar, ring 4단, score 미입력 시 vertex 생략, gradient fill, aria-label.
- `apps/report-web/src/components/scoring/ScoreSliderRow.tsx` — 9-point 0.5단위, aria-pressed, optional N/A 버튼, whole/half 시각 차이.
- 둘 다 orphan. 컴파일·타입체크 OK. routed page에서 import 0.

## 6. 다음 메인 PR 진입 조건

1. 0005 DB push 완료
2. 사용자 §2 결정 항목 처리
3. Codex와 schema/types 동시 PR 작성 합의 (한 사람이 lib/report/schema, 다른 사람이 wire)
