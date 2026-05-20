import { randomInt } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { hasParentSecurityEnv, hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/env";
import { reportStoreSchema } from "@/lib/report/schema";
import { createPublicToken, hashPassword, hashToken } from "@/lib/security";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureTeacherProfile } from "@/lib/teacher/session";

export async function POST(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase 환경변수가 없습니다." }, { status: 503 });
  }
  if (!hasSupabaseAdminEnv() || !hasParentSecurityEnv()) {
    return NextResponse.json(
      { error: "학부모 포털 인증용 환경변수가 없습니다." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = reportStoreSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "보고서 입력값을 확인해 주세요." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "선생님 로그인이 필요합니다." }, { status: 401 });
  }

  const profile = await ensureTeacherProfile(supabase, user);
  const report = parsed.data;
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("id", report.studentId)
    .eq("teacher_id", user.id)
    .single();

  if (studentError || !student) {
    return NextResponse.json({ error: "학생 정보를 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: parent } = await supabase
    .from("parents")
    .select("id")
    .eq("student_id", report.studentId)
    .eq("teacher_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: savedReport, error: reportError } = await supabase
    .from("reports")
    .insert({
      teacher_id: user.id,
      student_id: report.studentId,
      academic_period_id: report.academicPeriodId ?? null,
      period_name: report.periodName,
      period_start: report.periodStart,
      period_end: report.periodEnd,
      total_lessons: report.totalLessons,
      completed_pieces: report.completedPieces,
      current_piece: report.currentPiece,
      scores_json: report.scores,
      focus_tags_json: report.focusTags,
      strengths: report.strengths,
      growth_area: report.growthArea,
      home_support: report.homeSupport,
      practice_plan: report.practicePlan,
      daily_minutes: report.dailyMinutes,
      daily_reps: report.dailyReps,
      status: "published",
      visible_to_parent: true,
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (reportError || !savedReport) {
    return NextResponse.json({ error: "보고서 저장에 실패했습니다." }, { status: 500 });
  }

  const portalToken = createPublicToken();
  const portalPin = createPin();
  const { error: portalError } = await supabase.from("parent_portal_links").insert({
    teacher_id: user.id,
    student_id: report.studentId,
    parent_id: parent?.id ?? null,
    token_hash: hashToken(portalToken),
    pin_hash: hashPassword(portalPin),
  });

  if (portalError) {
    return NextResponse.json(
      { error: "보고서는 저장됐지만 학부모 포털 링크 생성에 실패했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    reportId: savedReport.id,
    portalUrl: new URL(`/p/${portalToken}`, request.url).toString(),
    portalPin,
    teacherName: profile.name || report.teacherName,
  });
}

function createPin() {
  return String(randomInt(100000, 1000000));
}
