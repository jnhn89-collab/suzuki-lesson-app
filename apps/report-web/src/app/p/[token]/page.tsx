import type { Metadata } from "next";
import { ParentPortalAccessForm } from "@/components/parent/ParentPortalAccessForm";

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
  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-[#fffdf8] px-4 py-8">
      <section className="mx-auto max-w-sm rounded-3xl border border-[#e5ded2] bg-white p-5 shadow-sm">
        <p className="text-xs font-black text-blue-700">학부모 보고서함</p>
        <h1 className="mt-2 text-2xl font-black text-slate-950">보호자 확인</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          학생의 기간별 보고서를 확인하기 위해 보호자 정보를 입력해 주세요.
        </p>
        <div className="mt-6">
          <ParentPortalAccessForm token={token} hasError={error === "1"} />
        </div>
      </section>
    </main>
  );
}
