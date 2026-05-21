# 참고 앱 비교 — 학부모 진입 + 보고서 surface 중심

> Stream A/C/D 결정의 외부 reference. 스크린샷 직접 캡처는 WebFetch 한계로 미수집. 다음 턴에 사용자 자발적 가입/내가 cmux 브라우저로 보완.

## 1. 비교 매트릭스

| 앱 | 학부모 진입 | 보고서/평가 surface | 누적 기록 패턴 | 우리에게 차용할 점 |
|---|---|---|---|---|
| **ClassDojo** | 학교 코드로 연결, 앱 설치 또는 웹 | 행동 포인트 / 사진·동영상 / 메시지 | 게시판 시간순 누적 | 푸시 알림 + 명확한 발신자 표시 |
| **Seesaw** | 학생 활동 링크 학부모 공유 | 학생 포트폴리오 (사진·동영상·메모) | 학기 단위 누적 | 학기별 보고서 listing 패턴 |
| **하이클래스 (한국)** | SNS 가입 또는 학교 코드, **개인 전화번호 비공개** | 알림장 / 가정통신문 / 출결 | 학급 게시판 + 가정통신문 시간순 | 한국 학부모 톤 / 개인번호 비노출 인증 / 카톡-친화 카드 톤 |
| **MyMusicStaff** | 학원 코드로 부모 portal 로그인 | 출결 / 청구서 / 연습 로그 (**구조화된 보고서 없음**) | 일 단위 연습 로그 | 연습 시간 로그 (Stream E) / 학생 카드 통합 정보 흐름 |
| **우리 앱** | 토큰 URL + 생일 6 + 폰뒷4 + PIN | **분기/학기 정량 평가 + 코멘트 + Δ 추적** | 보고서함 시계열 누적 | — (이 영역은 우리가 차별화) |

## 2. 핵심 관찰

### Obs 1 — 시장 갭 확인
위 4개 중 **분기/학기 단위 정량 평가 보고서 surface는 없음**. ClassDojo는 daily behavior, Seesaw는 portfolio, 하이클래스는 행정, MyMusicStaff는 운영. **분기/학기 평가 = 우리의 차별 영역**.

### Obs 2 — 한국 학부모 진입의 표준
- 앱 설치 강제 X
- 개인 전화번호 노출 X
- 명확한 발신자(학교/학원/선생님) 표시
- 카톡 1탭 진입
- 안내문 톤이 "공지 카드" 식

우리 현 모델(토큰 + 생일 + 폰뒷4 + PIN)은 이 기준 충족하지만 **카톡 발송 메시지 자체에 발신자/맥락 표시 부족** (Stream C5 보강 항목).

### Obs 3 — MyMusicStaff의 한계 = 우리 기회
MyMusicStaff는 음악 학원 시장의 디팩토 표준이지만, "부모에게 학생 발달을 정량으로 보여주는" 도구는 없음 — billing/scheduling/practice log에 집중. **우리 앱의 unique value는 점수 + Δ + 진척 그래프 surface**.

### Obs 4 — Seesaw의 포트폴리오 패턴
다중 기간 누적을 "포트폴리오" 메타포로 풀어냄. 학부모 진입 시 시간순 정렬, 각 항목 카드 일관성. **우리 `/p/[token]/reports` 페이지가 이 패턴**(이미 구현됨, 추가 폴리시 가능).

### Obs 5 — 하이클래스의 한국적 톤
- 카드형 알림 (둥근 모서리, 적당한 padding)
- 발신자(선생님 이름) 큰 글씨
- 작성 시각 명시
- 댓글/확인 행위 명확
- 이모지 절제

우리 학부모 페이지는 슬레이트/블루/그린 톤 + Pretendard 폰트 + 따뜻한 off-white 바탕 — **하이클래스보다 우아한 편이지만 "발신자 카드"와 "확인 응답" UX가 약함**.

## 3. 패턴별 비교 (우리 적용 항목)

### 학부모 진입 카드
| 항목 | ClassDojo | 하이클래스 | MyMusicStaff | 우리 (현재) | 우리 (목표) |
|---|---|---|---|---|---|
| 발신자 명시 | ✓ 큰 글씨 | ✓ 학교명+선생님 | ✓ 학원명 | ✗ "학부모 보고서함" 일반 카피 | ✓ 학생 이름 + 선생님 이름 (D1) |
| 발송 시점 | ✓ 시간 | ✓ 일자 | ✓ 일자 | ✗ | ✓ "2026년 1학기 보고서" (D1) |
| 발송 맥락 한 줄 | ✓ "오늘 활동" | ✓ "가정통신문" | ✓ "이번 주 연습" | ✗ | ✓ "이번 학기 성장 기록" |

### 인증 방식
| 항목 | ClassDojo | 하이클래스 | MyMusicStaff | 우리 |
|---|---|---|---|---|
| 진입 마찰 | 낮음 (학교 코드) | 낮음 (SNS 가입) | 중간 (학원 코드+PW) | **높음 (3단 인증)** |
| 분실 시 복구 | 비밀번호 재설정 | 학교 통한 재초대 | 학원 재초대 | **선생님 PIN 재발급뿐** |
| 개인정보 노출 | 학생 이름·반 | 학교명·학년 | 학생 이름 | 학생 이름·곡 진도 |

**해석**: 우리 인증이 가장 강력하지만 그만큼 학부모 마찰 큼. Stream D2(PWA 홈 추가 안내) + D6(다음 보고서 알림)으로 **첫 진입 한 번 만 강력**하게 만들고 **재진입은 쉽게** 분기 가능.

### 누적 보고서 listing
| 항목 | Seesaw | MyMusicStaff | 우리 |
|---|---|---|---|
| 메타포 | 포트폴리오 | 연습 로그 | 보고서함 |
| 정렬 | 시간 역순 | 시간 역순 | ✓ 시간 역순 (현재) |
| 한 항목 미리보기 | 썸네일 + 1줄 | 시간 + 1줄 | **제목만** (보강 필요) |
| 비교 view | X | X | **잠재 USP (학기 비교)** (Stream D5) |

## 4. 적용 우선순위 (Stream 매핑)

| 차용 | Stream | 비용 |
|---|---|---|
| 카톡 발송 메시지 발신자 강화 | C5 | S |
| 학부모 진입 카드 발신자·시점·맥락 | D1 | S |
| 보고서 listing 카드 1줄 요약 | (신규) | M |
| 학기 간 비교 view | D5 | L |
| PWA 홈 추가 안내 | D2 | S |
| 다음 보고서 알림 (이메일/Push) | D6 | M |

## 5. 시각 비교 (실 스크린샷 — 다음 작업)

WebFetch는 앱 내 스크린샷 직접 회수 불가. 옵션:
1. 사용자가 직접 4개 앱 가입 후 학부모 화면 캡처 → docs/REFERENCE_APPS_VISUAL.md
2. 내가 cmux 브라우저 surface로 각 앱 home 페이지 + 가능한 demo 스크린 캡처
3. 공식 앱스토어 미리보기 이미지를 캡처 후 정리

다음 턴 진행 시 옵션 선택 필요.

---

## Sources

- [ClassDojo for Parents](https://home.classdojo.com/)
- [ClassDojo Help: What are Chats](https://help.classdojo.com/hc/en-us/articles/203730309-What-are-ClassDojo-Chats)
- [Seesaw Family Communication](https://seesaw.com/features/family-communication/)
- [Common Sense Education: Best Family Communication Platforms](https://www.commonsense.org/education/best-in-class/the-best-family-communication-platforms-for-teachers-and-schools)
- [하이클래스 공식](https://www.hiclass.net/)
- [하이클래스 앱 사용법 (iorad)](https://www.iorad.com/player/1921734/-------------------------------------)
- [하이클래스 학부모용 가이드](https://child.onthesweet.com/291)
- [MyMusicStaff Student Portal](https://www.mymusicstaff.com/student-portal/)
- [MyMusicStaff Student Portal Support](https://support.mymusicstaff.com/en/articles/1083-how-can-i-view-the-student-portal)
