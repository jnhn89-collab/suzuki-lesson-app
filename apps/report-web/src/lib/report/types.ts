import type { ScoringDimension } from "@/lib/scoring/priors";
import type { Scores } from "@/lib/scoring/types";

export type ScoreCategoryId =
  ScoringDimension;

export type ScoreMap = Scores;

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

export type StudentSummary = {
  id: string;
  studentCode: string;
  name: string;
  schoolName: string;
  enrollmentYear: number;
  registrationYear: number;
  registrationSequence: number;
  ageGroup: string;
  currentPiece: string;
  status: "active" | "inactive";
  suzukiBookLevel?: number | null;
  showPeerComparison?: boolean;
};

export type AcademicPeriod = {
  id: string;
  name: string;
  periodType: "semester" | "quarter" | "custom";
  startsOn: string;
  endsOn: string;
  schoolYear: number;
  sortOrder: number;
  status: "active" | "archived";
};

export type ParentPortalSummary = {
  student: StudentSummary;
  reports: Array<ReportData & { id: string; academicPeriodId?: string }>;
};

export type ParentAccessInput = {
  token: string;
  birthYYMMDD: string;
  phoneLast4: string;
  pin: string;
};

export type TeacherStudentOption = Pick<
  StudentSummary,
  "id" | "studentCode" | "name" | "ageGroup" | "currentPiece"
>;

export type TeacherPeriodOption = Pick<
  AcademicPeriod,
  "id" | "name" | "startsOn" | "endsOn" | "schoolYear" | "periodType"
>;
