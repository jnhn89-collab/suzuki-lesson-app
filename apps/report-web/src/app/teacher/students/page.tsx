import Link from "next/link";
import type { ReactNode } from "react";
import { hasParentSecurityEnv } from "@/lib/env";
import { sampleStudent } from "@/lib/report/content";
import { buildStudentCode } from "@/lib/report/schema";
import type { StudentSummary } from "@/lib/report/types";
import { createStudentAction } from "@/lib/teacher/actions";
import { getTeacherStudentsPageData } from "@/lib/teacher/data";

const currentYear = new Date().getFullYear();
const registrationExample = {
  schoolName: "한빛초등학교",
  registrationYear: currentYear,
  registrationSequence: 1,
};

export const dynamic = "force-dynamic";

export default async function TeacherStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const [data, params] = await Promise.all([getTeacherStudentsPageData(), searchParams]);
  const canWrite = data.context.status === "ready" && hasParentSecurityEnv();
  const generatedCode = buildStudentCode(registrationExample);

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-8">
      <section className="mx-auto max-w-5xl">
        <Link href="/teacher" className="text-sm font-black text-blue-700">
          ← 대시보드
        </Link>
        <div className="mt-5 flex flex-col gap-2">
          <p className="text-xs font-black text-blue-700">Student Registry</p>
          <h1 className="text-3xl font-black text-slate-950">학생 등록/관리</h1>
          <p className="max-w-2xl leading-7 text-slate-600">
            학생은 이름만으로 구분하지 않고 학교명, 등록연도, 등록순번 기반 식별자를 함께
            가집니다. 이 식별자가 이후 여러 학기/분기 보고서를 같은 학생에게 묶는 기준입니다.
          </p>
        </div>

        {params.created ? <Notice tone="green">학생이 등록되었습니다: {params.created}</Notice> : null}
        {params.error ? <Notice tone="red">학생 등록 중 오류가 발생했습니다: {params.error}</Notice> : null}
        {!canWrite ? (
          <Notice tone="amber">
            현재는 데모 보기입니다. 실제 DB 등록은 Supabase 환경변수 설정 후 선생님 로그인이
            필요합니다.
          </Notice>
        ) : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-[380px_1fr]">
          <form action={createStudentAction} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">새 학생 등록</h2>
            <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
              필수 6개 + 선택 사항. 학교/등록연도/등록순번은 비워두면 자동 처리됩니다.
            </p>
            <div className="mt-4 grid gap-3">
              <Field label="학생 이름" name="name" placeholder="예: 김지우" disabled={!canWrite} />
              <Field label="생년월일" name="birthDate" type="date" disabled={!canWrite} />
              <Field label="학부모 이름" name="parentName" placeholder="예: 김보호자" disabled={!canWrite} />
              <Field
                label="학부모 휴대폰 뒷자리"
                name="parentPhoneLast4"
                inputMode="numeric"
                maxLength={4}
                placeholder="1234"
                disabled={!canWrite}
              />
              <Field label="나이대 (선택)" name="ageGroup" placeholder="예: 8-10" disabled={!canWrite} />
              <Field
                label="현재 진도"
                name="currentPiece"
                placeholder="예: Book 1 · Minuet 1"
                disabled={!canWrite}
              />
            </div>

            <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs">
              <summary className="cursor-pointer font-black text-slate-700">
                학교·등록 정보 (선택)
              </summary>
              <div className="mt-3 grid gap-3">
                <Field
                  label="학교명 (비우면 STUDIO 코드)"
                  name="schoolName"
                  placeholder={registrationExample.schoolName}
                  disabled={!canWrite}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="입학/소속 연도"
                    name="enrollmentYear"
                    type="number"
                    defaultValue={String(currentYear)}
                    disabled={!canWrite}
                  />
                  <Field
                    label="등록연도"
                    name="registrationYear"
                    type="number"
                    defaultValue={String(currentYear)}
                    disabled={!canWrite}
                  />
                </div>
                <Field
                  label="등록순번 (비워두면 자동)"
                  name="registrationSequence"
                  type="number"
                  placeholder="자동"
                  disabled={!canWrite}
                />
                <p className="text-xs font-bold leading-5 text-slate-500">
                  식별자 예시: {generatedCode}
                </p>
              </div>
            </details>

            <button
              disabled={!canWrite}
              className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              학생 등록
            </button>
          </form>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-slate-950">학생 목록</h2>
              <Link href="/teacher/reports/new" className="text-sm font-black text-blue-700">
                보고서 작성
              </Link>
            </div>
            {data.students.length > 0 ? (
              data.students.map((student) => <StudentCard key={student.id} student={student} />)
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm font-bold text-slate-500">
                등록된 학생이 없습니다.
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function StudentCard({ student }: { student: StudentSummary }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black text-blue-700">{student.studentCode || sampleStudent.studentCode}</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">{student.name}</h3>
          <p className="mt-2 text-sm font-bold text-slate-600">{student.currentPiece || "진도 미입력"}</p>
        </div>
        <div className="grid gap-2 text-sm sm:min-w-56">
          <Meta label="학교" value={student.schoolName || "미입력"} />
          <Meta label="등록연도/순번" value={`${student.registrationYear}-${student.registrationSequence}`} />
          <Meta label="상태" value={student.status === "active" ? "재원" : "비활성"} />
        </div>
      </div>
    </article>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  disabled,
  inputMode,
  maxLength,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
  inputMode?: "numeric";
  maxLength?: number;
}) {
  return (
    <label className="grid gap-1 text-xs font-extrabold text-slate-500">
      {label}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        disabled={disabled}
        inputMode={inputMode}
        maxLength={maxLength}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
      />
    </label>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-2">
      <dt className="text-[11px] font-black text-slate-500">{label}</dt>
      <dd className="overflow-wrap-anywhere mt-0.5 font-black text-slate-900">{value}</dd>
    </div>
  );
}

function Notice({ children, tone }: { children: ReactNode; tone: "amber" | "green" | "red" }) {
  const className = {
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    green: "border-emerald-200 bg-emerald-50 text-emerald-900",
    red: "border-red-200 bg-red-50 text-red-800",
  }[tone];

  return <div className={`mt-5 rounded-3xl border p-4 text-sm font-bold leading-6 ${className}`}>{children}</div>;
}
