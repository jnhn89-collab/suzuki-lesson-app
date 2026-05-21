import type { Metadata } from "next";
import { ParentPortalAccessForm } from "@/components/parent/ParentPortalAccessForm";
import {
  getParentPortalAccessContext,
  type ParentPortalAccessContext,
} from "@/lib/portal/service";

export const metadata: Metadata = {
  title: "학부모 보고서함 확인",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ParentPortalAccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const [{ error }, accessContext] = await Promise.all([
    searchParams,
    getParentPortalAccessContext(token),
  ]);

  return (
    <main className="min-h-screen bg-[#fffdf8] px-4 py-8">
      <section className="mx-auto max-w-sm rounded-3xl border border-[#e5ded2] bg-white p-5 shadow-sm">
        <p className="text-xs font-black text-blue-700">학부모 보고서함</p>
        <h1 className="mt-2 text-2xl font-black text-slate-950">보호자 확인</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          학생의 기간별 보고서를 확인하기 위해 보호자 정보를 입력해 주세요.
        </p>
        <SenderContext context={accessContext} />
        <div className="mt-6">
          <ParentPortalAccessForm token={token} hasError={error === "1"} />
        </div>
      </section>
    </main>
  );
}

function SenderContext({ context }: { context: ParentPortalAccessContext | null }) {
  const sender = context
    ? context.studioName || context.teacherName
    : "선생님이 전달한 보고서함 링크";
  const detail =
    context?.studioName && context.teacherName
      ? `${context.teacherName} 선생님`
      : context?.teacherName || "";

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
      <p className="text-[11px] font-black text-slate-500">보낸 곳</p>
      <p className="mt-1 font-black text-slate-950">{sender}</p>
      {detail ? <p className="mt-0.5 text-xs font-bold text-slate-500">{detail}</p> : null}
      <p className="mt-2 text-xs font-bold text-slate-500">
        {context?.isDemo
          ? "데모 보고서함입니다."
          : context?.issuedAt
            ? `링크 발송일 ${formatDate(context.issuedAt)}`
            : "전달받은 인증 정보로만 열람할 수 있습니다."}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
