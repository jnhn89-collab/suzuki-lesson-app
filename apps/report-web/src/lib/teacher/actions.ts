"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasParentSecurityEnv, requireEnv } from "@/lib/env";
import {
  academicPeriodSchema,
  buildStudentCode,
  studentCreateSchema,
} from "@/lib/report/schema";
import { hmacIdentifier } from "@/lib/security";
import { requireTeacherContext } from "./session";

export async function createStudentAction(formData: FormData) {
  const context = await requireTeacherContext();
  if (!hasParentSecurityEnv()) {
    redirect("/teacher/students?error=missing-pepper");
  }

  const parsed = studentCreateSchema.safeParse({
    name: formData.get("name"),
    birthDate: formData.get("birthDate"),
    parentName: formData.get("parentName"),
    parentPhoneLast4: formData.get("parentPhoneLast4"),
    currentPiece: formData.get("currentPiece") ?? "",
    ageGroup: formData.get("ageGroup") ?? "",
    schoolName: formData.get("schoolName"),
    enrollmentYear: Number(formData.get("enrollmentYear")),
    registrationYear: Number(formData.get("registrationYear")),
    registrationSequence: optionalNumber(formData.get("registrationSequence")),
  });

  if (!parsed.success) {
    redirect("/teacher/students?error=input");
  }

  const input = parsed.data;
  const sequence =
    input.registrationSequence ??
    (await getNextRegistrationSequence(context.supabase, context.user.id, input.registrationYear));
  const studentCode = buildStudentCode({
    schoolName: input.schoolName,
    registrationYear: input.registrationYear,
    registrationSequence: sequence,
  });
  const pepper = requireEnv("PARENT_ACCESS_PEPPER");
  const birthYYMMDD = toBirthYYMMDD(input.birthDate);

  const { data: student, error: studentError } = await context.supabase
    .from("students")
    .insert({
      teacher_id: context.user.id,
      name: input.name,
      birth_ymd: input.birthDate,
      birth_yymmdd_hmac: hmacIdentifier(birthYYMMDD, pepper),
      age_group: input.ageGroup,
      current_piece: input.currentPiece,
      school_name: input.schoolName,
      enrollment_year: input.enrollmentYear,
      registration_year: input.registrationYear,
      registration_sequence: sequence,
      student_code: studentCode,
    })
    .select("id")
    .single();

  if (studentError) {
    redirect("/teacher/students?error=student-db");
  }

  const { error: parentError } = await context.supabase.from("parents").insert({
    teacher_id: context.user.id,
    student_id: student.id,
    parent_name: input.parentName,
    phone_last4_hmac: hmacIdentifier(input.parentPhoneLast4, pepper),
  });

  if (parentError) {
    redirect("/teacher/students?error=parent-db");
  }

  revalidatePath("/teacher");
  revalidatePath("/teacher/students");
  redirect(`/teacher/students?created=${encodeURIComponent(studentCode)}`);
}

export async function createAcademicPeriodAction(formData: FormData) {
  const context = await requireTeacherContext();
  const parsed = academicPeriodSchema.safeParse({
    name: formData.get("name"),
    periodType: formData.get("periodType"),
    startsOn: formData.get("startsOn"),
    endsOn: formData.get("endsOn"),
    schoolYear: Number(formData.get("schoolYear")),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  });

  if (!parsed.success) {
    redirect("/teacher/periods?error=input");
  }

  const { error } = await context.supabase.from("academic_periods").insert({
    teacher_id: context.user.id,
    name: parsed.data.name,
    period_type: parsed.data.periodType,
    starts_on: parsed.data.startsOn,
    ends_on: parsed.data.endsOn,
    school_year: parsed.data.schoolYear,
    sort_order: parsed.data.sortOrder,
  });

  if (error) {
    redirect("/teacher/periods?error=db");
  }

  revalidatePath("/teacher");
  revalidatePath("/teacher/periods");
  revalidatePath("/teacher/reports/new");
  redirect("/teacher/periods?created=1");
}

async function getNextRegistrationSequence(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createSupabaseServerClient>>,
  teacherId: string,
  registrationYear: number,
) {
  const { data } = await supabase
    .from("students")
    .select("registration_sequence")
    .eq("teacher_id", teacherId)
    .eq("registration_year", registrationYear)
    .order("registration_sequence", { ascending: false })
    .limit(1)
    .maybeSingle();

  return Number(data?.registration_sequence ?? 0) + 1;
}

function optionalNumber(value: FormDataEntryValue | null) {
  if (value === null || value === "") return undefined;
  return Number(value);
}

function toBirthYYMMDD(date: string) {
  const [year, month, day] = date.split("-");
  return `${year.slice(2)}${month}${day}`;
}
