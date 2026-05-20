import type { Metadata } from "next";
import { ParentAccessForm } from "@/components/parent/ParentAccessForm";

export const metadata: Metadata = {
  title: "보고서 확인",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ParentAccessPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <main className="min-h-screen bg-[#fffdf8] px-4 py-8">
      <section className="mx-auto max-w-sm rounded-3xl border border-[#e5ded2] bg-white p-5 shadow-sm">
        <p className="text-xs font-black text-blue-700">스즈키 바이올린 성장 리포트</p>
        <h1 className="mt-2 text-2xl font-black text-slate-950">보고서 확인</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          학생 정보 보호를 위해 공유 링크 접속 후 한 번 더 확인합니다.
        </p>
        <div className="mt-6">
          <ParentAccessForm token={token} />
        </div>
      </section>
    </main>
  );
}

