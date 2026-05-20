import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fffdf8] px-5 py-10 text-slate-950">
      <section className="mx-auto max-w-3xl">
        <p className="text-xs font-black text-blue-700">Suzuki Report Web</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">분기/학기 성과보고서 웹앱</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          선생님이 기간 평가를 작성하고, 학부모는 보안 인증 후 모바일 보고서와 PDF를 확인하는
          앱입니다. 현재는 Supabase 연결 전 데모 흐름까지 구현되어 있습니다.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/teacher/reports/new"
            className="rounded-2xl bg-slate-950 px-5 py-4 text-center font-black text-white hover:bg-slate-800"
          >
            선생님 작성 데모
          </Link>
          <Link
            href="/r/demo-token"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-black text-slate-900 hover:bg-slate-50"
          >
            학부모 인증 데모
          </Link>
        </div>
      </section>
    </main>
  );
}

