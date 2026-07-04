import type { Grade } from "@prisma/client";

const gradeColor: Record<Grade, string> = {
  A: "text-pass border-pass",
  B: "text-amber border-amber",
  C: "text-danger border-danger",
};

const gradeLabel: Record<Grade, string> = {
  A: "Like New",
  B: "Good",
  C: "Fair",
};

export function ConditionBadge({ grade }: { grade: Grade }) {
  return (
    <div
      className={`tag-edge-left inline-flex items-center gap-2 pl-3 pr-4 py-1.5 bg-bg-inset border font-mono text-[11px] ${gradeColor[grade]}`}
    >
      <span className="text-base font-semibold leading-none">{grade}</span>
      <span className="text-ink-dim uppercase tracking-wide leading-none">
        {gradeLabel[grade]}
      </span>
    </div>
  );
}
