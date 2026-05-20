export function ParentPortalAccessForm({
  token,
  hasError = false,
}: {
  token: string;
  hasError?: boolean;
}) {
  return (
    <form action={`/p/${token}/verify`} method="post" className="space-y-4">
      <label className="grid gap-1 text-sm font-extrabold text-slate-600">
        학생 생년월일 6자리
        <input
          name="birthYYMMDD"
          inputMode="numeric"
          maxLength={6}
          autoComplete="off"
          placeholder="예: 160101"
          className="rounded-xl border border-slate-200 px-4 py-3 text-lg font-black tracking-widest text-slate-950"
        />
      </label>
      <label className="grid gap-1 text-sm font-extrabold text-slate-600">
        학부모 휴대폰 뒷자리 4자리
        <input
          name="phoneLast4"
          inputMode="numeric"
          maxLength={4}
          autoComplete="off"
          placeholder="예: 1234"
          className="rounded-xl border border-slate-200 px-4 py-3 text-lg font-black tracking-widest text-slate-950"
        />
      </label>
      <label className="grid gap-1 text-sm font-extrabold text-slate-600">
        포털 PIN
        <input
          name="pin"
          type="password"
          autoComplete="one-time-code"
          placeholder="PIN"
          className="rounded-xl border border-slate-200 px-4 py-3 text-lg font-black text-slate-950"
        />
      </label>
      {hasError ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
          입력값을 확인해 주세요.
        </p>
      ) : null}
      <button className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white">
        학생 보고서 포털 열기
      </button>
      <p className="text-xs leading-5 text-slate-500">
        데모 인증값: 생년월일 160101, 휴대폰 1234, PIN 1234
      </p>
    </form>
  );
}

