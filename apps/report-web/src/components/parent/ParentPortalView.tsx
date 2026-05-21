import Link from "next/link";
import { formatPeriod, getScoreInsight } from "@/lib/report/format";
import type { ReportData, StudentSummary } from "@/lib/report/types";
import { HexRadar } from "@/components/scoring/HexRadar";
import { coerceScores } from "@/lib/scoring/legacy";
import { SCORING_DIMENSIONS, deriveDisplayScore } from "@/lib/scoring/priors";

export function ParentPortalView({
  token,
  student,
  reports,
}: {
  token: string;
  student: StudentSummary;
  reports: Array<ReportData & { id: string }>;
}) {
  const latestReport = reports[0];

  return (
    <main className="min-h-screen bg-[#fffdf8] px-4 py-6">
      <section className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-[#e5ded2] bg-white p-5 shadow-sm">
          <p className="text-xs font-black text-blue-700">학부모 보고서함</p>
          <h1 className="mt-2 text-2xl font-black text-slate-950">{student.name} 보고서</h1>
          {latestReport ? <StudentRadarCard report={latestReport} /> : null}
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <Meta label="학생 코드" value={student.studentCode || "등록 대기"} />
            <Meta label="학교/등록연도" value={`${student.schoolName} · ${student.enrollmentYear}`} />
            <Meta label="현재 진도" value={student.currentPiece} />
            <Meta label="보고서 수" value={`${reports.length}개`} />
          </dl>
          {latestReport ? (
            <Link
              href={`/p/${token}/reports/${latestReport.id}`}
              className="mt-4 block rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white"
            >
              최신 보고서 바로 보기
            </Link>
          ) : null}
        </div>

        <div className="mt-5 space-y-3">
          {reports.length === 0 ? (
            <div className="rounded-3xl border border-[#e5ded2] bg-white p-5 text-sm font-bold leading-6 text-slate-600 shadow-sm">
              아직 공개된 보고서가 없습니다. 선생님이 보고서를 발행하면 이곳에 기간별로 쌓입니다.
            </div>
          ) : null}
          {reports.map((report) => {
            const insight = getScoreInsight(report.scores);
            return (
              <Link
                key={report.id}
                href={`/p/${token}/reports/${report.id}`}
                className="block rounded-3xl border border-[#e5ded2] bg-white p-5 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/30"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-500">{formatPeriod(report)}</p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">{report.periodName}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{report.currentPiece}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-black text-slate-600 sm:min-w-52">
                    <Badge label="평균" value={insight.average.toFixed(1)} />
                    <Badge label="강점" value={insight.top.label} />
                    <Badge label="다음" value={insight.growth.label} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function StudentRadarCard({ report }: { report: ReportData & { id: string } }) {
  const scoresV2 = coerceScores(report.scores as unknown);
  const display = Object.fromEntries(
    SCORING_DIMENSIONS.map((dim) => {
      const raw = scoresV2[dim];
      return [dim, raw == null ? null : deriveDisplayScore(raw)];
    }),
  ) as Partial<Record<(typeof SCORING_DIMENSIONS)[number], number | null>>;
  const presentValues = Object.values(display).filter(
    (v): v is number => typeof v === "number",
  );
  const overall =
    presentValues.length > 0
      ? Math.round(presentValues.reduce((a, b) => a + b, 0) / presentValues.length)
      : null;

  return (
    <div className="mt-4 grid items-center gap-3 rounded-2xl border border-[#e1dbcf] bg-[#fffdf8] p-3 sm:grid-cols-[200px_1fr]">
      <div className="flex justify-center">
        <HexRadar scores={display} size={200} ariaLabel="최근 보고서 영역별 점수" />
      </div>
      <div className="px-2">
        <p className="text-xs font-black text-blue-700">최근 보고서</p>
        <p className="mt-1 text-base font-black text-slate-950">{report.periodName}</p>
        <p className="mt-1 text-xs font-bold text-slate-500">{formatPeriod(report)}</p>
        {overall !== null ? (
          <p className="mt-3 text-sm font-black text-slate-700">
            종합 <span className="text-lg text-slate-950">{overall}</span>
            <span className="ml-1 text-xs font-bold text-slate-500">/ 100</span>
          </p>
        ) : null}
        <p className="mt-2 text-[11px] font-bold leading-5 text-slate-500">
          또래 대비가 아닌 이번 기간 관찰 기록입니다.
        </p>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-2">
      <dt className="text-[11px] font-black text-slate-500">{label}</dt>
      <dd className="overflow-wrap-anywhere mt-0.5 font-extrabold text-slate-900">{value}</dd>
    </div>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-2 py-2">
      <div className="text-[10px] text-slate-500">{label}</div>
      <div className="overflow-wrap-anywhere mt-0.5">{value}</div>
    </div>
  );
}
