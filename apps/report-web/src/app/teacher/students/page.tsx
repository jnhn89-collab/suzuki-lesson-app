import { buildStudentCode } from "@/lib/report/schema";
import { sampleStudent } from "@/lib/report/content";

const registrationExample = {
  schoolName: "한빛초등학교",
  registrationYear: 2026,
  registrationSequence: 1,
};

export default function TeacherStudentsPage() {
  const generatedCode = buildStudentCode(registrationExample);

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-8">
      <section className="mx-auto max-w-4xl">
        <p className="text-xs font-black text-blue-700">Student Registry</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">학생 관리 설계</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          실제 DB 연결 후에는 이 화면에서 학생, 학부모, 포털 링크, 기간별 보고서를 관리합니다.
          학생은 이름만이 아니라 학교/등록연도/순번 기반 식별자를 가집니다.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-black text-slate-950">식별자 생성 예시</h2>
            <dl className="mt-4 grid gap-2 text-sm">
              <Meta label="학교명" value={registrationExample.schoolName} />
              <Meta label="등록연도" value={String(registrationExample.registrationYear)} />
              <Meta label="등록순번" value={String(registrationExample.registrationSequence)} />
              <Meta label="생성 식별자" value={generatedCode} emphasis />
            </dl>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-black text-slate-950">샘플 학생</h2>
            <dl className="mt-4 grid gap-2 text-sm">
              <Meta label="이름" value={sampleStudent.name} />
              <Meta label="학생 식별자" value={sampleStudent.studentCode} emphasis />
              <Meta label="학교" value={sampleStudent.schoolName} />
              <Meta label="현재 진도" value={sampleStudent.currentPiece} />
            </dl>
          </section>
        </div>
      </section>
    </main>
  );
}

function Meta({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-2">
      <dt className="text-[11px] font-black text-slate-500">{label}</dt>
      <dd className={`overflow-wrap-anywhere mt-0.5 font-black ${emphasis ? "text-blue-700" : "text-slate-900"}`}>
        {value}
      </dd>
    </div>
  );
}

