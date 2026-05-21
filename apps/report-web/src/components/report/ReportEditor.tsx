"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { focusOptions, presetGroups, sampleReport, scoreCategories } from "@/lib/report/content";
import type {
  ReportData,
  ScoreCategoryId,
  TeacherPeriodOption,
  TeacherStudentOption,
} from "@/lib/report/types";
import { PrintButton } from "../PrintButton";
import { ReportDocument } from "./ReportDocument";

type PresetTarget = "strengths" | "growthArea" | "homeSupport" | "practicePlan";
type PresetGroupName = keyof typeof presetGroups;
type PublishResult = {
  reportId: string;
  portalUrl: string | null;
  portalPin: string | null;
  portalPinStatus: "created" | "existing" | "reset";
  expiresAt?: string | null;
  teacherName?: string | null;
};
type PublishResultSnapshot = PublishResult & {
  studentName: string;
  periodName: string;
  teacherName: string;
};

export function ReportEditor({
  students = [],
  periods = [],
  canSaveToDatabase = false,
  teacherName,
}: {
  students?: TeacherStudentOption[];
  periods?: TeacherPeriodOption[];
  canSaveToDatabase?: boolean;
  teacherName?: string;
}) {
  const initialStudent = students[0];
  const initialPeriod = periods[0];
  const [report, setReport] = useState<ReportData>(() => ({
    ...sampleReport,
    studentName: initialStudent?.name ?? sampleReport.studentName,
    ageGroup: initialStudent?.ageGroup ?? sampleReport.ageGroup,
    currentPiece: initialStudent?.currentPiece ?? sampleReport.currentPiece,
    periodName: initialPeriod?.name ?? sampleReport.periodName,
    periodStart: initialPeriod?.startsOn ?? sampleReport.periodStart,
    periodEnd: initialPeriod?.endsOn ?? sampleReport.periodEnd,
    teacherName: teacherName || sampleReport.teacherName,
  }));
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudent?.id ?? "");
  const [selectedPeriodId, setSelectedPeriodId] = useState(initialPeriod?.id ?? "");
  const [useManualPeriod, setUseManualPeriod] = useState(periods.length === 0);
  const [activePreset, setActivePreset] = useState<PresetGroupName>("좋아진 점");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResultSnapshot | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const cached = window.sessionStorage.getItem("suzuki-publish-result");
      if (!cached) return null;
      const parsed = JSON.parse(cached) as Partial<PublishResultSnapshot>;
      if (!parsed.reportId || !parsed.studentName || !parsed.periodName) return null;
      return parsed as PublishResultSnapshot;
    } catch {
      return null;
    }
  });
  const [publishError, setPublishError] = useState<string | null>(null);
  const [resetPortalPin, setResetPortalPin] = useState(false);
  const parentDemoUrl = useMemo(() => "/p/demo-portal", []);

  useEffect(() => {
    try {
      if (publishResult) {
        window.sessionStorage.setItem("suzuki-publish-result", JSON.stringify(publishResult));
      } else {
        window.sessionStorage.removeItem("suzuki-publish-result");
      }
    } catch {}
  }, [publishResult]);

  function dismissPublishResult() {
    setPublishResult(null);
    try {
      window.sessionStorage.removeItem("suzuki-publish-result");
    } catch {}
  }

  function update<K extends keyof ReportData>(key: K, value: ReportData[K]) {
    setReport((current) => ({ ...current, [key]: value }));
  }

  function updateScore(category: ScoreCategoryId, value: number) {
    setReport((current) => ({
      ...current,
      scores: { ...current.scores, [category]: value },
    }));
  }

  function selectStudent(studentId: string) {
    setSelectedStudentId(studentId);
    setResetPortalPin(false);
    const student = students.find((item) => item.id === studentId);
    if (!student) return;
    setReport((current) => ({
      ...current,
      studentName: student.name,
      ageGroup: student.ageGroup,
      currentPiece: student.currentPiece || current.currentPiece,
    }));
  }

  function selectPeriod(periodId: string) {
    setSelectedPeriodId(periodId);
    const period = periods.find((item) => item.id === periodId);
    if (!period) return;
    setReport((current) => ({
      ...current,
      periodName: period.name,
      periodStart: period.startsOn,
      periodEnd: period.endsOn,
    }));
  }

  function returnToRegisteredPeriod() {
    const nextPeriodId = selectedPeriodId || periods[0]?.id;
    setUseManualPeriod(false);
    if (nextPeriodId) {
      selectPeriod(nextPeriodId);
    }
  }

  function toggleFocus(tag: string) {
    setReport((current) => ({
      ...current,
      focusTags: current.focusTags.includes(tag)
        ? current.focusTags.filter((item) => item !== tag)
        : [...current.focusTags, tag],
    }));
  }

  function addPreset(text: string) {
    const target = presetGroups[activePreset].target as PresetTarget;
    setReport((current) => {
      const existing = String(current[target] ?? "").trim();
      if (existing.includes(text)) return current;
      return {
        ...current,
        [target]: existing ? `${existing}\n${text}` : text,
      };
    });
  }

  function saveDemoDraft() {
    window.localStorage.setItem("suzuki-report-web-demo-draft", JSON.stringify(report));
    setSavedAt(new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }));
  }

  async function publishToDatabase() {
    if (!selectedStudentId) {
      setPublishError("학생을 먼저 선택해 주세요.");
      return;
    }

    setIsPublishing(true);
    setPublishError(null);
    setPublishResult(null);
    try {
      window.sessionStorage.removeItem("suzuki-publish-result");
    } catch {}

    try {
      const response = await fetch("/teacher/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...report,
          studentId: selectedStudentId,
          academicPeriodId: useManualPeriod ? undefined : selectedPeriodId || undefined,
          resetPortalPin,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "보고서 저장에 실패했습니다.");
      }
      setPublishResult({
        ...payload,
        studentName: report.studentName,
        periodName: report.periodName,
        teacherName: payload?.teacherName || report.teacherName,
      });
      setResetPortalPin(false);
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : "보고서 저장에 실패했습니다.");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-slate-100 lg:grid-cols-[430px_1fr]">
      <aside className="no-print border-r border-slate-200 bg-white">
        <div className="sticky top-0 z-10 bg-slate-950 px-5 py-5 text-white">
          <p className="text-xs font-black text-blue-200">선생님 작성 화면</p>
          <h1 className="mt-1 text-xl font-black">분기/학기 성과보고서</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {canSaveToDatabase
              ? "학생과 기간을 선택해 작성하면 발행본이 학부모 보고서함에 기간별로 누적됩니다."
              : "선생님 로그인이 없으면 데모 작성과 PDF 미리보기만 사용할 수 있습니다."}
          </p>
        </div>

        <div className="space-y-6 p-5">
          <Panel title="기본 정보">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {students.length > 0 ? (
                <>
                  <Field label="학생 선택">
                    <select value={selectedStudentId} onChange={(event) => selectStudent(event.target.value)}>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name} · {student.studentCode}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <ReadOnlyCard
                    rows={[
                      { label: "이름", value: report.studentName || "-" },
                      { label: "연령대", value: report.ageGroup || "미입력" },
                    ]}
                  />
                </>
              ) : (
                <Field label="학생 이름">
                  <input
                    value={report.studentName}
                    onChange={(event) => update("studentName", event.target.value)}
                  />
                </Field>
              )}

              {periods.length > 0 && !useManualPeriod ? (
                <>
                  <Field label="평가 기간">
                    <select value={selectedPeriodId} onChange={(event) => selectPeriod(event.target.value)}>
                      {periods.map((period) => (
                        <option key={period.id} value={period.id}>
                          {period.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <ReadOnlyCard
                    rows={[
                      { label: "기간명", value: report.periodName || "-" },
                      {
                        label: "기간",
                        value:
                          report.periodStart && report.periodEnd
                            ? `${report.periodStart} ~ ${report.periodEnd}`
                            : "미선택",
                      },
                    ]}
                  />
                  <button
                    type="button"
                    onClick={() => setUseManualPeriod(true)}
                    className="justify-self-start text-xs font-black text-blue-700 underline"
                  >
                    기간 직접 입력으로 전환
                  </button>
                </>
              ) : (
                <>
                  {periods.length > 0 ? (
                    <button
                      type="button"
                      onClick={returnToRegisteredPeriod}
                      className="justify-self-start text-xs font-black text-blue-700 underline"
                    >
                      ← 등록된 기간 선택으로 돌아가기
                    </button>
                  ) : null}
                  <Field label="평가 기간명">
                    <input
                      value={report.periodName}
                      onChange={(event) => update("periodName", event.target.value)}
                      placeholder="예: 2026년 1학기"
                    />
                  </Field>
                  <Field label="시작일">
                    <input
                      type="date"
                      value={report.periodStart}
                      onChange={(event) => update("periodStart", event.target.value)}
                    />
                  </Field>
                  <Field label="종료일">
                    <input
                      type="date"
                      value={report.periodEnd}
                      onChange={(event) => update("periodEnd", event.target.value)}
                    />
                  </Field>
                </>
              )}

              <Field label="현재 진도">
                <input
                  value={report.currentPiece}
                  onChange={(event) => update("currentPiece", event.target.value)}
                  placeholder="예: Book 2 · Minuet 3"
                />
              </Field>
              <Field label="담당 선생님">
                <input
                  value={report.teacherName}
                  onChange={(event) => update("teacherName", event.target.value)}
                />
              </Field>
            </div>
          </Panel>

          <Panel title="기간 기록">
            <div className="grid grid-cols-2 gap-3">
              <Field label="레슨 수">
                <input
                  type="number"
                  min="0"
                  value={report.totalLessons}
                  onChange={(event) => update("totalLessons", Number(event.target.value))}
                />
              </Field>
              <Field label="정리한 곡">
                <input
                  type="number"
                  min="0"
                  value={report.completedPieces}
                  onChange={(event) => update("completedPieces", Number(event.target.value))}
                />
              </Field>
              <Field label="하루 연습 분">
                <input
                  type="number"
                  min="0"
                  value={report.dailyMinutes}
                  onChange={(event) => update("dailyMinutes", Number(event.target.value))}
                />
              </Field>
              <Field label="핵심 반복 횟수">
                <input
                  type="number"
                  min="0"
                  value={report.dailyReps}
                  onChange={(event) => update("dailyReps", Number(event.target.value))}
                />
              </Field>
            </div>
          </Panel>

          <Panel title="영역별 점수">
            <div className="space-y-3">
              {scoreCategories.map((category) => (
                <div key={category.id} className="grid grid-cols-[54px_1fr_24px] items-center gap-2">
                  <div className="text-sm font-black text-slate-700">{category.label}</div>
                  <div className="grid grid-cols-5 gap-1">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => updateScore(category.id, score)}
                        className={`rounded-lg border py-2 text-sm font-black ${
                          report.scores[category.id] === score
                            ? "border-slate-950 bg-slate-950 text-white"
                            : "border-slate-200 bg-white text-slate-500"
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                  <div className="text-right text-sm font-black">{report.scores[category.id]}</div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="이번 기간 키워드">
            <div className="flex flex-wrap gap-2">
              {focusOptions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleFocus(tag)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-extrabold ${
                    report.focusTags.includes(tag)
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="문장 프리셋">
            <div className="mb-3 flex flex-wrap gap-2">
              {(Object.keys(presetGroups) as PresetGroupName[]).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setActivePreset(name)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-extrabold ${
                    activePreset === name
                      ? "border-blue-300 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
            <div className="max-h-64 space-y-2 overflow-auto pr-1">
              {presetGroups[activePreset].items.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => addPreset(item)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-bold leading-6 text-slate-700 hover:border-blue-200 hover:bg-blue-50"
                >
                  {item}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="보고서 문장">
            <TextField label="이번 기간 좋아진 점" value={report.strengths} onChange={(value) => update("strengths", value)} />
            <TextField label="다음에 잡아볼 점" value={report.growthArea} onChange={(value) => update("growthArea", value)} />
            <TextField label="가정에서 도와주실 점" value={report.homeSupport} onChange={(value) => update("homeSupport", value)} />
            <TextField label="연습 처방" value={report.practicePlan} onChange={(value) => update("practicePlan", value)} />
          </Panel>

          <div className="grid gap-2">
            {canSaveToDatabase ? (
              <label className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold leading-5 text-slate-600">
                <input
                  type="checkbox"
                  checked={resetPortalPin}
                  onChange={(event) => setResetPortalPin(event.target.checked)}
                  className="mt-1"
                />
                <span>
                  새 링크와 새 PIN을 발급합니다. <strong>기존 학부모에게 전달한 링크와 PIN은 즉시 무효화되니</strong>, 학부모가 분실했을 때만 사용해 주세요.
                </span>
              </label>
            ) : null}
            {canSaveToDatabase ? (
              <button
                type="button"
                onClick={publishToDatabase}
                disabled={isPublishing || !selectedStudentId}
                className="rounded-xl bg-emerald-700 px-4 py-3 text-sm font-black text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isPublishing ? "보고서 저장 중" : "학부모 보고서함에 추가"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={saveDemoDraft}
              className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-black text-white hover:bg-blue-800"
            >
              임시 저장
            </button>
            <a
              href={parentDemoUrl}
              className="rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-black text-white hover:bg-slate-800"
            >
              학부모 보고서함 데모 열기
            </a>
            <PrintButton label="미리보기 PDF 저장" />
            {publishResult ? (
              <p className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
                발행 완료. 학부모 전달 카드가 화면에 떠 있습니다.
              </p>
            ) : null}
            {publishError ? (
              <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                {publishError}
              </p>
            ) : null}
            {savedAt ? <p className="text-center text-xs font-bold text-slate-500">{savedAt} 로컬 데모 저장됨</p> : null}
          </div>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:h-screen lg:overflow-auto">
        <ReportDocument report={report} />
      </main>

      {publishResult ? (
        <PublishResultModal
          result={publishResult}
          onDismiss={dismissPublishResult}
          studentName={publishResult.studentName}
          periodName={publishResult.periodName}
          teacherName={publishResult.teacherName}
        />
      ) : null}
    </div>
  );
}

function PublishResultModal({
  result,
  onDismiss,
  studentName,
  periodName,
  teacherName,
}: {
  result: PublishResult;
  onDismiss: () => void;
  studentName: string;
  periodName: string;
  teacherName: string;
}) {
  const [copied, setCopied] = useState<"url" | "message" | null>(null);
  const dismissButtonRef = useRef<HTMLButtonElement>(null);

  const shareText = useMemo(() => {
    const lines = [
      `[${teacherName || "스즈키 바이올린"}] ${studentName} ${periodName} 보고서함입니다.`,
      result.portalUrl
        ? `링크: ${result.portalUrl}`
        : "기존에 전달한 링크에서 새 보고서를 바로 확인할 수 있습니다.",
      result.portalPin ? `PIN: ${result.portalPin}` : "PIN은 기존 PIN을 그대로 사용합니다.",
      "첫 진입 시 학생 생년월일 6자리 + 학부모 휴대폰 뒷자리 4자리도 함께 필요합니다.",
    ];
    return lines.join("\n");
  }, [result, studentName, periodName, teacherName]);

  async function copyToClipboard(text: string, kind: "url" | "message") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  }

  async function shareNative() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `${studentName} ${periodName} 보고서`,
          text: shareText,
          url: result.portalUrl ?? undefined,
        });
        return;
      } catch {}
    }
    await copyToClipboard(shareText, "message");
  }

  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  useEffect(() => {
    dismissButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onDismiss();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onDismiss]);

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-result-title"
        className="max-h-full w-full max-w-md overflow-auto rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <p id="publish-result-title" className="text-sm font-black text-emerald-700">
            {getPortalResultTitle(result.portalPinStatus)}
          </p>
          <button
            ref={dismissButtonRef}
            type="button"
            onClick={onDismiss}
            aria-label="닫기"
            className="text-xs font-black text-slate-500 underline"
          >
            나중에
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
          <p className="text-xs font-black text-emerald-700">학부모 전달용 메시지</p>
          <pre className="mt-2 whitespace-pre-wrap break-all font-sans text-sm font-bold leading-6">
            {shareText}
          </pre>
        </div>

        {result.portalPin ? (
          <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-900">
            이 PIN과 링크는 지금만 표시됩니다. 학부모에게 전달하기 전까지 카드를 닫지 마세요.
          </p>
        ) : null}

        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={shareNative}
            className="rounded-xl bg-yellow-300 px-4 py-3 text-sm font-black text-slate-950 hover:bg-yellow-400"
          >
            {canShare ? "카톡/메시지로 공유" : "메시지 복사"}
          </button>
          <button
            type="button"
            onClick={() => copyToClipboard(shareText, "message")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-900 hover:border-blue-200"
          >
            {copied === "message" ? "메시지 복사됨" : "전체 메시지 복사"}
          </button>
          {result.portalUrl ? (
            <button
              type="button"
              onClick={() => copyToClipboard(result.portalUrl!, "url")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-900 hover:border-blue-200"
            >
              {copied === "url" ? "링크 복사됨" : "링크만 복사"}
            </button>
          ) : null}
          <a
            href={`sms:?body=${encodeURIComponent(shareText)}`}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-black text-slate-900 hover:border-blue-200"
          >
            SMS 앱으로 보내기
          </a>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-slate-800"
        >
          확인 — 학부모에게 전달했어요
        </button>
      </div>
    </div>
  );
}

function getPortalResultTitle(status: PublishResult["portalPinStatus"]) {
  if (status === "created") return "학부모 보고서함 링크와 PIN이 처음 생성되었습니다.";
  if (status === "reset") return "보고서가 추가되고 보고서함 링크와 PIN이 재발급되었습니다.";
  return "보고서가 기존 학부모 보고서함에 추가되었습니다.";
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-black text-slate-800">{title}</h2>
      {children}
    </section>
  );
}

function ReadOnlyCard({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="grid gap-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[56px_1fr] items-baseline gap-2">
          <dt className="text-[11px] font-black text-slate-500">{row.label}</dt>
          <dd className="overflow-wrap-anywhere font-extrabold text-slate-800">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Field({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <label className="grid gap-1 text-xs font-extrabold text-slate-500">
      {label}
      <div className="[&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:py-2.5 [&_input]:text-sm [&_input]:font-bold [&_input]:text-slate-900 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2.5 [&_select]:text-sm [&_select]:font-bold [&_select]:text-slate-900">
        {children}
      </div>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mb-3 grid gap-1 text-xs font-extrabold text-slate-500">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium leading-7 text-slate-900"
      />
    </label>
  );
}
