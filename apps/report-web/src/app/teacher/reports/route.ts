import { randomInt, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { hasParentSecurityEnv, hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/env";
import { reportStoreSchema } from "@/lib/report/schema";
import { createPortalLinkToken, hashPassword, hashToken } from "@/lib/security";
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
  const resetPortalPin = Boolean(body?.resetPortalPin);

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

  const portalAccess = await getOrCreateStudentPortalAccess({
    supabase,
    request,
    teacherId: user.id,
    studentId: report.studentId,
    parentId: parent?.id ?? null,
    resetPortalPin,
  });

  if (!portalAccess) {
    return NextResponse.json(
      { error: "보고서는 저장됐지만 학생 포털 링크 처리에 실패했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    reportId: savedReport.id,
    portalUrl: portalAccess.portalUrl,
    portalPin: portalAccess.portalPin,
    portalPinStatus: portalAccess.portalPinStatus,
    teacherName: profile.name || report.teacherName,
  });
}

async function getOrCreateStudentPortalAccess({
  supabase,
  request,
  teacherId,
  studentId,
  parentId,
  resetPortalPin,
}: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  request: NextRequest;
  teacherId: string;
  studentId: string;
  parentId: string | null;
  resetPortalPin: boolean;
}) {
  const { data: existing, error: existingError } = await supabase
    .from("parent_portal_links")
    .select("id,expires_at,revoked_at")
    .eq("teacher_id", teacherId)
    .eq("student_id", studentId)
    .is("revoked_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingError) return null;

  if (existing && !isExpired(existing.expires_at)) {
    const portalPin = resetPortalPin ? createPin() : null;
    if (portalPin) {
      const { error } = await supabase
        .from("parent_portal_links")
        .update({
          pin_hash: hashPassword(portalPin),
          failed_attempts: 0,
          locked_until: null,
        })
        .eq("id", existing.id);

      if (error) return null;
    }

    const token = createPortalLinkToken(existing.id);
    return {
      portalUrl: new URL(`/p/${token}`, request.url).toString(),
      portalPin,
      portalPinStatus: portalPin ? "reset" : "existing",
    };
  }

  const linkId = randomUUID();
  const portalToken = createPortalLinkToken(linkId);
  const portalPin = createPin();
  const { error: portalError } = await supabase.from("parent_portal_links").insert({
    id: linkId,
    teacher_id: teacherId,
    student_id: studentId,
    parent_id: parentId,
    token_hash: hashToken(portalToken),
    pin_hash: hashPassword(portalPin),
  });

  if (portalError) return null;

  return {
    portalUrl: new URL(`/p/${portalToken}`, request.url).toString(),
    portalPin,
    portalPinStatus: "created",
  };
}

function isExpired(expiresAt: string | null) {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() <= Date.now();
}

function createPin() {
  return String(randomInt(100000, 1000000));
}
