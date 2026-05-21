"use client";

export function PrintButton({
  label = "PDF 저장",
  fileName,
}: {
  label?: string;
  fileName?: string;
}) {
  function printWithTitle() {
    const previousTitle = document.title;
    const nextTitle = fileName ? sanitizePrintFileName(fileName) : "";

    if (nextTitle) {
      document.title = nextTitle;
    }

    const restoreTitle = () => {
      document.title = previousTitle;
      window.removeEventListener("afterprint", restoreTitle);
    };

    window.addEventListener("afterprint", restoreTitle);
    window.print();
    window.setTimeout(restoreTitle, 1000);
  }

  return (
    <button
      type="button"
      onClick={printWithTitle}
      className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-800 print:hidden"
    >
      {label}
    </button>
  );
}

function sanitizePrintFileName(value: string) {
  return value
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120);
}
