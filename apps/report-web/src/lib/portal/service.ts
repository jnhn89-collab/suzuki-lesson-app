import { cookies } from "next/headers";
import { getDemoPortalData } from "@/lib/demo";
import { hasParentSecurityEnv, hasSupabaseAdminEnv, requireEnv } from "@/lib/env";
import { scoreCategories } from "@/lib/report/content";
import type { ParentAccessInput, ParentPortalSummary, ReportData, ScoreMap } from "@/lib/report/types";
import {
  createPublicToken,
  hashToken,
  hmacIdentifier,
  safeEqualString,
  verifyPassword,
} from "@/lib/security";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const PORTAL_SESSION_COOKIE = "parent_portal_session";

export async function getParentPortalSummary(token: string): Promise<ParentPortalSummary | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("parent_portal_demo")?.value;

  if (token === "demo-portal" && sessionToken === token) {
    return getDemoPortalData();
  }

  const dbSessionToken = cookieStore.get(PORTAL_SESSION_COOKIE)?.value;

  if (!hasSupabaseAdminEnv() || !dbSessionToken) return null;

  return getParentPortalSummaryFromDatabase(token, dbSessionToken);
}

export async function getParentPortalReport(token: string, reportId: string) {
  const summary = await getParentPortalSummary(token);
  if (!summary) return null;
  return summary.reports.find((report) => report.id === reportId) ?? null;
}

export async function verifyParentPortalAccess(
  input: ParentAccessInput,
): Promise<{ ok: true; sessionToken: string; maxAge: number } | { ok: false }> {
  if (input.token === "demo-portal") {
    return { ok: false };
  }

  if (!hasSupabaseAdminEnv() || !hasParentSecurityEnv()) {
    return { ok: false };
  }

  const pepper = requireEnv("PARENT_ACCESS_PEPPER");
  const supabase = createSupabaseAdminClient();
  const tokenHash = hashToken(input.token);
  const { data: link } = await supabase
    .from("parent_portal_links")
    .select(
      "id,student_id,parent_id,pin_hash,max_attempts,failed_attempts,locked_until,expires_at,revoked_at",
    )
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!link || isRevokedOrExpired(link)) {
    return { ok: false };
  }

  if (link.locked_until && new Date(link.locked_until).getTime() > Date.now()) {
    return { ok: false };
  }

  const [{ data: student }, parentResult] = await Promise.all([
    supabase
      .from("students")
      .select("id,birth_yymmdd_hmac,status")
      .eq("id", link.student_id)
      .maybeSingle(),
    loadParentForLink(supabase, link.student_id, link.parent_id),
  ]);
  const parent = parentResult.data;

  const birthMatches =
    Boolean(student?.birth_yymmdd_hmac) &&
    safeEqualString(hmacIdentifier(input.birthYYMMDD, pepper), student?.birth_yymmdd_hmac ?? "");
  const phoneMatches =
    Boolean(parent?.phone_last4_hmac) &&
    safeEqualString(hmacIdentifier(input.phoneLast4, pepper), parent?.phone_last4_hmac ?? "");
  const pinMatches = verifyPassword(input.pin, link.pin_hash);

  if (student?.status !== "active" || !birthMatches || !phoneMatches || !pinMatches) {
    await recordFailure(link.id, Number(link.failed_attempts ?? 0), Number(link.max_attempts ?? 5));
    return { ok: false };
  }

  const sessionToken = createPublicToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
  const { error: sessionError } = await supabase.from("parent_portal_sessions").insert({
    portal_link_id: link.id,
    student_id: link.student_id,
    parent_id: parent?.id ?? link.parent_id ?? null,
    session_hash: hashToken(sessionToken),
    expires_at: expiresAt.toISOString(),
  });

  if (sessionError) {
    return { ok: false };
  }

  await supabase
    .from("parent_portal_links")
    .update({
      failed_attempts: 0,
      locked_until: null,
      last_success_at: new Date().toISOString(),
    })
    .eq("id", link.id);

  return { ok: true, sessionToken, maxAge: 60 * 60 * 24 * 14 };
}

export function getPortalSessionCookieName() {
  return PORTAL_SESSION_COOKIE;
}

async function getParentPortalSummaryFromDatabase(
  token: string,
  sessionToken: string,
): Promise<ParentPortalSummary | null> {
  const supabase = createSupabaseAdminClient();
  const { data: link } = await supabase
    .from("parent_portal_links")
    .select("id,student_id,parent_id,expires_at,revoked_at")
    .eq("token_hash", hashToken(token))
    .maybeSingle();

  if (!link || isRevokedOrExpired(link)) return null;

  const { data: session } = await supabase
    .from("parent_portal_sessions")
    .select("id,student_id,parent_id,expires_at,revoked_at")
    .eq("portal_link_id", link.id)
    .eq("session_hash", hashToken(sessionToken))
    .maybeSingle();

  if (!session || isRevokedOrExpired(session)) return null;
  if (session.student_id !== link.student_id) return null;

  const [{ data: student }, { data: reports }] = await Promise.all([
    supabase
      .from("students")
      .select(
        "id,teacher_id,student_code,name,school_name,enrollment_year,registration_year,registration_sequence,age_group,current_piece,status",
      )
      .eq("id", link.student_id)
      .maybeSingle(),
    supabase
      .from("reports")
      .select(
        "id,academic_period_id,period_name,period_start,period_end,total_lessons,completed_pieces,current_piece,scores_json,focus_tags_json,strengths,growth_area,home_support,practice_plan,daily_minutes,daily_reps,status,teacher_id",
      )
      .eq("student_id", link.student_id)
      .eq("visible_to_parent", true)
      .eq("status", "published")
      .order("period_start", { ascending: false }),
  ]);

  if (!student || student.status !== "active") return null;

  const { data: teacher } = await supabase
    .from("teacher_profiles")
    .select("id,name,studio_name")
    .eq("id", student.teacher_id)
    .maybeSingle();

  const teacherName = teacher?.name || teacher?.studio_name || "담당 선생님";

  return {
    student: {
      id: student.id,
      studentCode: student.student_code ?? "",
      name: student.name,
      schoolName: student.school_name ?? "",
      enrollmentYear: student.enrollment_year ?? new Date().getFullYear(),
      registrationYear: student.registration_year ?? new Date().getFullYear(),
      registrationSequence: student.registration_sequence ?? 0,
      ageGroup: student.age_group,
      currentPiece: student.current_piece,
      status: "active",
    },
    reports: (reports ?? []).map((report) => mapReport(report, student.name, teacherName)),
  };
}

async function loadParentForLink(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  studentId: string,
  parentId: string | null,
) {
  let query = supabase
    .from("parents")
    .select("id,phone_last4_hmac,status")
    .eq("student_id", studentId)
    .eq("status", "active")
    .limit(1);

  if (parentId) {
    query = query.eq("id", parentId);
  }

  return query.maybeSingle();
}

async function recordFailure(linkId: string, failedAttempts: number, maxAttempts: number) {
  const supabase = createSupabaseAdminClient();
  const lockedUntil =
    failedAttempts + 1 >= maxAttempts ? new Date(Date.now() + 1000 * 60 * 15).toISOString() : null;

  await supabase
    .from("parent_portal_links")
    .update({
      failed_attempts: failedAttempts + 1,
      locked_until: lockedUntil,
      last_failed_at: new Date().toISOString(),
    })
    .eq("id", linkId);
}

function isRevokedOrExpired(value: {
  revoked_at?: string | null;
  expires_at?: string | null;
}) {
  if (value.revoked_at) return true;
  if (!value.expires_at) return false;
  return new Date(value.expires_at).getTime() <= Date.now();
}

function mapReport(
  report: {
    id: string;
    academic_period_id: string | null;
    period_name: string;
    period_start: string;
    period_end: string;
    total_lessons: number;
    completed_pieces: number;
    current_piece: string;
    scores_json: unknown;
    focus_tags_json: unknown;
    strengths: string;
    growth_area: string;
    home_support: string;
    practice_plan: string;
    daily_minutes: number;
    daily_reps: number;
    status: string;
  },
  studentName: string,
  teacherName: string,
): ReportData & { id: string; academicPeriodId?: string } {
  return {
    id: report.id,
    academicPeriodId: report.academic_period_id ?? undefined,
    studentName,
    periodName: report.period_name,
    periodStart: report.period_start,
    periodEnd: report.period_end,
    totalLessons: report.total_lessons,
    completedPieces: report.completed_pieces,
    teacherName,
    ageGroup: "",
    currentPiece: report.current_piece,
    scores: normalizeScores(report.scores_json),
    focusTags: normalizeFocusTags(report.focus_tags_json),
    strengths: report.strengths,
    growthArea: report.growth_area,
    homeSupport: report.home_support,
    practicePlan: report.practice_plan,
    dailyMinutes: report.daily_minutes,
    dailyReps: report.daily_reps,
    status: report.status === "published" ? "published" : "draft",
  };
}

function normalizeScores(value: unknown): ScoreMap {
  const source = isRecord(value) ? value : {};
  return Object.fromEntries(
    scoreCategories.map((category) => {
      const score = Number(source[category.id]);
      return [category.id, Number.isFinite(score) ? Math.min(5, Math.max(1, score)) : 3];
    }),
  ) as ScoreMap;
}

function normalizeFocusTags(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").slice(0, 20);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
