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
});

export const parentAccessSchema = z.object({
  token: z.string().trim().min(8).max(200),
  birthYYMMDD: z.string().regex(/^\d{6}$/, "생년월일 6자리를 입력하세요."),
  phoneLast4: z.string().regex(/^\d{4}$/, "휴대폰 뒷자리 4자리를 입력하세요."),
  pin: z.string().trim().min(4).max(64),
});

export type ReportDraftInput = z.infer<typeof reportDraftSchema>;
export type ParentAccessSchemaInput = z.infer<typeof parentAccessSchema>;
