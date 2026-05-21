import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { PrintButton } from "@/components/PrintButton";
import { ReportDocument } from "@/components/report/ReportDocument";
import { getParentPortalReport } from "@/lib/portal/service";

export default async function ParentPortalReportDetailPage({
  params,
}: {
  params: Promise<{ token: string; reportId: string }>;
}) {
  const { token, reportId } = await params;
  const report = await getParentPortalReport(token, reportId);

  if (!report) {
    redirect(`/p/${token}`);
  }
  if (report.id !== reportId) notFound();

  return (
    <main className="min-h-screen bg-[#fffdf8]">
      <div className="no-print mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
        <Link href={`/p/${token}/reports`} className="text-sm font-black text-blue-700">
          ← 보고서 목록
        </Link>
        <PrintButton label="PDF 저장" fileName={`${report.studentName}_${report.periodName}_보고서`} />
      </div>
      <ReportDocument report={report} audience="parent" />
    </main>
  );
}
