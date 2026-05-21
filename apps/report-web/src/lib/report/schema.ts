import { z } from "zod";

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다.");

export const scoreSchema = z.object({
  posture: z.number().int().min(1).max(5),
  intonation: z.number().int().min(1).max(5),
  rhythm: z.number().int().min(1).max(5),
  tone: z.number().int().min(1).max(5),
  bow: z.number().int().min(1).max(5),
  musicality: z.number().int().min(1).max(5),
});

// Stream B 신 5차원 (0.5 단위 + N/A). 기존 scoreSchema와 병행, 점진 전환 후 교체.
const scoreV2Field = z.number().multipleOf(0.5).min(1).max(5).nullable();
export const scoreV2Schema = z.object({
  intonation: scoreV2Field,
  rhythm: scoreV2Field,
  tone: scoreV2Field,
  musicality: scoreV2Field,
  technique: scoreV2Field,
});

export const reportDraftSchema = z
  .object({
    studentName: z.string().trim().min(1).max(80),
    periodName: z.string().trim().min(1).max(40),
    periodStart: dateString,
    periodEnd: dateString,
    totalLessons: z.number().int().min(0).max(200),
    completedPieces: z.number().int().min(0).max(100),
    teacherName: z.string().trim().min(1).max(80),
    ageGroup: z.string().trim().max(20),
    currentPiece: z.string().trim().min(1).max(160),
    scores: scoreSchema,
    focusTags: z.array(z.string().trim().min(1).max(40)).max(20),
    strengths: z.string().trim().max(3000),
    growthArea: z.string().trim().max(3000),
    homeSupport: z.string().trim().max(3000),
    practicePlan: z.string().trim().max(3000),
    dailyMinutes: z.number().int().min(0).max(240),
    dailyReps: z.number().int().min(0).max(100),
  })
  .refine((value) => value.periodStart <= value.periodEnd, {
    path: ["periodEnd"],
    message: "종료일은 시작일 이후여야 합니다.",
  });

export const reportPublishSchema = reportDraftSchema.safeExtend({
  strengths: z.string().trim().min(10).max(3000),
  growthArea: z.string().trim().min(10).max(3000),
  homeSupport: z.string().trim().min(10).max(3000),
  practicePlan: z.string().trim().min(10).max(3000),
});

export const studentInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  birthDate: dateString,
  parentName: z.string().trim().min(1).max(80),
  parentPhoneLast4: z.string().regex(/^\d{4}$/, "휴대폰 뒷자리 4자리를 입력하세요."),
  currentPiece: z.string().trim().max(160),
  ageGroup: z.string().trim().max(20),
  schoolName: z.string().trim().max(120),
  enrollmentYear: z.number().int().min(2000).max(2100),
  registrationYear: z.number().int().min(2000).max(2100),
  registrationSequence: z.number().int().min(1).max(9999),
});

export const studentCreateSchema = studentInputSchema.omit({ registrationSequence: true }).extend({
  registrationSequence: z.number().int().min(1).max(9999).optional(),
});

export const parentAccessSchema = z.object({
  token: z.string().trim().min(8).max(200),
  birthYYMMDD: z.string().regex(/^\d{6}$/, "생년월일 6자리를 입력하세요."),
  phoneLast4: z.string().regex(/^\d{4}$/, "휴대폰 뒷자리 4자리를 입력하세요."),
  pin: z.string().trim().min(4).max(64),
});

export type ReportDraftInput = z.infer<typeof reportDraftSchema>;
export type ParentAccessSchemaInput = z.infer<typeof parentAccessSchema>;
export type StudentCreateInput = z.infer<typeof studentCreateSchema>;

export const academicPeriodSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    periodType: z.enum(["semester", "quarter", "custom"]),
    startsOn: dateString,
    endsOn: dateString,
    schoolYear: z.number().int().min(2000).max(2100),
    sortOrder: z.number().int().min(0).max(999),
  })
  .refine((value) => value.startsOn <= value.endsOn, {
    path: ["endsOn"],
    message: "종료일은 시작일 이후여야 합니다.",
  });

export function buildStudentCode(input: {
  schoolName: string;
  registrationYear: number;
  registrationSequence: number;
}) {
  const normalizedSchool = input.schoolName
    .replace(/초등학교|초교|학교|\s/g, "")
    .toUpperCase()
    .slice(0, 12);
  return `${input.registrationYear}-${normalizedSchool || "STUDIO"}-${String(input.registrationSequence).padStart(3, "0")}`;
}

export const teacherAuthSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(128),
  name: z.string().trim().max(80).optional(),
  studioName: z.string().trim().max(120).optional(),
});

export const reportStoreSchema = reportPublishSchema.safeExtend({
  studentId: z.string().uuid(),
  academicPeriodId: z.string().uuid().optional(),
});
