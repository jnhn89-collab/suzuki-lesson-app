// Legacy 6차원 → 신 5차원 변환 도구. 0006 backfill SQL과 동일 규칙.
// posture+bow 평균 → technique. 한쪽만 있으면 그 값. 둘 다 없으면 null.
// 모든 read 경로에서 unknown 입력을 안전하게 Scores로 강제할 수 있어야 한다.

import type { Scores, ScoreValue, LegacyScores } from "./types";
import { emptyScores } from "./types";

const NEW_KEYS = ["intonation", "rhythm", "tone", "musicality", "technique"] as const;
const LEGACY_HINT_KEYS = ["posture", "bow"] as const;

export function legacyToScores(legacy: Partial<LegacyScores>): Scores {
  const posture = numericOrNull(legacy.posture);
  const bow = numericOrNull(legacy.bow);
  return {
    intonation: numericOrNull(legacy.intonation),
    rhythm: numericOrNull(legacy.rhythm),
    tone: numericOrNull(legacy.tone),
    musicality: numericOrNull(legacy.musicality),
    technique: combineTechnique(posture, bow),
  };
}

export function coerceScores(input: unknown): Scores {
  if (!isRecord(input)) return emptyScores();

  const hasLegacy = LEGACY_HINT_KEYS.some((key) => key in input);
  const hasNew = NEW_KEYS.some((key) => key in input);

  if (hasLegacy && !hasNew) {
    return legacyToScores(input as Partial<LegacyScores>);
  }

  return {
    intonation: numericOrNull(input.intonation),
    rhythm: numericOrNull(input.rhythm),
    tone: numericOrNull(input.tone),
    musicality: numericOrNull(input.musicality),
    technique: numericOrNull(input.technique),
  };
}

function combineTechnique(posture: ScoreValue, bow: ScoreValue): ScoreValue {
  if (posture !== null && bow !== null) {
    return Math.round(((posture + bow) / 2) * 10) / 10;
  }
  if (posture !== null) return posture;
  if (bow !== null) return bow;
  return null;
}

function numericOrNull(value: unknown): ScoreValue {
  if (value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  const clamped = Math.max(1, Math.min(5, n));
  // Round to 0.5 단위
  return Math.round(clamped * 2) / 2;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
