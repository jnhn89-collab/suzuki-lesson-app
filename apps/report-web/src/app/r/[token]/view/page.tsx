import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import { ReportDocument } from "@/components/report/ReportDocument";
import { sampleReport } from "@/lib/report/content";

export default async function ParentReportViewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("parent_report_demo")?.value;

  if (token !== "demo-token" || sessionToken !== token) {
    redirect(`/r/${token}`);
  }

  return (
    <main className="min-h-screen bg-[#fffdf8]">
      <div className="no-print mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
        <div>
          <p className="text-xs font-black text-blue-700">학부모 보기</p>
          <h1 className="text-lg font-black text-slate-950">모바일 보고서</h1>
        </div>
        <PrintButton label="PDF 저장" />
      </div>
      <ReportDocument report={sampleReport} audience="parent" />
    </main>
  );
}

