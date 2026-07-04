"use client";

import { useEffect, useMemo, useState } from "react";
import type { Grade } from "@prisma/client";
import { GpuMark } from "@/components/icons/GpuMark";

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

export type PreviewFields = {
  title: string;
  price: string;
  spec: string;
  location: string;
  grade: Grade | null;
  benchmarkLabel: string;
  benchmarkScore: string;
  wattageDraw: string;
  bootVerified: boolean;
};

export function ListingPreviewCard({
  fields,
  photos,
  filledCategories,
  totalCategories,
}: {
  fields: PreviewFields;
  photos: File[];
  filledCategories: number;
  totalCategories: number;
}) {
  const [index, setIndex] = useState(0);
  const urls = useMemo(() => photos.map((f) => URL.createObjectURL(f)), [photos]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);

  const clampedIndex = Math.min(index, Math.max(0, urls.length - 1));
  const price = Number(fields.price.replace(/[^0-9.]/g, ""));
  const draw = Number(fields.wattageDraw);

  const diagPills = [
    fields.benchmarkLabel || fields.benchmarkScore
      ? `${fields.benchmarkLabel || "Benchmark"} · ${fields.benchmarkScore || "—"}`
      : null,
    draw > 0 ? `${draw}W under load` : null,
    fields.bootVerified ? "Boots & POSTs ✓" : null,
  ].filter((p): p is string => Boolean(p));

  return (
    <div className="border border-line bg-bg-elevated">
      <div className="relative aspect-16/10 bg-bg-inset overflow-hidden group">
        {urls.length > 0 ? (
          <img src={urls[clampedIndex]} alt="Listing photo" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-8">
            <GpuMark className="w-full h-full text-ink-dim" />
          </div>
        )}
        {urls.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + urls.length) % urls.length)}
              aria-label="Previous photo"
              className="absolute top-1/2 -translate-y-1/2 left-2 w-6 h-6 flex items-center justify-center bg-ink/50 text-bg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-ink/80"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % urls.length)}
              aria-label="Next photo"
              className="absolute top-1/2 -translate-y-1/2 right-2 w-6 h-6 flex items-center justify-center bg-ink/50 text-bg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-ink/80"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}
      </div>

      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display font-medium text-[15px] leading-snug">
            {fields.title || "Your listing title"}
          </h3>
          <p className="font-mono text-amber text-[14px] whitespace-nowrap">
            {fields.price ? (Number.isNaN(price) ? "$—" : `$${price.toLocaleString()}`) : "$—"}
          </p>
        </div>

        <p className="text-ink-dim text-[13px]">{fields.spec || "Spec details"}</p>

        <div className="flex items-center gap-2 text-[11px] text-ink-dim">
          {fields.grade ? (
            <span
              className={`tag-edge-left inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1 bg-bg-inset border font-mono ${gradeColor[fields.grade]}`}
            >
              <span className="font-semibold leading-none">{fields.grade}</span>
              <span className="text-ink-dim uppercase tracking-wide leading-none">
                {gradeLabel[fields.grade]}
              </span>
            </span>
          ) : (
            <span className="tag-edge-left inline-flex items-center px-3 py-1 bg-bg-inset border border-line font-mono text-ink-dim/70">
              Condition
            </span>
          )}
          <span className="opacity-50">·</span>
          <span>{fields.location || "Location"}</span>
        </div>

        {diagPills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {diagPills.map((p, i) => (
              <span key={i} className="font-mono text-[10px] bg-bg-inset text-ink-dim px-2 py-1">
                {p}
              </span>
            ))}
          </div>
        )}

        <div className="border-t border-line pt-3">
          <div className="flex justify-between text-[10px] uppercase tracking-wide text-ink-dim mb-1.5 font-medium">
            <span>Verification</span>
            <span className="font-mono">
              {filledCategories}/{totalCategories}
            </span>
          </div>
          <div className="h-1.5 bg-bg-inset overflow-hidden">
            <div
              className="h-full bg-amber transition-all"
              style={{ width: `${(filledCategories / totalCategories) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
