import { ReportEditor } from "@/components/report/ReportEditor";
import { getTeacherReportOptions } from "@/lib/teacher/data";

export const dynamic = "force-dynamic";

export default async function NewReportPage() {
  const data = await getTeacherReportOptions();
  const teacherName = data.context.status === "ready" ? data.context.profile.name : undefined;

  return (
    <ReportEditor
      students={data.students}
      periods={data.periods}
      canSaveToDatabase={data.canSaveToDatabase}
      teacherName={teacherName}
    />
  );
}
