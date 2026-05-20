import { hasParentSecurityEnv, hasSupabaseAdminEnv } from "@/lib/env";
import { sampleReport, sampleStudent } from "@/lib/report/content";
import type {
  AcademicPeriod,
  StudentSummary,
  TeacherPeriodOption,
  TeacherStudentOption,
} from "@/lib/report/types";
import { getTeacherContext } from "./session";

export async function getTeacherHomeData() {
  const context = await getTeacherContext();
  if (context.status !== "ready") {
    return {
      context,
      studentCount: 0,
      periodCount: 0,
      reportCount: 0,
    };
  }

  const [students, periods, reports] = await Promise.all([
    context.supabase.from("students").select("id", { count: "exact", head: true }),
    context.supabase.from("academic_periods").select("id", { count: "exact", head: true }),
    context.supabase.from("reports").select("id", { count: "exact", head: true }),
  ]);

  return {
    context,
    studentCount: students.count ?? 0,
    periodCount: periods.count ?? 0,
    reportCount: reports.count ?? 0,
  };
}

export async function getTeacherStudentsPageData() {
  const context = await getTeacherContext();
  if (context.status !== "ready") {
    return {
      context,
      students: [sampleStudent],
    };
  }

  const { data, error } = await context.supabase
    .from("students")
    .select(
      "id,student_code,name,school_name,enrollment_year,registration_year,registration_sequence,age_group,current_piece,status,created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Student load failed: ${error.message}`);
  }

  return {
    context,
    students: (data ?? []).map((student): StudentSummary => ({
      id: student.id,
      studentCode: student.student_code ?? "",
      name: student.name,
      schoolName: student.school_name ?? "",
      enrollmentYear: student.enrollment_year ?? new Date().getFullYear(),
      registrationYear: student.registration_year ?? new Date().getFullYear(),
      registrationSequence: student.registration_sequence ?? 0,
      ageGroup: student.age_group,
      currentPiece: student.current_piece,
      status: student.status === "inactive" ? "inactive" : "active",
    })),
  };
}

export async function getTeacherPeriodsPageData() {
  const context = await getTeacherContext();
  if (context.status !== "ready") {
    return {
      context,
      periods: getDemoPeriods(),
    };
  }

  const { data, error } = await context.supabase
    .from("academic_periods")
    .select("id,name,period_type,starts_on,ends_on,school_year,sort_order,status")
    .order("starts_on", { ascending: false });

  if (error) {
    throw new Error(`Academic period load failed: ${error.message}`);
  }

  return {
    context,
    periods: (data ?? []).map(mapPeriod),
  };
}

export async function getTeacherReportOptions() {
  const context = await getTeacherContext();
  if (context.status !== "ready") {
    return {
      context,
      students: [
        {
          id: "demo-student",
          studentCode: sampleStudent.studentCode,
          name: sampleStudent.name,
          ageGroup: sampleStudent.ageGroup,
          currentPiece: sampleStudent.currentPiece,
        },
      ] satisfies TeacherStudentOption[],
      periods: getDemoPeriods().map((period) => ({
        id: period.id,
        name: period.name,
        startsOn: period.startsOn,
        endsOn: period.endsOn,
        schoolYear: period.schoolYear,
        periodType: period.periodType,
      })) satisfies TeacherPeriodOption[],
      canSaveToDatabase: false,
    };
  }

  const [studentsResult, periodsResult] = await Promise.all([
    context.supabase
      .from("students")
      .select("id,student_code,name,age_group,current_piece,status")
      .eq("status", "active")
      .order("name", { ascending: true }),
    context.supabase
      .from("academic_periods")
      .select("id,name,period_type,starts_on,ends_on,school_year,status")
      .eq("status", "active")
      .order("starts_on", { ascending: false }),
  ]);

  if (studentsResult.error) {
    throw new Error(`Student option load failed: ${studentsResult.error.message}`);
  }
  if (periodsResult.error) {
    throw new Error(`Period option load failed: ${periodsResult.error.message}`);
  }

  return {
    context,
    students: (studentsResult.data ?? []).map((student) => ({
      id: student.id,
      studentCode: student.student_code ?? "",
      name: student.name,
      ageGroup: student.age_group,
      currentPiece: student.current_piece,
    })) satisfies TeacherStudentOption[],
    periods: (periodsResult.data ?? []).map((period) => ({
      id: period.id,
      name: period.name,
      startsOn: period.starts_on,
      endsOn: period.ends_on,
      schoolYear: period.school_year ?? new Date().getFullYear(),
      periodType: period.period_type as TeacherPeriodOption["periodType"],
    })) satisfies TeacherPeriodOption[],
    canSaveToDatabase: hasSupabaseAdminEnv() && hasParentSecurityEnv(),
  };
}

function getDemoPeriods(): AcademicPeriod[] {
  return [
    {
      id: "demo-period",
      name: sampleReport.periodName,
      periodType: "semester",
      startsOn: sampleReport.periodStart,
      endsOn: sampleReport.periodEnd,
      schoolYear: 2026,
      sortOrder: 1,
      status: "active",
    },
  ];
}

function mapPeriod(period: {
  id: string;
  name: string;
  period_type: string;
  starts_on: string;
  ends_on: string;
  school_year: number | null;
  sort_order: number;
  status: string;
}): AcademicPeriod {
  return {
    id: period.id,
    name: period.name,
    periodType: period.period_type as AcademicPeriod["periodType"],
    startsOn: period.starts_on,
    endsOn: period.ends_on,
    schoolYear: period.school_year ?? new Date().getFullYear(),
    sortOrder: period.sort_order,
    status: period.status === "archived" ? "archived" : "active",
  };
}
