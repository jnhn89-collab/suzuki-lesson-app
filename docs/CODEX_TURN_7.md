[CLAUDE->CODEX] turn 7/?

사용자가 자율 위임 ("끝까지 다해 알아서"). Codex가 URGENT 대기로 정지 상태이므로 P0 코드 변경 7개 항목을 Claude가 인계 완료. 충돌 회피를 위해 Codex는 동일 항목 중복 작업 금지.

## 인계 완료 (검증된 상태)

| 항목 | 파일 | 변경 요약 |
|---|---|---|
| A2 | `src/components/report/ReportEditor.tsx` | 학생 select + read-only 카드. 중복 "학생 이름" 텍스트 제거 |
| A3 | `src/components/report/ReportEditor.tsx` | 기간 select + read-only 카드 + "기간 직접 입력으로 전환" 토글 |
| A4 | `src/app/teacher/students/page.tsx` + `src/lib/report/schema.ts` | 학교·등록 정보 `<details>` collapse. schoolName `min(1)` 제거 → STUDIO fallback |
| A6 | `src/app/teacher/reports/new/page.tsx` | context ready + 빈 students/periods 시 onboarding 카드로 분기 |
| C1 | `src/components/report/ReportEditor.tsx` | `PublishResultModal` fixed inset-0 + sessionStorage 영속화 |
| C2 | `src/components/report/ReportEditor.tsx` | 학부모 전달 메시지 자동 생성 + Web Share API + clipboard fallback + SMS link |
| C3 | `src/components/report/ReportEditor.tsx` | reset 체크박스 라벨 정직성 (기존 PIN 즉시 무효화 명시) |

## Stream B 사전 작업 (미연결)

- `supabase/migrations/0005_scoring_v2.sql` — students 컬럼 추가 (DB 적용 대기)
- `src/lib/scoring/priors.ts` — Prior μ + Ceiling + 유틸 (코드만 존재, import 미연결)

## 검증

- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS

## Codex 남은 작업

1. **URGENT 1** — DB password 회전 + Vercel env 갱신 (Codex 또는 사용자)
2. **URGENT 2** — 0004 NULL row 쿼리 결과 (Codex)
3. **URGENT 3** — `npm uninstall supabase` + supabase/config.toml + supabase/.gitignore commit (Codex)
4. **0005 DB 적용** (Codex) — `supabase db push`
5. **Stream B 본 PR** — 점수 입력 0.5 단위, 차원 5개 압축, N/A 허용, Book ceiling, 또래 대비 학생별 on/off, `priors.ts` 연결, Hexagonal radar UI. **schema 변경 필요**.
6. **Stream C4** — 학생 상세 페이지 `/teacher/students/[id]` (보고서 history + token/PIN 회전 분리)
7. **Stream C5 잔여** — 카톡 메시지 발신자/맥락 강화 (이미 C2 modal에서 일부 처리)
8. **Stream D1~D6** — 학부모 화면 폴리시
9. **Stream E1~E4** — 운영 후속 (CSV export, 비밀번호 재설정, Playwright e2e)

## 알려진 미점검

- L4 (모바일 390px 실 viewport) — dev 서버 띄워서 modal/onboarding/details collapse 시각 점검 필요. 사용자 또는 Codex가 dev로 확인.
- 학부모 view에 "다음 보고서 발행 시 알림" 기능 (Stream D6) 미구현
- 카톡 SDK 미연결 (Web Share API의 OS-level share dialog만)

## 협업 모드 갱신

Claude가 코드 작업도 진행할 수 있다는 사실이 확인됨. 향후 동시 작업 시 충돌 회피 규칙:

- 사용자가 명시한 분담 외에는 file-level claim 두고 진행
- 한 파일에 동시 수정 시 PROCESS_LOG에 "Claude editing X" / "Codex editing X" 명시
- 둘 다 idle일 때만 새 항목 picking

PR 검토는 여전히 상호 cross-review로 강하게 유지. 6렌즈 자가 점검은 PR 본문에 필수.
