"use client";

export function PrintButton({ label = "PDF 저장" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-800 print:hidden"
    >
      {label}
    </button>
  );
}

