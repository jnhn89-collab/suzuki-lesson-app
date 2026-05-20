"use client";

import { useMemo, useState } from "react";
import { focusOptions, presetGroups, sampleReport, scoreCategories } from "@/lib/report/content";
import type { ReportData, ScoreCategoryId } from "@/lib/report/types";
import { PrintButton } from "../PrintButton";
import { ReportDocument } from "./ReportDocument";

type PresetTarget = "strengths" | "growthArea" | "homeSupport" | "practicePlan";
type PresetGroupName = keyof typeof presetGroups;

export function ReportEditor() {
  const [report, setReport] = useState<ReportData>(sampleReport);
  const [activePreset, setActivePreset] = useState<PresetGroupName>("좋아진 점");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const parentDemoUrl = useMemo(() => "/r/demo-token", []);

  function update<K extends keyof ReportData>(key: K, value: ReportData[K]) {
    setReport((current) => ({ ...current, [key]: value }));
  }

  function updateScore(category: ScoreCategoryId, value: number) {
    setReport((current) => ({
      ...current,
      scores: { ...current.scores, [category]: value },
    }));
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

  return (
    <div className="grid min-h-screen bg-slate-100 lg:grid-cols-[430px_1fr]">
      <aside className="no-print border-r border-slate-200 bg-white">
        <div className="sticky top-0 z-10 bg-slate-950 px-5 py-5 text-white">
          <p className="text-xs font-black text-blue-200">선생님 작성 화면</p>
          <h1 className="mt-1 text-xl font-black">분기/학기 성과보고서</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            지금은 Supabase 연결 전 데모 작성 화면입니다. 다음 단계에서 이 폼을 서버 draft
            저장과 공유 링크 생성에 연결합니다.
          </p>
        </div>

        <div className="space-y-6 p-5">
          <Panel title="기본 정보">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Field label="학생 이름">
                <input value={report.studentName} onChange={(event) => update("studentName", event.target.value)} />
              </Field>
              <Field label="평가 기간">
                <select value={report.periodName} onChange={(event) => update("periodName", event.target.value)}>
                  {["이번 학기", "이번 분기", "1분기", "2분기", "3분기", "4분기", "상반기", "하반기"].map(
                    (period) => (
                      <option key={period}>{period}</option>
                    ),
                  )}
                </select>
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
              <Field label="현재 진도">
                <input value={report.currentPiece} onChange={(event) => update("currentPiece", event.target.value)} />
              </Field>
              <Field label="담당 선생님">
                <input value={report.teacherName} onChange={(event) => update("teacherName", event.target.value)} />
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
            <button
              type="button"
              onClick={saveDemoDraft}
              className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-black text-white hover:bg-blue-800"
            >
              데모 draft 저장
            </button>
            <a
              href={parentDemoUrl}
              className="rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-black text-white hover:bg-slate-800"
            >
              학부모 인증 데모 열기
            </a>
            <PrintButton label="미리보기 PDF 저장" />
            {savedAt ? <p className="text-center text-xs font-bold text-slate-500">{savedAt} 로컬 데모 저장됨</p> : null}
          </div>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:h-screen lg:overflow-auto">
        <ReportDocument report={report} />
      </main>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-black text-slate-800">{title}</h2>
      {children}
    </section>
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

