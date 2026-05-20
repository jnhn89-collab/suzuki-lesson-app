import Link from "next/link";
import type { ReactNode } from "react";
import { hasSupabaseAdminEnv, hasSupabaseEnv, hasParentSecurityEnv } from "@/lib/env";
import { getTeacherHomeData } from "@/lib/teacher/data";
import { signOutTeacherAction } from "./login/actions";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const data = await getTeacherHomeData();
  const isConfigured = hasSupabaseEnv();
  const canVerifyParents = hasSupabaseAdminEnv() && hasParentSecurityEnv();

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-8">
      <section className="mx-auto max-w-4xl">
        <p className="text-xs font-black text-blue-700">Teacher Dashboard</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950">선생님 대시보드</h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              학생, 학기/분기, 발행 보고서를 관리하고 학부모에게 공유할 보고서함 링크를
              발급합니다.
            </p>
          </div>
          {data.context.status === "ready" ? (
            <form action={signOutTeacherAction}>
              <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700">
                로그아웃
              </button>
            </form>
          ) : (
            <Link
              href="/teacher/login"
              className="w-fit rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white"
            >
              로그인
            </Link>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatusCard label="학생" value={`${data.studentCount}명`} />
          <StatusCard label="기간" value={`${data.periodCount}개`} />
          <StatusCard label="보고서" value={`${data.reportCount}개`} />
        </div>

        {!isConfigured ? (
          <Notice tone="amber">
            Vercel 프로젝트에 Supabase 환경변수가 아직 없습니다. 현재 외부 웹은 데모 흐름만
            동작합니다.
          </Notice>
        ) : null}
        {isConfigured && data.context.status === "signed_out" ? (
          <Notice tone="blue">보고서를 저장하려면 선생님 로그인이 필요합니다.</Notice>
        ) : null}
        {isConfigured && !canVerifyParents ? (
          <Notice tone="amber">
            학부모 보고서함 인증까지 쓰려면 `SUPABASE_SERVICE_ROLE_KEY`와 `PARENT_ACCESS_PEPPER`가
            필요합니다.
          </Notice>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/teacher/students"
            className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-center font-black text-blue-900"
          >
            학생 등록/관리
          </Link>
          <Link
            href="/teacher/periods"
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center font-black text-emerald-900"
          >
            학기·분기 관리
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
            학부모 보고서함 데모
          </Link>
        </div>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-black text-slate-950">운영 기준</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
            <li>학생 식별자 예: 2026-한빛-001</li>
            <li>학교명, 등록연도, 등록순번으로 학생을 안정적으로 구분합니다.</li>
            <li>학부모는 보고서함에서 여러 학기/분기 보고서를 목록으로 봅니다.</li>
            <li>보고서를 추가해도 기존 보고서함 링크와 PIN을 계속 사용할 수 있습니다.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <div className="text-xs font-black text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-black text-slate-950">{value}</div>
    </div>
  );
}

function Notice({ children, tone }: { children: ReactNode; tone: "amber" | "blue" }) {
  const className =
    tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-blue-200 bg-blue-50 text-blue-900";

  return (
    <div className={`mt-5 rounded-3xl border p-4 text-sm font-bold leading-6 ${className}`}>
      {children}
    </div>
  );
}
