import Link from "next/link";
import type { ReactNode } from "react";
import type { AcademicPeriod } from "@/lib/report/types";
import { createAcademicPeriodAction } from "@/lib/teacher/actions";
import { getTeacherPeriodsPageData } from "@/lib/teacher/data";

const currentYear = new Date().getFullYear();
const periodTemplates = buildPeriodTemplates(currentYear);

export const dynamic = "force-dynamic";

export default async function TeacherPeriodsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const [data, params] = await Promise.all([getTeacherPeriodsPageData(), searchParams]);
  const canWrite = data.context.status === "ready";

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-8">
      <section className="mx-auto max-w-5xl">
        <Link href="/teacher" className="text-sm font-black text-blue-700">
          ← 대시보드
        </Link>
        <div className="mt-5 flex flex-col gap-2">
          <p className="text-xs font-black text-blue-700">Academic Periods</p>
          <h1 className="text-3xl font-black text-slate-950">학기·분기 관리</h1>
          <p className="max-w-2xl leading-7 text-slate-600">
            보고서는 반드시 하나의 평가 기간에 묶입니다. 학부모 포털에서는 이 기간 단위로 여러
            보고서를 시간순으로 확인합니다.
          </p>
        </div>

        {params.created ? <Notice tone="green">기간이 등록되었습니다.</Notice> : null}
        {params.error ? <Notice tone="red">기간 등록 중 오류가 발생했습니다: {params.error}</Notice> : null}
        {!canWrite ? (
          <Notice tone="amber">실제 기간 등록은 Supabase 환경변수 설정 후 선생님 로그인이 필요합니다.</Notice>
        ) : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-[360px_1fr]">
          <div className="space-y-4">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">빠른 기간 등록</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
                한국 학기 흐름에 맞춘 기본 기간입니다. 필요한 기간만 눌러 등록하세요.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {periodTemplates.map((template) => (
                  <TemplateSubmit key={template.name} template={template} disabled={!canWrite} />
                ))}
              </div>
            </section>

            <form action={createAcademicPeriodAction} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">직접 기간 등록</h2>
              <div className="mt-4 grid gap-3">
                <Field label="기간명" name="name" placeholder="예: 2026 봄학기" disabled={!canWrite} />
                <label className="grid gap-1 text-xs font-extrabold text-slate-500">
                  기간 유형
                  <select
                    name="periodType"
                    disabled={!canWrite}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                    defaultValue="semester"
                  >
                    <option value="semester">학기</option>
                    <option value="quarter">분기</option>
                    <option value="custom">직접 설정</option>
                  </select>
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="시작일" name="startsOn" type="date" disabled={!canWrite} />
                  <Field label="종료일" name="endsOn" type="date" disabled={!canWrite} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="학년도"
                    name="schoolYear"
                    type="number"
                    defaultValue={String(currentYear)}
                    disabled={!canWrite}
                  />
                  <Field label="정렬 순서" name="sortOrder" type="number" defaultValue="0" disabled={!canWrite} />
                </div>
              </div>
              <button
                disabled={!canWrite}
                className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                기간 등록
              </button>
            </form>
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-slate-950">기간 목록</h2>
              <Link href="/teacher/reports/new" className="text-sm font-black text-blue-700">
                보고서 작성
              </Link>
            </div>
            {data.periods.length > 0 ? (
              data.periods.map((period) => <PeriodCard key={period.id} period={period} />)
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm font-bold text-slate-500">
                등록된 기간이 없습니다.
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

type PeriodTemplate = {
  name: string;
  periodType: "semester" | "quarter";
  startsOn: string;
  endsOn: string;
  schoolYear: number;
  sortOrder: number;
};

function buildPeriodTemplates(year: number): PeriodTemplate[] {
  const nextYear = year + 1;
  return [
    {
      name: `${year} 1학기`,
      periodType: "semester",
      startsOn: `${year}-03-01`,
      endsOn: `${year}-08-31`,
      schoolYear: year,
      sortOrder: 10,
    },
    {
      name: `${year} 2학기`,
      periodType: "semester",
      startsOn: `${year}-09-01`,
      endsOn: `${nextYear}-02-28`,
      schoolYear: year,
      sortOrder: 20,
    },
    {
      name: `${year} 1분기`,
      periodType: "quarter",
      startsOn: `${year}-03-01`,
      endsOn: `${year}-05-31`,
      schoolYear: year,
      sortOrder: 1,
    },
    {
      name: `${year} 2분기`,
      periodType: "quarter",
      startsOn: `${year}-06-01`,
      endsOn: `${year}-08-31`,
      schoolYear: year,
      sortOrder: 2,
    },
    {
      name: `${year} 3분기`,
      periodType: "quarter",
      startsOn: `${year}-09-01`,
      endsOn: `${year}-11-30`,
      schoolYear: year,
      sortOrder: 3,
    },
    {
      name: `${year} 4분기`,
      periodType: "quarter",
      startsOn: `${year}-12-01`,
      endsOn: `${nextYear}-02-28`,
      schoolYear: year,
      sortOrder: 4,
    },
  ];
}

function TemplateSubmit({
  template,
  disabled,
}: {
  template: PeriodTemplate;
  disabled: boolean;
}) {
  return (
    <form action={createAcademicPeriodAction}>
      <input type="hidden" name="name" value={template.name} />
      <input type="hidden" name="periodType" value={template.periodType} />
      <input type="hidden" name="startsOn" value={template.startsOn} />
      <input type="hidden" name="endsOn" value={template.endsOn} />
      <input type="hidden" name="schoolYear" value={template.schoolYear} />
      <input type="hidden" name="sortOrder" value={template.sortOrder} />
      <button
        disabled={disabled}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700 hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      >
        {template.name}
      </button>
    </form>
  );
}

function PeriodCard({ period }: { period: AcademicPeriod }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black text-blue-700">{period.schoolYear}</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">{period.name}</h3>
          <p className="mt-2 text-sm font-bold text-slate-600">
            {period.startsOn} - {period.endsOn}
          </p>
        </div>
        <div className="grid gap-2 text-sm sm:min-w-48">
          <Meta label="유형" value={period.periodType === "quarter" ? "분기" : period.periodType === "custom" ? "직접" : "학기"} />
          <Meta label="상태" value={period.status === "active" ? "사용중" : "보관"} />
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
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
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
