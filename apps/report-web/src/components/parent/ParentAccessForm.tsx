"use client";

import { useActionState } from "react";
import { verifyParentAccess, type ParentAccessState } from "@/app/r/[token]/actions";

const initialState: ParentAccessState = {
  message: null,
};

export function ParentAccessForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(verifyParentAccess, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
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
        보고서 PIN
        <input
          name="pin"
          type="password"
          autoComplete="one-time-code"
          placeholder="PIN"
          className="rounded-xl border border-slate-200 px-4 py-3 text-lg font-black text-slate-950"
        />
      </label>
      {state.message ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{state.message}</p>
      ) : null}
      <button
        disabled={pending}
        className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
      >
        {pending ? "확인 중..." : "보고서 열기"}
      </button>
      <p className="text-xs leading-5 text-slate-500">
        데모 인증값: 생년월일 160101, 휴대폰 1234, PIN 1234
      </p>
    </form>
  );
}

