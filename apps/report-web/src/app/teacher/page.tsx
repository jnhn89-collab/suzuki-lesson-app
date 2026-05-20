import Link from "next/link";

export default function TeacherDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-5 py-8">
      <section className="mx-auto max-w-4xl">
        <p className="text-xs font-black text-blue-700">Teacher Dashboard</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">선생님 대시보드</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          다음 단계에서 Supabase Auth를 연결해 로그인한 선생님의 학생과 보고서를 보여줍니다.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/teacher/reports/new"
            className="rounded-2xl bg-slate-950 px-5 py-4 text-center font-black text-white"
          >
            새 성과보고서 작성
          </Link>
          <Link
            href="/r/demo-token"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-black text-slate-900"
          >
            학부모 인증 데모
          </Link>
        </div>
      </section>
    </main>
  );
}

