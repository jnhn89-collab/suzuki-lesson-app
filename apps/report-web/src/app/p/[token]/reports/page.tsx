import { redirect } from "next/navigation";
import { ParentPortalView } from "@/components/parent/ParentPortalView";
import { getParentPortalSummary } from "@/lib/portal/service";

export default async function ParentPortalReportsPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const summary = await getParentPortalSummary(token);

  if (!summary) {
    redirect(`/p/${token}`);
  }

  return <ParentPortalView token={token} student={summary.student} reports={summary.reports} />;
}
