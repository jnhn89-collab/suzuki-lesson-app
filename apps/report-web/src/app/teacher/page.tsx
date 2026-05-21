import Link from "next/link";
import type { ReactNode } from "react";
import { hasParentSecurityEnv, hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/env";
import { getTeacherHomeData } from "@/lib/teacher/data";
import { signOutTeacherAction } from "./login/actions";
import type { ActivePeriodItem, RecentReportItem } from "@/lib/teacher/data";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const data = await getTeacherHomeData();
  const isConfigured = hasSupabaseEnv();
  const canVerifyParents = hasSupabaseAdminEnv() && hasParentSecurityEnv();
  const teacherName =
    data.context.status === "ready" ? data.context.profile.name?.trim() || "선생님" : "선생님";
  const greeting = buildGreeting(new Date(), teacherName, data.context.status === "ready");

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-8">
      <section className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black text-blue-700">Teacher Dashboard</p>
            <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">{greeting}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              학생·학기·보고서를 한 곳에서 관리하고, 학부모 보고서함 링크를 발급합니다.
            </p>
          </div>
          {data.context.status === "ready" ? (
            <form action={signOutTeacherAction}>
              <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700">
                로그아웃
              </button>
            </form>
          ) : (
            <Link
              href="/teacher/login"
              className="w-fit rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white"
            >
              로그인
            </Link>
          )}
        </div>

        {!isConfigured ? (
          <Notice tone="amber">
            Vercel 프로젝트에 Supabase 환경변수가 아직 없습니다. 현재 외부 웹은 데모 흐름만
            동작합니다.
          </Notice>
        ) : null}
        {isConfigured && data.context.status === "signed_out" ? (
          <Notice tone="blue">보고서를 저장하려면 선생님 로그인이 필요합니다.</Notice>
        ) : null}
        {isConfigured && data.context.status === "ready" && !canVerifyParents ? (
          <Notice tone="amber">
            학부모 보고서함 인증까지 쓰려면 SUPABASE_SERVICE_ROLE_KEY와 PARENT_ACCESS_PEPPER가
            필요합니다.
          </Notice>
        ) : null}

        <TodayCard
          studentCount={data.studentCount}
          periodCount={data.periodCount}
          reportCount={data.reportCount}
          contextReady={data.context.status === "ready"}
        />

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_280px]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-black text-slate-950">최근 발행 보고서</h2>
              <Link href="/teacher/reports/new" className="text-xs font-black text-blue-700">
                새 보고서 작성 →
              </Link>
            </div>
            <RecentReportsList items={data.recentReports} contextReady={data.context.status === "ready"} />
          </section>

          <aside className="rounded-3xl border border-slate-200 bg-white p-5">
            <h2 className="text-base font-black text-slate-950">활성 기간</h2>
            <ActivePeriodsList items={data.activePeriods} />
          </aside>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatusCard label="학생" value={`${data.studentCount}명`} href="/teacher/students" />
          <StatusCard label="기간" value={`${data.periodCount}개`} href="/teacher/periods" />
          <StatusCard label="발행 보고서" value={`${data.reportCount}개`} />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/teacher/students"
            className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-center font-black text-blue-900"
          >
            학생 등록·관리
          </Link>
          <Link
            href="/teacher/periods"
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center font-black text-emerald-900"
          >
            학기·분기 관리
          </Link>
          <Link
            href="/p/demo-portal"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center font-black text-slate-900 sm:col-span-2"
          >
            학부모 보고서함 데모 열기
          </Link>
        </div>
      </section>
    </main>
  );
}

function buildGreeting(now: Date, name: string, ready: boolean) {
  if (!ready) return "선생님 대시보드";
  const hour = now.getHours();
  const slot = hour < 6 ? "늦은 밤" : hour < 12 ? "좋은 아침" : hour < 18 ? "좋은 오후" : "좋은 저녁";
  return `${slot}, ${name}님`;
}

function TodayCard({
  studentCount,
  periodCount,
  reportCount,
  contextReady,
}: {
  studentCount: number;
  periodCount: number;
  reportCount: number;
  contextReady: boolean;
}) {
  if (!contextReady) {
    return (
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600">
        로그인 후 학생·학기·보고서 상태가 여기에 정리됩니다.
      </div>
    );
  }

  const next = pickNextAction({ studentCount, periodCount, reportCount });

  return (
    <Link
      href={next.href}
      className="mt-6 block rounded-3xl border border-slate-950 bg-slate-950 px-5 py-5 text-white shadow-md transition hover:bg-slate-900"
    >
      <p className="text-xs font-black text-blue-200">오늘 할 일</p>
      <p className="mt-2 text-xl font-black sm:text-2xl">{next.title}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-slate-200">{next.description}</p>
      <p className="mt-3 text-xs font-black text-blue-200">{next.cta} →</p>
    </Link>
  );
}

function pickNextAction({
  studentCount,
  periodCount,
  reportCount,
}: {
  studentCount: number;
  periodCount: number;
  reportCount: number;
}) {
  if (studentCount === 0) {
    return {
      title: "첫 학생을 등록해 주세요",
      description:
        "학생 이름·생년월일·학부모 휴대폰 뒷자리를 입력하면 학부모 보고서함 인증 기반이 만들어집니다.",
      cta: "학생 등록 페이지로",
      href: "/teacher/students",
    };
  }
  if (periodCount === 0) {
    return {
      title: "평가 기간을 등록해 주세요",
      description: "1학기·2학기 또는 분기 템플릿으로 한 번에 만들 수 있습니다.",
      cta: "학기·분기 관리로",
      href: "/teacher/periods",
    };
  }
  if (reportCount === 0) {
    return {
      title: "첫 보고서를 작성해 주세요",
      description:
        "학생과 기간을 선택하면 이름·연령·곡·시작/종료일이 자동으로 채워집니다. 프리셋 문장으로 빠르게 마무리.",
      cta: "보고서 작성 시작",
      href: "/teacher/reports/new",
    };
  }
  return {
    title: "새 보고서 작성",
    description: "기존 학생의 다음 학기/분기 보고서를 발행하면 같은 보고서함에 누적됩니다.",
    cta: "작성 화면 열기",
    href: "/teacher/reports/new",
  };
}

function RecentReportsList({
  items,
  contextReady,
}: {
  items: RecentReportItem[];
  contextReady: boolean;
}) {
  if (!contextReady) {
    return (
      <p className="mt-3 text-sm leading-6 text-slate-500">
        로그인 후 최근 발행한 보고서 5건이 여기 표시됩니다.
      </p>
    );
  }
  if (items.length === 0) {
    return (
      <p className="mt-3 text-sm leading-6 text-slate-500">
        아직 발행된 보고서가 없습니다. 첫 보고서를 작성해 보세요.
      </p>
    );
  }
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="grid grid-cols-[1fr_auto] items-baseline gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
        >
          <div>
            <p className="text-sm font-black text-slate-950">{item.studentName}</p>
            <p className="mt-0.5 text-xs font-bold text-slate-600">{item.periodName}</p>
          </div>
          <p className="text-[11px] font-black text-slate-500">{formatRelativeDate(item.publishedAt)}</p>
        </li>
      ))}
    </ul>
  );
}

function ActivePeriodsList({ items }: { items: ActivePeriodItem[] }) {
  if (items.length === 0) {
    return (
      <p className="mt-3 text-sm leading-6 text-slate-500">
        활성 기간이 없습니다. 학기·분기 관리에서 등록해 주세요.
      </p>
    );
  }
  return (
    <ul className="mt-3 space-y-2">
      {items.map((period) => (
        <li key={period.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
          <p className="text-sm font-black text-slate-950">{period.name}</p>
          <p className="mt-0.5 text-[11px] font-bold text-slate-600">
            {period.startsOn} ~ {period.endsOn}
          </p>
        </li>
      ))}
    </ul>
  );
}

function formatRelativeDate(iso: string | null) {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return "오늘";
    if (days === 1) return "어제";
    if (days < 7) return `${days}일 전`;
    if (days < 30) return `${Math.floor(days / 7)}주 전`;
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
      date.getDate(),
    ).padStart(2, "0")}`;
  } catch {
    return "";
  }
}

function StatusCard({ label, value, href }: { label: string; value: string; href?: string }) {
  const body = (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <div className="text-xs font-black text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-black text-slate-950">{value}</div>
    </div>
  );
  return href ? (
    <Link href={href} className="block transition hover:opacity-80">
      {body}
    </Link>
  ) : (
    body
  );
}

function Notice({ children, tone }: { children: ReactNode; tone: "amber" | "blue" }) {
  const className =
    tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-blue-200 bg-blue-50 text-blue-900";

  return (
    <div className={`mt-5 rounded-3xl border p-4 text-sm font-bold leading-6 ${className}`}>
      {children}
    </div>
  );
}
