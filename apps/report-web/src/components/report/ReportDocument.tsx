import {
  buildPeriodSummary,
  buildTeacherSummary,
  formatPeriod,
  getScoreInsight,
} from "@/lib/report/format";
import type { ReportData } from "@/lib/report/types";
import { HexRadar } from "@/components/scoring/HexRadar";
import { coerceScores } from "@/lib/scoring/legacy";
import {
  DIMENSION_LABELS_KO,
  SCORING_DIMENSIONS,
  deriveDisplayScore,
} from "@/lib/scoring/priors";

type ReportDocumentProps = {
  report: ReportData;
  audience?: "teacher" | "parent";
};

export function ReportDocument({ report, audience = "teacher" }: ReportDocumentProps) {
  return (
    <article className="report-surface mx-auto w-full max-w-3xl overflow-hidden bg-[#fffdf8] text-slate-900 shadow-xl print:max-w-none print:shadow-none">
      <header className="border-b border-[#e5ded2] bg-[linear-gradient(90deg,rgba(36,87,197,.08),rgba(22,132,92,.07))] px-5 py-6 sm:px-8">
        <div className="mb-3 text-xs font-black text-blue-700">스즈키 바이올린 성장 리포트</div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-balance text-2xl font-black leading-tight sm:text-3xl">
            {report.studentName}의 {report.periodName} 기록
          </h1>
          <div className="w-fit rounded-full border border-[#ded8cd] bg-white/75 px-3 py-2 text-xs font-extrabold text-slate-600">
            {formatPeriod(report)}
          </div>
        </div>
        <p className="mt-5 max-w-2xl text-pretty text-base font-semibold leading-8 text-slate-700">
          {buildPeriodSummary(report)}
        </p>
        <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
          <Meta label="현재 진도" value={report.currentPiece} />
          <Meta label="담당" value={report.teacherName} />
          <Meta label="기간 내 레슨" value={`${report.totalLessons}회`} />
          <Meta label="정리한 곡" value={`${report.completedPieces}곡`} />
        </dl>
      </header>

      <div className="space-y-5 px-5 py-6 sm:px-8">
        {audience === "parent" ? (
          <>
            <Section title="기간 요약" tone="blue">
              {buildTeacherSummary(report)}
            </Section>
            <Section title="이번 기간 좋아진 점" tone="green">
              {report.strengths}
            </Section>
            <Section title="다음에 잡아볼 점" tone="amber">
              {report.growthArea}
            </Section>
          </>
        ) : (
          <>
            <MetricStrip report={report} />
            <Section title="기간 요약" tone="blue">
              {buildTeacherSummary(report)}
            </Section>
          </>
        )}

        <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
          <div className="space-y-5">
            {audience === "teacher" ? (
              <>
                <Section title="이번 기간 좋아진 점" tone="green">
                  {report.strengths}
                </Section>
                <Section title="다음에 잡아볼 점" tone="amber">
                  {report.growthArea}
                </Section>
              </>
            ) : null}

            <section className="break-inside-avoid">
              <h2 className="mb-2 text-base font-black">다음 기간 연습 방향</h2>
              <div className="grid gap-2">
                <PracticeRow label="방법">{report.practicePlan}</PracticeRow>
                <PracticeRow label="기준">
                  {report.dailyMinutes}분 내외로, 핵심 구간을 {report.dailyReps}회 반복
                </PracticeRow>
                <PracticeRow label="부모님께">{report.homeSupport}</PracticeRow>
              </div>
            </section>
          </div>

          <div className="space-y-5">
            {audience === "parent" ? <MetricStrip report={report} /> : null}

            <DimensionScores report={report} />


            <section className="break-inside-avoid">
              <h2 className="mb-2 text-base font-black">이번 기간 키워드</h2>
              <div className="flex flex-wrap gap-2">
                {report.focusTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-extrabold text-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}

function DimensionScores({ report }: { report: ReportData }) {
  const scoresV2 = coerceScores(report.scores as unknown);
  const displayScores = Object.fromEntries(
    SCORING_DIMENSIONS.map((dim) => {
      const raw = scoresV2[dim];
      return [dim, raw == null ? null : deriveDisplayScore(raw)];
    }),
  ) as Partial<Record<(typeof SCORING_DIMENSIONS)[number], number | null>>;

  return (
    <section className="break-inside-avoid">
      <h2 className="mb-2 text-base font-black">영역별 기록</h2>
      <div className="rounded-2xl border border-[#e1dbcf] bg-white/70 p-4">
        <div className="flex justify-center">
          <HexRadar scores={displayScores} size={200} />
        </div>
        <div className="mt-4 space-y-2">
          {SCORING_DIMENSIONS.map((dim) => {
            const raw = scoresV2[dim];
            const display = displayScores[dim];
            return (
              <div
                key={dim}
                className="grid grid-cols-[64px_1fr_44px] items-center gap-3 text-sm font-extrabold text-slate-600"
              >
                <div>{DIMENSION_LABELS_KO[dim]}</div>
                <div className="h-2 overflow-hidden rounded-full bg-[#e5ded2]">
                  {typeof display === "number" ? (
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#2457c5,#16845c)]"
                      style={{ width: `${display}%` }}
                    />
                  ) : null}
                </div>
                <div className="text-right">{raw == null ? "—" : raw.toFixed(1)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MetricStrip({ report }: { report: ReportData }) {
  const insight = getScoreInsight(report.scores);

  return (
    <dl className="grid grid-cols-2 gap-2 break-inside-avoid sm:grid-cols-4">
      <Metric label="기간 평균" value={insight.average.toFixed(1)} />
      <Metric label="가장 좋았던 부분" value={insight.top.label} />
      <Metric label="다음에 볼 부분" value={insight.growth.label} />
      <Metric label="기간 내 레슨" value={`${report.totalLessons}회`} />
    </dl>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e2dbcf] bg-white/60 p-3">
      <dt className="mt-1 text-[11px] font-black text-slate-500">{label}</dt>
      <dd className="overflow-wrap-anywhere text-lg font-black text-slate-950">{value}</dd>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e0d9cc] bg-white/70 px-3 py-2">
      <dt className="text-[11px] font-black text-slate-500">{label}</dt>
      <dd className="overflow-wrap-anywhere mt-0.5 font-extrabold text-slate-800">{value}</dd>
    </div>
  );
}

function Section({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "blue" | "green" | "amber";
  children: React.ReactNode;
}) {
  const toneClass = {
    blue: "border-blue-100 bg-blue-50",
    green: "border-emerald-100 bg-emerald-50",
    amber: "border-amber-100 bg-amber-50",
  }[tone];

  return (
    <section className="break-inside-avoid">
      <h2 className="mb-2 text-base font-black">{title}</h2>
      <div className={`${toneClass} whitespace-pre-line rounded-2xl border p-4 leading-8 text-slate-700`}>
        {children}
      </div>
    </section>
  );
}

function PracticeRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 rounded-2xl border border-[#e1dbcf] bg-white/70 p-4 leading-7 text-slate-700 sm:grid-cols-[80px_1fr]">
      <div className="text-sm font-black text-slate-500">{label}</div>
      <div className="overflow-wrap-anywhere whitespace-pre-line">{children}</div>
    </div>
  );
}
