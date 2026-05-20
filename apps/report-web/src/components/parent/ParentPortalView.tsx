import Link from "next/link";
import { formatPeriod, getScoreInsight } from "@/lib/report/format";
import type { ReportData, StudentSummary } from "@/lib/report/types";

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
