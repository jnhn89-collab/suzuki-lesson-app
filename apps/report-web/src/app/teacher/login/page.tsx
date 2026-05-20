import Link from "next/link";
import { hasSupabaseEnv } from "@/lib/env";
import { signInTeacherAction, signUpTeacherAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function TeacherLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const params = await searchParams;
  const isConfigured = hasSupabaseEnv();

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-8">
      <section className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-black text-blue-700">
          ← 처음으로
        </Link>
        <div className="mt-5 flex flex-col gap-2">
          <p className="text-xs font-black text-blue-700">Teacher Login</p>
          <h1 className="text-3xl font-black text-slate-950">선생님 로그인</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Supabase Auth 계정으로 접속하면 학생, 학기/분기, 보고서가 같은 DB에 저장됩니다.
          </p>
        </div>

        {!isConfigured ? (
          <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm font-bold leading-6 text-amber-900">
            Vercel 프로젝트에 Supabase 환경변수가 아직 없습니다.
            `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
            `SUPABASE_SERVICE_ROLE_KEY`, `PARENT_ACCESS_PEPPER`를 추가한 뒤 다시 배포해야
            실제 DB 로그인이 작동합니다.
          </div>
        ) : null}

        {params.error ? (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
            입력값 또는 계정 정보를 확인해 주세요. 코드: {params.error}
          </div>
        ) : null}

        {params.notice === "confirm-email" ? (
          <div className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-blue-900">
            이메일 확인이 필요한 Supabase 설정입니다. 메일 확인 후 로그인해 주세요.
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <AuthPanel title="로그인" action={signInTeacherAction} disabled={!isConfigured} />
          <AuthPanel title="새 선생님 등록" action={signUpTeacherAction} disabled={!isConfigured} signup />
        </div>
      </section>
    </main>
  );
}

function AuthPanel({
  title,
  action,
  disabled,
  signup = false,
}: {
  title: string;
  action: (formData: FormData) => Promise<void>;
  disabled: boolean;
  signup?: boolean;
}) {
  return (
    <form action={action} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
      <div className="mt-4 space-y-3">
        {signup ? (
          <>
            <Field label="선생님 이름" name="name" placeholder="예: 이선생" />
            <Field label="스튜디오/교실명" name="studioName" placeholder="예: 스즈키 바이올린" />
          </>
        ) : null}
        <Field label="이메일" name="email" type="email" placeholder="teacher@example.com" />
        <Field label="비밀번호" name="password" type="password" placeholder="6자 이상" />
      </div>
      <button
        disabled={disabled}
        className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {title}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1 text-xs font-extrabold text-slate-500">
      {label}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-900"
      />
    </label>
  );
}
