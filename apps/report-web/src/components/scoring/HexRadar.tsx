// Stream B 시안 — 학부모 화면 5축 hexagonal radar.
// orphan: 아직 routed page에서 import 안 됨. 0005 DB push 및 schema 정리 후 wire.
// 근거: docs/SCORING_RESEARCH.md §4 (게임화 radar), §10 (5차원).

import { DIMENSION_LABELS_KO, SCORING_DIMENSIONS, type ScoringDimension } from "@/lib/scoring/priors";

type Scores = Partial<Record<ScoringDimension, number | null>>;

export function HexRadar({
  scores,
  size = 280,
  showLabels = true,
  ariaLabel,
}: {
  scores: Scores;
  size?: number;
  showLabels?: boolean;
  ariaLabel?: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size / 2) * 0.7;
  const dims = SCORING_DIMENSIONS;
  const n = dims.length;

  function vertex(i: number, scale: number) {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return {
      x: cx + radius * scale * Math.cos(angle),
      y: cy + radius * scale * Math.sin(angle),
    };
  }

  const rings = [0.25, 0.5, 0.75, 1.0];

  const scorePoints = dims.map((dim, i) => {
    const val = scores[dim];
    const scale = val == null ? 0 : Math.max(0, Math.min(100, val)) / 100;
    return { ...vertex(i, scale), present: val != null };
  });

  const presentPoints = scorePoints.filter((p) => p.present);
  const scorePath =
    presentPoints.length > 0
      ? presentPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z"
      : "";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={ariaLabel ?? "학생 영역별 점수 그래프"}
      className="overflow-visible"
    >
      <defs>
        <linearGradient id="hex-radar-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2457c5" />
          <stop offset="100%" stopColor="#16845c" />
        </linearGradient>
      </defs>

      {rings.map((r, idx) => {
        const pts = dims.map((_, i) => vertex(i, r));
        const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
        return (
          <path
            key={r}
            d={d}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={idx === rings.length - 1 ? 2 : 1}
          />
        );
      })}

      {dims.map((_, i) => {
        const outer = vertex(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="#e2e8f0" strokeWidth={1} />;
      })}

      {scorePath ? (
        <path d={scorePath} fill="url(#hex-radar-fill)" fillOpacity={0.35} stroke="#2457c5" strokeWidth={2} />
      ) : null}

      {scorePoints.map((p, i) =>
        p.present ? <circle key={dims[i]} cx={p.x} cy={p.y} r={4} fill="#2457c5" /> : null,
      )}

      {showLabels
        ? dims.map((dim, i) => {
            const labelPos = vertex(i, 1.18);
            const val = scores[dim];
            return (
              <g key={dim}>
                <text
                  x={labelPos.x}
                  y={labelPos.y - 6}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-700"
                  style={{ fontSize: 12, fontWeight: 800 }}
                >
                  {DIMENSION_LABELS_KO[dim]}
                </text>
                <text
                  x={labelPos.x}
                  y={labelPos.y + 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-500"
                  style={{ fontSize: 10, fontWeight: 700 }}
                >
                  {val == null ? "N/A" : Math.round(val)}
                </text>
              </g>
            );
          })
        : null}
    </svg>
  );
}
