# 점수/성장 시스템 리서치 (v2)

> Stream A 점수 재설계의 evidence base. v1(1차본)에 PubMed 시스템 리뷰, Suzuki↔ABRSM/RCM/ASTA 매핑, 단계별 스킬 timeline, Prior 시드값 v1 추가.

---

## 1. ABRSM 그레이드 평가 [근거]

- 총점 150점, **Pass 100 / Merit 120 / Distinction 130**
- 평가 5차원: **pitch · time · tone · shape · performance**
- Anchor 방식 (pass mark 기준 +/-) — 인플레/디플레 방지
- 약점은 강점으로 보완 가능

**우리 적용**: anchor=60 (또래 평균)에서 +/-, ABRSM 5차원과 매핑 (§7 참조)

## 2. Suzuki Method 공식 평가 부재 [근거]

- Suzuki Talent Education = 전인적 발달, 반복+학부모 참여, 정형 rubric 없음
- 2024 SAGE 시스템 리뷰: 교실 실천 데이터 부족 — 학술 결함

**우리 적용**: 정량 척도는 **"보조 관찰 기록"** framing. 시험 점수 톤 금지. 학생별 또래 대비 on/off로 강제 비교 회피.

## 3. 작은 N + 베이지안 보강 [근거]

- 2PL IRT N≥500 권장 (Fujimoto 2020, de la Torre 2010)
- 베이지안 + informative prior로 작은 N 추정 가능
- 계층적 베이지안 모델이 sparse data에 적합

**우리 수식**
```
peer_mean(book, age, dim) = (N_studio · μ_studio + k · μ_prior) / (N_studio + k)
```
- k=5 default
- N_studio ≤ 5 → prior 우세
- N_studio ≥ 20 → 학원 데이터 우세
- μ_prior 시드는 §10 표 사용

## 4. 음악 교육 게임화 [근거]

- 게임화 그룹 박자 정확도 +32%, 음 인식 +28%
- 92.2%가 내재적 동기 응답 (Yanos)
- LessonLink (K-12 자기조절) / ArchiTone (LEGO 시각화) 사례

**우리 적용**: 0-100 derive + Book level ceiling = 게임화 + 정직 양립. Hexagonal radar = FIFA UI 비유와 일치.

## 5. 솔로 음악 연주 평가 시스템 리뷰 [v2 핵심, PMC11496144]

26개 평가 시스템 메타 분석 결과:

### 5.1 평가 차원 빈도
| 차원 | 빈도 (26 중) |
|---|---|
| Technical (technique/instrument control) | 19 |
| Tone/sound quality | 15 |
| Expressive/interpretation/musicality | 14 |
| Intonation/pitch | 14 |
| Rhythm | 13 |
| Tempo | 11 |
| Articulation | 8 |

### 5.2 척도 형식
| 형식 | 빈도 |
|---|---|
| **5-point** | **14** (가장 빈번) |
| 4-point | 4 |
| 6-7 point | 3 |
| Rubric descriptor | 4 |

→ **우리 1-5 · 0.5 단위 결정이 학술 표준과 일치.**

### 5.3 평가 방식 동향
- 최근 연구: **rubric 기반 criterion-referenced**로 이동 (학생 진척 지원 + 평가자 이해도)
- norm-referenced vs criterion-referenced 명시 비교는 없음

### 5.4 학습 단계별 미해결 갭
> "No differentiation was found in assessment criteria based on students' learning stages — an area for improvement."

→ **우리 Book level ceiling + Book-aware rubric이 이 학술 갭을 정확히 메움.** USP 정당화 강력.

### 5.5 연령 분포 갭
- 26 시스템 대부분 고교·대학생 대상. 초등 연령 자료 부족.

→ **우리 7세 Book 1 학생 평가 디자인은 신규 영역.**

## 6. Suzuki ↔ 그레이드 시험 매핑 [Reddesert Violin]

| Suzuki | ABRSM | RCM | ASTA |
|---|---|---|---|
| Book 1 | Prep–1 | 1 | 1 |
| Book 2 | 2 | 2 | 2 |
| Book 3 | 2–3 | 3 | 3 |
| Book 4 | 3–4 | 3–4 | 4 |
| Book 5 | 5–6 | 4–5 | 4 |
| Book 6 | 6 | 5–6 | 4–5 |
| Book 7 | 6–7 | 6 | 5 |
| Book 8 | 7–8 | 6–7 | 5 |
| Book 9 | 8 | 7–8 | 5–6 |
| Book 10 | 8 | 9 | 6 |

**우리 적용**: Book ceiling 설계에 ABRSM 8단계 ↔ 0-100 매핑 가능. Book 1=Grade 1≈75, Book 10=Grade 8≈95.

## 7. 단계별 스킬 timeline [Bregman]

| 단계 | 기간 | Suzuki | 누적 시간 | 핵심 스킬 |
|---|---|---|---|---|
| Early beginner | 3-6개월 | Twinkle (Book 1) | 50h | 자세·활 잡기, A장조 핑거링, upper-half detaché |
| Continuing beginner | 2-3년 | Book 1→2-3 | 500h | 1포지션 핑거링, full bow, staccato/martelé, dotted/triplet |
| Intermediate | 4-5년 | Book 3→5-6 | 2,000h | 시프팅, vibrato, 더블 스톱, dynamics, spiccato/collé/sautillé |
| Advanced | 4-5년 | Book 6+ | 5,000h | 확장 포지션·더블 스톱, expressive shifting/vibrato, harmonics, up-bow spiccato |
| Expert | 평생 | — | 10,000h+ | 음악성, 표현, 인생 경험 통합 |

**우리 적용**: 차원별 평가 의미가 단계마다 다름.
- Book 1: musicality 평가 부담 → N/A 허용 (현실적으로 자세·박자·음정만 의미)
- Book 5+: vibrato/dynamics 평가 시작 가능 → musicality 의미 회복
- 이 단계 인식이 **Book-aware rubric**의 근거

## 8. 한국 음악 교육 루브릭 방법론 [KCI 국악교육 수행평가]

- 영역별 목록화 (성악/악기/창작/감상) — 명확한 활동 단위
- 등급별 채점 기준 명시 — 학생·학부모 둘 다 이해 가능
- **현장교사 + 도메인 전문가 1차 루브릭 검증** → 수정 → 최종
- 신뢰도/타당도 확보 방식: 전문가 합의

**우리 적용**: Prior 시드값 표 v1을 Suzuki Method 전문가 + 학원 실 데이터로 calibrate하는 과정이 이 방법론과 부합. 시드값은 가설일 뿐, 학원 데이터 N=10 도달 후 1차 calibration 필수.

## 9. 학습 곡선 모델 [arxiv 1410.6049 외]

- 학습 곡선은 일반적으로 **logistic 함수** (slow start → 가속 → plateau)
- 음악 학습 = motor sequence learning
- **Latent Growth Curve Modeling (LGCM)**: 종단 데이터 분석에 적합
- 비선형 mixed-effect 회귀로 진척 trajectory 추정

**우리 적용**:
- 점수 시간축 plot에 logistic fit 보조선 표시 가능 (Cycle C+)
- "이번 기간 정체"가 plateau 정상 구간일 수 있음 → 학부모 화면에서 plateau 해설 가능

---

## 10. Prior 시드값 표 v1 (도메인 전문가 검증 필요)

**가정**: 각 셀 = 해당 (Book level × 차원) 학생 군의 0-100 점수 분포 평균(μ_prior). 학원 데이터 누적 시 §3 수식으로 blend.

**5차원 (ABRSM 매핑 + 우리 압축)**
1. 음정 (intonation/pitch)
2. 박자 (rhythm/time)
3. 음색 (tone)
4. 음악성 (shape/expression/musicality) — Book 1-2에선 평가 부담, N/A 권장
5. 자세·활 (performance/technique) — 현 posture+bow 통합

| Book | 음정 | 박자 | 음색 | 음악성 | 자세·활 |
|------|------|------|------|--------|---------|
| 1    | 50   | 55   | 45   | N/A    | 50      |
| 2    | 55   | 58   | 50   | N/A    | 55      |
| 3    | 58   | 60   | 55   | 50     | 58      |
| 4    | 62   | 63   | 60   | 55     | 60      |
| 5    | 65   | 66   | 63   | 60     | 63      |
| 6    | 68   | 70   | 67   | 65     | 67      |
| 7    | 72   | 73   | 70   | 70     | 70      |
| 8    | 75   | 76   | 73   | 75     | 73      |
| 9    | 78   | 78   | 77   | 78     | 76      |
| 10   | 80   | 80   | 80   | 82     | 80      |

**해석 가이드**
- "Book 1 학생 평균 음정 = 50" = 1-5 입력 척도로 약 2.4 (1.5와 2.5 사이)
- "Book 10 학생 평균 음정 = 80" = 1-5 입력 척도로 약 4.3
- N/A 셀(Book 1-2 음악성): 평가 자체를 옵셔널로. 종합 점수 계산 시 분모에서 제외
- 시드값은 **가설** — Suzuki 도메인 전문가 1인 + 학원 실 데이터 N=10 이후 1차 calibration 필수

**한계**
- Selection bias 미반영 (Book 10에 도달한 학생은 자체 선별됨)
- 연령 가중치 없음 (같은 Book 1이라도 4세와 9세 다름)
- 한국 학원 환경 ≠ 미국/유럽 학원 → 추가 보정 가능성

## 11. Ceiling 설계 v1

Book level별 표시 점수 천장. ABRSM Grade 매핑 기준.

| Book | Ceiling | 의미 |
|------|---------|------|
| 1    | 72      | Grade 1 만점 |
| 2    | 75      | Grade 2 |
| 3    | 78      | Grade 2-3 |
| 4    | 82      | Grade 3-4 |
| 5    | 85      | Grade 5-6 |
| 6    | 87      | Grade 6 |
| 7    | 90      | Grade 6-7 |
| 8    | 92      | Grade 7-8 |
| 9    | 94      | Grade 8 |
| 10   | 96      | Grade 8 + Bach double |

- 학생이 ceiling 도달 시 UI: "Book N 정상권. Book N+1로 진입하면 더 높은 ceiling 풀림"
- 절대 100 도달은 Book 10 + 추가 곡목 (Suzuki는 supplemental 필요, §6 참조)

## 12. 의사결정 v2 (사용자 확정 사항 반영)

| 항목 | 결정 | 근거 |
|---|---|---|
| 입력 척도 | 1-5 · 0.5 단위 | PubMed §5.2 14/26 = 5-point 표준 |
| 표시 척도 | 0-100, anchor=60 | ABRSM anchor 방식, 게임화 연구, FIFA 비유 |
| 또래 대비 | 학생별 on/off | Suzuki 비교 회피 + Bayesian 작은 N 보강 |
| Book ceiling | 도입 (§11) | PubMed §5.4 학습 단계 미차별 갭 + Suzuki↔ABRSM 매핑 |
| 차원 | **6 → 5 압축 (음정·박자·음색·음악성·자세활)** | PubMed §5.1 빈도 top 5 + ABRSM 5차원 매핑 |
| N/A 허용 | Book 1-2 음악성 | Bregman §7 단계별 의미 차이 |
| 톤 | "관찰 기록", 시험 점수 X | Suzuki 철학, DESIGN.md |

## 13. Schema 영향 (Codex 대기)

마이그레이션 **0005_scoring_v2** 후보:

```sql
-- 학생 메타 확장
alter table public.students
  add column if not exists show_peer_comparison boolean not null default false,
  add column if not exists suzuki_book_level smallint check (suzuki_book_level between 1 and 10);

-- Stream B 앱 스키마 변경 계획: 보고서 점수 형식 int → numeric(3,1), N/A 허용
-- scores_json 구조 후보: { intonation: 3.5 | null, rhythm: 4 | null, ... }
-- 기존 int 값은 앱 정규화 계층에서 .0으로 호환 처리

-- prior seed (옵션, 코드 상수로 시작 권장)
-- create table public.scoring_priors (
--   book_level smallint,
--   dimension text,
--   mu_prior numeric(4,1),
--   updated_at timestamptz,
--   primary key (book_level, dimension)
-- );
```

**권장**: Prior 시드값은 코드 상수로 시작 (`lib/scoring/priors.ts`). 학원 데이터 누적 후 admin UI + DB table로 승격.

## 14. 미해결 / 후속

- **시드값 calibration**: Suzuki 도메인 전문가 1인과 30분 인터뷰 + 학원 첫 10명 데이터
- **점수 입력 UX**: 슬라이더 vs 9-button row vs 5+half toggle — A/B 또는 사용자 호불호
- **시간축 진척 그래프**: recharts vs visx vs SVG (번들 사이즈 비교 필요)
- **종합 점수 산출**: 평균 vs 약점 가중 (ABRSM 보완 원칙 vs 약점 가시화) — Stream B에서 결정
- **plateau 해석 UX**: logistic 학습 곡선 plateau를 학부모에게 정상 구간임을 알리는 카피
- **연령 가중**: 같은 Book 1이라도 4세 vs 9세 prior 차등 — Cycle C

---

## Sources

### 평가 시스템·rubric 연구
- [ABRSM Practical Grades](https://www.abrsm.org/en-gb/practical-grades/about-practical-grades)
- [ABRSM: Graded music exam marking criteria](https://us.abrsm.org/en/our-exams/information-and-regulations/graded-music-exam-marking-criteria/)
- [PMC11496144: Solo Music Performance Assessment — Systematic Review](https://pmc.ncbi.nlm.nih.gov/articles/PMC11496144/)
- [KCI: 국악교육 수행평가를 위한 루브릭 개발 연구](https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART001672125)
- [iRubric: Elementary Music Performance Rubric](https://www.rcampus.com/rubricshowc.cfm?code=U8356X&sp=yes)
- [National Arts Standards: General Music Grade 5 Performing](https://www.nationalartsstandards.org/sites/default/files/Music_MCA_Grade_5_GenMus_Performing.pdf)

### Suzuki Method
- [Suzuki Association: Resources for Suzuki Researcher](https://suzukiassociation.org/journalarticle/resources-for-the-suzuki-researcher/)
- [Liberty University: Benefits of the Suzuki Method](https://digitalcommons.liberty.edu/cgi/viewcontent.cgi?article=5760&context=doctoral)
- [SAGE 2024: Systematic Review on Suzuki Method](https://journals.sagepub.com/doi/10.1177/21582440241297265)
- [Red Desert Violin: Suzuki ↔ ASTA/ABRSM/RCM Correlation](https://reddesertviolin.com/correlating-suzuki-levels-with-asta-the-abrsm-and-the-rcm/)
- [Violinspiration: Suzuki Books Overview](https://violinspiration.com/violin-pieces-suzuki/)
- [Teach Suzuki: Books 1-10 General Overview](http://teachsuzuki.blogspot.com/2011/12/suzuki-pathway-books-1-10-general.html)

### 학습 단계·timeline
- [Ben Bregman: Violin Student Journey](https://benbregman.medium.com/learning-the-violin-an-overview-of-the-student-journey-8d151b9e6856)
- [Violin Trend: How Long to Learn](https://violintrend.com/how-long-to-learn-the-violin/)
- [Mozart Project: Mastering the Violin Timeline](https://www.mozartproject.org/mastering-the-violin-unveiling-the-learning-timeline/)

### IRT / 베이지안 / 작은 N
- [Fujimoto & Neugebauer 2020: Bayesian MIRT](https://journals.sagepub.com/doi/10.1177/0013164419891205)
- [de la Torre & Hong 2010: Higher-Order IRT for Small Sample](https://journals.sagepub.com/doi/pdf/10.1177/0146621608329501)
- [arXiv 2108.08604: IRT Statistical Framework](https://arxiv.org/pdf/2108.08604)

### 음악 교육 게임화
- [Yanos PhD (UFL): Gamification in Music Education](https://ufdcimages.uflib.ufl.edu/AA/00/09/37/62/00001/Yanos_Mary.pdf)
- [Membrane Technology 2024: Gamified Music Apps](https://membranetechnology.org/index.php/journal/article/download/160/94/334)
- [ArchiTone (arXiv 2024): LEGO-Inspired Gamified Music](https://arxiv.org/pdf/2410.15273)
- [Frontiers Education 2025: Video-game Music](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2025.1681258/full)

### 학습 곡선 / motor skill
- [arXiv 1410.6049: Motor Skill Learning](https://arxiv.org/pdf/1410.6049)
- [PMC6783812: Latent Growth Curve Analysis of Motor Competence](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6783812/)
- [ScienceDirect: Individual Differences in Motor Skill Learning](https://www.sciencedirect.com/science/article/pii/S016794572100066X)

### 한국 음악 평가
- [SNU: 가창 실기평가 루브릭 개발](https://s-space.snu.ac.kr/handle/10371/127191)
- [Hanyang: 중학교 가창 수행평가 루브릭](https://repository.hanyang.ac.kr/handle/20.500.11754/136721)
- [한국교육과정평가원: 중등 음악과 수행평가 자료집](https://www.kice.re.kr/filedown8.do?fileNM=RDM200301400.pdf&filePath=/research/20130129/1359422731980_978)
