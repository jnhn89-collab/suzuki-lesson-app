import Link from "next/link";
import { ReportEditor } from "@/components/report/ReportEditor";
import { getTeacherReportOptions } from "@/lib/teacher/data";

export const dynamic = "force-dynamic";

export default async function NewReportPage() {
  const data = await getTeacherReportOptions();
  const teacherName = data.context.status === "ready" ? data.context.profile.name : undefined;

  const needsStudents = data.context.status === "ready" && data.students.length === 0;
  const needsPeriods = data.context.status === "ready" && data.periods.length === 0;

  if (needsStudents || needsPeriods) {
    return <OnboardingCard needsStudents={needsStudents} needsPeriods={needsPeriods} />;
  }

  return (
    <ReportEditor
      students={data.students}
      periods={data.periods}
      canSaveToDatabase={data.canSaveToDatabase}
      teacherName={teacherName}
    />
  );
}

function OnboardingCard({
  needsStudents,
  needsPeriods,
}: {
  needsStudents: boolean;
  needsPeriods: boolean;
}) {
  return (
    <main className="min-h-screen bg-slate-100 px-5 py-10">
      <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-black text-blue-700">보고서 작성 준비</p>
        <h1 className="mt-2 text-2xl font-black text-slate-950">
          먼저 학생과 기간을 등록해 주세요
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          보고서는 등록된 학생과 학기/분기 정보를 기반으로 작성합니다. 아래 항목을 먼저 채우면 작성 화면이
          학생 이름·연령·곡·기간을 자동으로 채워 줍니다.
        </p>

        <div className="mt-6 grid gap-3">
          <ActionLink
            href="/teacher/students"
            done={!needsStudents}
            title="학생 등록"
            description="이름, 생년월일, 학부모 휴대폰 뒷자리, 현재 진도(곡)를 입력합니다."
          />
          <ActionLink
            href="/teacher/periods"
            done={!needsPeriods}
            title="평가 기간 등록"
            description="1학기 / 2학기 / 1-4분기 / 방학특강 등 빠른 등록 템플릿을 사용할 수 있습니다."
          />
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-600">
          두 항목이 모두 1개 이상 등록되면 이 화면이 자동으로 보고서 작성 화면으로 바뀝니다.
        </div>

        <div className="mt-6">
          <Link href="/teacher" className="text-sm font-black text-blue-700">
            ← 대시보드로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}

function ActionLink({
  href,
  title,
  description,
  done,
}: {
  href: string;
  title: string;
  description: string;
  done: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-2xl border p-4 transition ${
        done
          ? "border-emerald-200 bg-emerald-50 hover:border-emerald-300"
          : "border-slate-200 bg-white hover:border-blue-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={`mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
            done ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
          }`}
        >
          {done ? "✓" : "•"}
        </span>
        <div>
          <p className="text-sm font-black text-slate-950">{title}</p>
          <p className="mt-1 text-xs font-bold leading-5 text-slate-600">{description}</p>
        </div>
      </div>
    </Link>
  );
}
