# PR Self-Review Checklist (6 Lenses)

> 모든 PR에서 PR 본문 또는 self-review 코멘트에 6개 줄 통과 메모 남기기. 출처: docs/DEV_CYCLES.md (Claude turn 4).

## Lens 1 — First 5 sec, 0 data state
신규 사용자가 가입 직후 첫 진입 화면을 5초 봤을 때 다음 행동이 명확한가? 학생/기간/보고서가 0건인 상태에서 sample 데이터로 위장하지 않는가?

## Lens 2 — Time-pressed repeat user
토요일 오후 학생 5명에게 보고서 작성. 같은 폼을 5번 채울 때 누적 마찰은 어떤가? 한 학생당 보고서 1건당 클릭 수/입력 횟수?

## Lens 3 — Data lineage
이 폼의 각 필드에 대해: 이 값을 어디에서 derive할 수 있는가? 이미 알고 있는가? 사용자가 손가락으로 또 입력해야만 하는가? Smart default·autofill·read-only 카드 적용 가능한 곳을 빠짐없이 봤나?

## Lens 4 — One-handed mobile 390px
한 손 엄지 도달 영역(하단 65%)에서 핵심 액션이 가능한가? 키보드가 올라와도 주요 버튼 가려지지 않나? 터치 target 44×44px 이상?

## Lens 5 — Failure modes & recovery
잃어버림 / 오타 / 네트워크 끊김 / 뒤로가기 / 새로고침 / 세션 만료 — 각 시나리오마다 복구 경로 존재? 결정적 정보(PIN, URL)는 1회 표시 후 영구 손실되지 않나?

## Lens 6 — Future self in 6 months
6개월 후 같은 사용자가 같은 화면에 또 온다. 누적 마찰은 어떤가? 같은 입력을 6번 반복하면 어떤 감정인가? Time-saving feature(이전 보고서 복사, 자동 저장, 프리셋 검색)가 누적 사용에서 보상되는가?

---

## 추가 게이트 (선택)

- 한국어 keep-all 줄바꿈, 긴 이름/곡명/문장 overflow 점검
- 조사 자동 처리 (김지우은 → 김지우가 회피)
- 점수 표시는 평가가 아닌 관찰 톤 (docs/DESIGN.md 일치)
- 또래 대비는 학생별 on/off 설정 존중
- 학부모 화면에서 학생 보호 (이름 외 노출 최소화)

## PR template 예시

```
## 6렌즈 자가 점검
- L1 (0 data): [통과/주의 / 메모]
- L2 (반복): [통과/주의 / 메모]
- L3 (lineage): [통과/주의 / 메모]
- L4 (모바일): [통과/주의 / 메모]
- L5 (복구): [통과/주의 / 메모]
- L6 (6개월 후): [통과/주의 / 메모]
```
