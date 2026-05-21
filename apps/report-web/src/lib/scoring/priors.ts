// Prior 시드값 v1 — docs/SCORING_RESEARCH.md §10 기준.
// 학원 첫 10명 실 데이터 누적 후 calibrate 필요. 가설 단계.
// 베이지안 blend 수식:
//   peer_mean = (N_studio * mu_studio + k * mu_prior) / (N_studio + k)
// k=5 default — N_studio ≤ 5에서 prior 우세, N_studio ≥ 20에서 학원 데이터 우세.

export type ScoringDimension =
  | "intonation" // 음정 (ABRSM pitch)
  | "rhythm" // 박자 (ABRSM time)
  | "tone" // 음색
  | "musicality" // 음악성 (ABRSM shape/expression) — Book 1-2 N/A 권장
  | "technique"; // 자세·활 (ABRSM performance) — 기존 posture+bow 통합

export const SCORING_DIMENSIONS: ScoringDimension[] = [
  "intonation",
  "rhythm",
  "tone",
  "musicality",
  "technique",
];

export const DIMENSION_LABELS_KO: Record<ScoringDimension, string> = {
  intonation: "음정",
  rhythm: "박자",
  tone: "음색",
  musicality: "음악성",
  technique: "자세·활",
};

export type BookLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// 0-100 derived 척도 기준 prior 평균. null = N/A 권장 (Book 1-2 음악성).
export const PRIOR_MU: Record<BookLevel, Record<ScoringDimension, number | null>> = {
  1: { intonation: 50, rhythm: 55, tone: 45, musicality: null, technique: 50 },
  2: { intonation: 55, rhythm: 58, tone: 50, musicality: null, technique: 55 },
  3: { intonation: 58, rhythm: 60, tone: 55, musicality: 50, technique: 58 },
  4: { intonation: 62, rhythm: 63, tone: 60, musicality: 55, technique: 60 },
  5: { intonation: 65, rhythm: 66, tone: 63, musicality: 60, technique: 63 },
  6: { intonation: 68, rhythm: 70, tone: 67, musicality: 65, technique: 67 },
  7: { intonation: 72, rhythm: 73, tone: 70, musicality: 70, technique: 70 },
  8: { intonation: 75, rhythm: 76, tone: 73, musicality: 75, technique: 73 },
  9: { intonation: 78, rhythm: 78, tone: 77, musicality: 78, technique: 76 },
  10: { intonation: 80, rhythm: 80, tone: 80, musicality: 82, technique: 80 },
};

// Book level별 표시 점수 천장. ABRSM Grade 매핑.
export const BOOK_CEILING: Record<BookLevel, number> = {
  1: 72,
  2: 75,
  3: 78,
  4: 82,
  5: 85,
  6: 87,
  7: 90,
  8: 92,
  9: 94,
  10: 96,
};

// 1-5 raw 입력(0.5 단위)을 0-100 표시 척도로 변환.
// anchor=60 at raw=3.0. 학생 ceiling은 별도 표시 계층에서 cap.
export function deriveDisplayScore(raw: number): number {
  if (!Number.isFinite(raw)) return 0;
  if (raw <= 1) return 30;
  if (raw >= 5) return 90;
  // 1→30, 3→60, 5→90 선형 보간 (15 per unit)
  return Math.round(30 + (raw - 1) * 15);
}

// 베이지안 blend된 또래 평균.
export function peerMean({
  studioMu,
  studioN,
  bookLevel,
  dimension,
  priorWeight = 5,
}: {
  studioMu: number | null;
  studioN: number;
  bookLevel: BookLevel;
  dimension: ScoringDimension;
  priorWeight?: number;
}): number | null {
  const mu_prior = PRIOR_MU[bookLevel][dimension];
  if (mu_prior === null) return null; // N/A 차원
  if (studioMu === null || studioN <= 0) return mu_prior;
  return (
    (studioN * studioMu + priorWeight * mu_prior) / (studioN + priorWeight)
  );
}

// 종합 점수 산출 — N/A 차원 제외 후 평균. 약점 가중치는 Stream B에서 결정.
export function overallScore(
  scores: Partial<Record<ScoringDimension, number | null>>,
): number | null {
  const values = SCORING_DIMENSIONS.map((d) => scores[d]).filter(
    (v): v is number => typeof v === "number" && Number.isFinite(v),
  );
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
