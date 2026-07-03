import type { Grade } from "@/lib/data";

const gradeColor: Record<Grade, string> = {
  A: "text-pass border-pass",
  B: "text-amber border-amber",
  C: "text-danger border-danger",
};

const gradeLabel: Record<Grade, string> = {
  A: "Excellent",
  B: "Good",
  C: "Fair",
};

export function DiagnosticTag({
  grade,
  benchmarkScore,
  benchmarkLabel,
  wattageDraw,
  bootVerified,
}: {
  grade: Grade;
  benchmarkScore: number;
  benchmarkLabel: string;
  wattageDraw: number;
  bootVerified: boolean;
}) {
  return (
    <div className="tag-edge-left flex items-stretch bg-bg-inset border border-line font-mono text-[11px] leading-tight">
      <div
        className={`flex flex-col items-center justify-center px-3 border-r border-line ${gradeColor[grade]}`}
      >
        <span className="text-2xl font-semibold">{grade}</span>
        <span className="text-[9px] text-ink-dim uppercase tracking-wide">
          {gradeLabel[grade]}
        </span>
      </div>
      <div className="flex-1 px-3 py-2 space-y-1 text-ink-dim">
        <div className="flex justify-between gap-4">
          <span>{benchmarkLabel}</span>
          <span className="text-ink">{benchmarkScore.toLocaleString()}</span>
        </div>
        {wattageDraw > 0 && (
          <div className="flex justify-between gap-4">
            <span>Draw under load</span>
            <span className="text-ink">{wattageDraw}W</span>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <span>Boot verified</span>
          <span className={bootVerified ? "text-pass" : "text-danger"}>
            {bootVerified ? "PASS" : "FAIL"}
          </span>
        </div>
      </div>
    </div>
  );
}
