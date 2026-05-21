import { scoreCategories } from "./content";
import type { ReportData, ScoreCategoryId } from "./types";

export function formatKoreanDate(value: string) {
  if (!value) return "미입력";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "미입력";
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatPeriod(report: Pick<ReportData, "periodStart" | "periodEnd">) {
  return `${formatKoreanDate(report.periodStart)} - ${formatKoreanDate(report.periodEnd)}`;
}

export function getAverageScore(scores: ReportData["scores"]) {
  const values = scoreCategories
    .map((category) => scores[category.id])
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function getScoreInsight(scores: ReportData["scores"]) {
  const scored = scoreCategories.filter((category) => typeof scores[category.id] === "number");
  const categories = scored.length > 0 ? scored : scoreCategories;
  const top = categories.reduce((best, category) =>
    Number(scores[category.id] ?? 0) > Number(scores[best.id] ?? 0) ? category : best,
  );
  const growth = categories.reduce((weakest, category) =>
    Number(scores[category.id] ?? 0) < Number(scores[weakest.id] ?? 0) ? category : weakest,
  );

  return {
    average: getAverageScore(scores),
    top,
    growth,
  };
}

export function scorePercent(score: number | null) {
  if (score === null) return 0;
  return Math.max(0, Math.min(100, (score / 5) * 100));
}

export function categoryLabel(id: ScoreCategoryId) {
  return scoreCategories.find((category) => category.id === id)?.label ?? id;
}

export function buildPeriodSummary(report: ReportData) {
  const insight = getScoreInsight(report.scores);
  return `${report.studentName}: ${report.periodName} 동안 ${report.currentPiece}에서 특히 좋아진 부분은 ${insight.top.label}입니다. 다음 기간에는 ${insight.growth.label}을 중심으로 짧고 정확하게 반복해 보겠습니다.`;
}

export function buildTeacherSummary(report: ReportData) {
  const insight = getScoreInsight(report.scores);
  return `${report.periodName} 동안 ${insight.top.label} 영역이 안정적으로 자리 잡았습니다. ${insight.growth.label}은 아직 손에 익는 중이라, 다음 기간에는 속도를 올리기보다 좋은 소리와 바른 움직임을 먼저 확인하겠습니다.`;
}
