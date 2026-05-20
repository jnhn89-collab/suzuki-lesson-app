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
            href="/teacher/students"
            className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-center font-black text-blue-900"
          >
            학생 관리 설계 보기
          </Link>
          <Link
            href="/teacher/reports/new"
            className="rounded-2xl bg-slate-950 px-5 py-4 text-center font-black text-white"
          >
            새 성과보고서 작성
          </Link>
          <Link
            href="/p/demo-portal"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-black text-slate-900"
          >
            학생 포털 인증 데모
          </Link>
        </div>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-black text-slate-950">확장된 관리 모델</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            <li>학생 식별자 예: 2026-HANBIT-001</li>
            <li>학교명, 등록연도, 등록순번으로 학생을 안정적으로 구분합니다.</li>
            <li>학부모는 학생 포털에서 여러 학기/분기 보고서를 목록으로 봅니다.</li>
            <li>보고서 하나짜리 링크는 유지하되, 운영 기본은 학생 포털 링크입니다.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
