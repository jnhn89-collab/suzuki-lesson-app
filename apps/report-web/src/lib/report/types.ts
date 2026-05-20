export type ScoreCategoryId =
  | "posture"
  | "intonation"
  | "rhythm"
  | "tone"
  | "bow"
  | "musicality";

export type ScoreMap = Record<ScoreCategoryId, number>;

export type ReportStatus = "draft" | "published" | "archived" | "revoked";

export type ReportData = {
  id?: string;
  studentName: string;
  periodName: string;
  periodStart: string;
  periodEnd: string;
  totalLessons: number;
  completedPieces: number;
  teacherName: string;
  ageGroup: string;
  currentPiece: string;
  scores: ScoreMap;
  focusTags: string[];
  strengths: string;
  growthArea: string;
  homeSupport: string;
  practicePlan: string;
  dailyMinutes: number;
  dailyReps: number;
  status?: ReportStatus;
};

export type ParentAccessInput = {
  token: string;
  birthYYMMDD: string;
  phoneLast4: string;
  pin: string;
};

