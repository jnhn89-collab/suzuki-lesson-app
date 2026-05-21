// Stream B 시안 — 선생님 입력용 0.5 단위 9-point 점수 행.
// orphan: 아직 routed page에서 import 안 됨. Stream B 본 PR에서 ReportEditor와 wire.
// 근거: docs/SCORING_RESEARCH.md §5.2 (PubMed 5-point 14/26 표준, 0.5 단위로 해상도 1.8x).

import { DIMENSION_LABELS_KO, type ScoringDimension } from "@/lib/scoring/priors";

const STEPS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] as const;

export function ScoreSliderRow({
  dimension,
  value,
  onChange,
  allowNa = false,
}: {
  dimension: ScoringDimension;
  value: number | null;
  onChange: (next: number | null) => void;
  allowNa?: boolean;
}) {
  return (
    <div className="grid grid-cols-[80px_1fr_40px] items-center gap-2">
      <div className="text-sm font-black text-slate-700">{DIMENSION_LABELS_KO[dimension]}</div>
      <div className="flex flex-wrap gap-1">
        {STEPS.map((step) => {
          const selected = value === step;
          const isWhole = Number.isInteger(step);
          return (
            <button
              key={step}
              type="button"
              onClick={() => onChange(step)}
              aria-pressed={selected}
              aria-label={`${DIMENSION_LABELS_KO[dimension]} ${step}점`}
              className={`flex h-11 items-center justify-center rounded-lg border text-xs font-black transition ${
                selected
                  ? "border-slate-950 bg-slate-950 text-white"
                  : isWhole
                    ? "border-slate-200 bg-white text-slate-700 hover:border-blue-200"
                    : "border-slate-100 bg-slate-50 text-slate-500 hover:border-blue-200"
              }`}
              style={{ width: isWhole ? 44 : 32 }}
            >
              {step}
            </button>
          );
        })}
        {allowNa ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-pressed={value === null}
            className={`flex h-11 items-center justify-center rounded-lg border px-3 text-xs font-black ${
              value === null
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-500 hover:border-blue-200"
            }`}
          >
            N/A
          </button>
        ) : null}
      </div>
      <div className="text-right text-sm font-black text-slate-700">
        {value == null ? "—" : value.toFixed(1)}
      </div>
    </div>
  );
}
