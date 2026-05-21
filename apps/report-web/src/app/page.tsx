import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fffdf8] px-5 py-10 text-slate-950">
      <section className="mx-auto max-w-3xl">
        <p className="text-xs font-black text-blue-700">Suzuki Report Web</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">분기/학기 성과보고서 웹앱</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          선생님이 기간 평가를 작성하고, 학부모는 보안 인증 후 모바일 보고서와 PDF를 확인하는
          앱입니다. Supabase 환경변수와 선생님 로그인이 있으면 학생/기간/보고서가 DB에
          저장됩니다.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/teacher/reports/new"
            className="rounded-2xl bg-slate-950 px-5 py-4 text-center font-black text-white hover:bg-slate-800"
          >
            선생님 작성
          </Link>
          <Link
            href="/p/demo-portal"
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center font-black text-emerald-900 hover:bg-emerald-100"
          >
            학부모 보고서함 데모
          </Link>
        </div>
      </section>
    </main>
  );
}
