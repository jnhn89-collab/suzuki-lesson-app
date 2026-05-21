# Suzuki Report App Factbook

Last verified: 2026-05-21

이 문서는 성과보고서 앱의 제품 판단에 쓰는 근거만 모은다. 출처가 없거나 현장 인터뷰로 확인되지 않은 내용은 가정으로 표시한다.

## Core Facts

| ID | Fact | Product implication | Source |
| --- | --- | --- | --- |
| F-SZ-001 | Suzuki Method는 가정의 성인 지원, 많은 듣기, 긍정적인 학습환경, 개인/그룹/연주 경험을 핵심 요소로 둔다. | 보고서는 점수보다 "가정에서 무엇을 도울지"와 "다음 연습 방향"을 짧고 실행 가능하게 써야 한다. | https://suzukiassociation.org/about/about-the-suzuki-method/ |
| F-SZ-002 | Suzuki 수업은 교사-부모-학생의 협력 구조로 설명되는 경우가 많고, 부모는 수업 밖 반복 환경에 영향을 준다. | 학부모 화면은 학생 비교보다 보호자가 오늘 할 행동 1개를 찾기 쉽게 해야 한다. | https://suzukiassociation.org/journalarticle/embracing-suzuki-parents-every-parent-can/ |
| F-SZ-003 | Asia 지역 Suzuki 단체는 ARSA로 분류된다. | 한국/아시아 맥락은 SAA만 기준으로 두지 않고 ARSA/한국 현장 인터뷰로 보완한다. | https://internationalsuzuki.org/regional-associations |
| F-ME-001 | NAfME 평가 자료는 가족이 음악 수업과 학생의 개별 진전을 이해하도록 자주 소통하는 것을 높은 수준의 실천으로 본다. | 보고서함은 여러 학기/분기 누적 열람과 최신 보고서 CTA가 필요하다. | https://nafme.org/wp-content/uploads/2023/09/NAfME-GENERAL-MUSIC-EVALUATION-WORKBOOK-2016.pdf |
| F-KR-001 | 한국 학교 학년은 일반적으로 3월 시작, 1학기/2학기 구조를 따른다. | 기본 기간 프리셋은 "1학기/2학기/분기/방학특강"을 지원해야 한다. | https://english.sen.go.kr/english/education/system.jsp |
| F-KR-002 | 한국 사교육비/참여 통계는 매년 공식 조사로 발표된다. | 학부모 문구는 경쟁·비교를 자극하지 않고, 비용 대비 성과 확인 욕구를 존중해야 한다. | https://www.kostat.go.kr/menu.es?mid=a20111020000 |
| F-PR-001 | FTC COPPA는 아동 온라인 개인정보 수집에서 부모 통제와 보호 절차를 강조한다. | 미국 사용자 가능성을 고려해 아동 데이터 최소수집, 보호자 인증, 삭제/폐기 운영을 설계한다. | https://www.ftc.gov/business-guidance/privacy-security/childrens-privacy |
| F-PR-002 | 한국 PIPC는 이름, 생년월일, 전화번호, 학교 등 식별 가능한 정보를 개인정보로 설명한다. | 학생명, 생년월일, 학교, 보호자 전화 뒷자리는 링크·로그·화면 노출을 최소화한다. | https://pipc.go.kr/eng/font/2021_PIPC_leaflet.pdf |
| F-SEC-001 | Supabase RLS insert policy는 `with check`로 새 row의 허용 조건을 검증한다. | `teacher_id`만 보지 않고 참조 row의 교사 소유권까지 RLS에서 확인해야 한다. | https://supabase.com/docs/guides/database/postgres/row-level-security |
| F-SEC-002 | Supabase/Vercel 환경변수는 Production, Preview, Development 환경별로 적용 범위가 다르다. | `dev` 브랜치는 Preview, `main`은 Production으로 두고 env 누락 여부를 배포 체크리스트에 넣는다. | https://supabase.com/docs/guides/troubleshooting/vercel-integration-environment-variables-not-syncing-for-persistent-git-branches-b9191e |
| F-A11Y-001 | W3C는 모바일 접근성을 별도 규격이 아니라 WCAG 적용 범위로 다룬다. | 부모 보고서함은 390px 모바일, 키보드, 200% 확대, 긴 한글 텍스트를 게이트로 둔다. | https://www.w3.org/WAI/standards-guidelines/mobile/ |
| F-A11Y-002 | WCAG 2.2는 모바일을 포함한 여러 기기에서 테스트 가능한 접근성 기준을 제시한다. | 오류 메시지 `aria-live`, 명확한 form label, no-overlap PDF 렌더 검사를 포함한다. | https://www.w3.org/TR/WCAG22/ |

## Open Research Gaps

- 실제 Suzuki/바이올린 선생님 8명 이상의 보고서 작성 시간, 반복 문장, 학부모 질문 패턴.
- 한국 학부모 12명 이상의 모바일 열람 행태: 카카오 공유, PDF 저장, PIN 전달 방식.
- 실제 익명 보고서 10건 이상의 문장 길이, 말투, 가정 연습 처방 구조.
- 장기 운영에서 학부모 보고서함 링크를 몇 년 유지할지, 졸업/퇴원 후 데이터 보관 기간을 어떻게 둘지.
