import Link from "next/link";
import { notFound } from "next/navigation";
import { updateStudentScoringSettingsAction } from "@/lib/teacher/actions";
import { getTeacherStudentDetailData } from "@/lib/teacher/data";

export const dynamic = "force-dynamic";

export default async function TeacherStudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  const [{ studentId }, query] = await Promise.all([params, searchParams]);
  const data = await getTeacherStudentDetailData(studentId);

  if (!data.student) {
    notFound();
  }

  const canWrite = data.context.status === "ready";
  const student = data.student;

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-8">
      <section className="mx-auto max-w-3xl">
        <Link href="/teacher/students" className="text-sm font-black text-blue-700">
          ← 학생 목록
        </Link>

        <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black text-blue-700">{student.studentCode || "STUDIO"}</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">{student.name}</h1>
          <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
            <Meta label="현재 진도" value={student.currentPiece || "미입력"} />
            <Meta label="학교" value={student.schoolName || "미입력"} />
            <Meta label="등록연도/순번" value={`${student.registrationYear}-${student.registrationSequence}`} />
            <Meta label="상태" value={student.status === "active" ? "재원" : "비활성"} />
          </dl>
        </div>

        {query.updated ? <Notice tone="green">점수 설정을 저장했습니다.</Notice> : null}
        {query.error ? <Notice tone="red">점수 설정 저장 중 오류가 발생했습니다: {query.error}</Notice> : null}
        {!canWrite ? (
          <Notice tone="amber">
            현재는 데모 보기입니다. 실제 설정 저장은 선생님 로그인과 Supabase 환경 설정이 필요합니다.
          </Notice>
        ) : null}

        <form
          action={updateStudentScoringSettingsAction}
          className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <input type="hidden" name="studentId" value={student.id} />
          <h2 className="text-lg font-black text-slate-950">점수 시스템 설정</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Book 단계와 또래 대비 표시 여부는 학생별로 한 번 정해두고, 이후 보고서에서 같은 기준으로 사용합니다.
          </p>

          <label className="mt-5 grid gap-1 text-xs font-extrabold text-slate-500">
            Suzuki Book 단계
            <select
              name="suzukiBookLevel"
              defaultValue={student.suzukiBookLevel ?? ""}
              disabled={!canWrite}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="">미설정</option>
              {Array.from({ length: 10 }, (_, index) => index + 1).map((level) => (
                <option key={level} value={level}>
                  Book {level}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold leading-6 text-slate-700">
            <input
              type="checkbox"
              name="showPeerComparison"
              defaultChecked={Boolean(student.showPeerComparison)}
              disabled={!canWrite}
              className="mt-1"
            />
            <span>
              학부모 보고서에서 또래 대비 보조선을 표시합니다. 비교가 부담되는 학생은 끄고, 성장 기준만
              보여주는 편이 좋습니다.
            </span>
          </label>

          <button
            disabled={!canWrite}
            className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            점수 설정 저장
          </button>
        </form>
      </section>
    </main>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-2">
      <dt className="text-[11px] font-black text-slate-500">{label}</dt>
      <dd className="overflow-wrap-anywhere mt-0.5 font-black text-slate-900">{value}</dd>
    </div>
  );
}

function Notice({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "amber" | "green" | "red";
}) {
  const className = {
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    green: "border-emerald-200 bg-emerald-50 text-emerald-900",
    red: "border-red-200 bg-red-50 text-red-800",
  }[tone];

  return <div className={`mt-5 rounded-3xl border p-4 text-sm font-bold leading-6 ${className}`}>{children}</div>;
}
