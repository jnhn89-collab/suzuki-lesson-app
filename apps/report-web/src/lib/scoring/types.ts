// Stream B 본 PR — 신 5차원 점수 타입.
// docs/SCORING_RESEARCH.md §10·§12 결정 반영.
// 기존 ReportData.scores(ScoreMap, 6차원 int)는 점진 전환을 위해 유지.
// 새 코드는 이 모듈의 Scores 타입을 사용한다.

import type { ScoringDimension } from "./priors";

// 0.5 단위 1.0~5.0, null = N/A (Book 1-2 음악성 등)
export type ScoreValue = number | null;

export type Scores = Record<ScoringDimension, ScoreValue>;

// Legacy 6차원 (posture·intonation·rhythm·tone·bow·musicality, int 1-5)
export type LegacyScoreCategoryId =
  | "posture"
  | "intonation"
  | "rhythm"
  | "tone"
  | "bow"
  | "musicality";

export type LegacyScores = Record<LegacyScoreCategoryId, number>;

export function emptyScores(): Scores {
  return {
    intonation: null,
    rhythm: null,
    tone: null,
    musicality: null,
    technique: null,
  };
}
