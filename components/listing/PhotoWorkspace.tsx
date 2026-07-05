"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DiagnosticTier } from "@/lib/category";

export type PhotoCategoryKey = "condition" | "burn_in" | "benchmark" | "boot";

export type PhotosState = Record<PhotoCategoryKey, File[]>;

export const emptyPhotosState: PhotosState = {
  condition: [],
  burn_in: [],
  benchmark: [],
  boot: [],
};

const ALL_PHOTO_CATEGORIES: {
  key: PhotoCategoryKey;
  field: string;
  label: string;
  required: boolean;
  hint: string;
  tiers: DiagnosticTier[];
}[] = [
  {
    key: "condition",
    field: "photos_condition",
    label: "Condition photos",
    required: true,
    hint: "Close-up photos showing physical condition and any wear.",
    tiers: ["full", "wattage-boot", "boot-only"],
  },
  {
    key: "burn_in",
    field: "photos_burn_in",
    label: "Burn-in proof",
    required: false,
    hint: "A photo or screenshot from a sustained load test.",
    tiers: ["full", "wattage-boot"],
  },
  {
    key: "benchmark",
    field: "photos_benchmark",
    label: "Benchmark shot",
    required: false,
    hint: "Screenshot of the benchmark score above.",
    tiers: ["full"],
  },
  {
    key: "boot",
    field: "photos_boot",
    label: "Boot / POST",
    required: false,
    hint: "Proof the part boots and is recognized correctly.",
    tiers: ["full", "wattage-boot", "boot-only"],
  },
];

export function getPhotoCategoriesForTier(tier: DiagnosticTier) {
  return ALL_PHOTO_CATEGORIES.filter((c) => c.tiers.includes(tier));
}

function useObjectUrls(files: File[]): string[] {
  const urls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => {
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [urls]);
  return urls;
}

/** Keeps a hidden, named file input in sync with in-memory File[] state so it rides along with the surrounding <form> submission. */
function HiddenFileInput({ field, files }: { field: string; files: File[] }) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));
    ref.current.files = dt.files;
  }, [files]);

  return <input ref={ref} type="file" name={field} multiple hidden />;
}

export function PhotoWorkspace({
  tier,
  photos,
  onPhotosChange,
}: {
  tier: DiagnosticTier;
  photos: PhotosState;
  onPhotosChange: (key: PhotoCategoryKey, files: File[]) => void;
}) {
  const categories = getPhotoCategoriesForTier(tier);
  const [activeTab, setActiveTab] = useState<PhotoCategoryKey>("condition");
  const [activeIndex, setActiveIndex] = useState<Record<PhotoCategoryKey, number>>({
    condition: 0,
    burn_in: 0,
    benchmark: 0,
    boot: 0,
  });
  const [dragging, setDragging] = useState(false);
  const pickerRef = useRef<HTMLInputElement>(null);

  const meta = categories.find((c) => c.key === activeTab) ?? categories[0];
  const activePhotos = photos[activeTab];
  const idx = Math.min(activeIndex[activeTab], Math.max(0, activePhotos.length - 1));
  const urls = useObjectUrls(activePhotos);

  function addFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    const next = [...photos[activeTab], ...files];
    onPhotosChange(activeTab, next);
    setActiveIndex((s) => ({ ...s, [activeTab]: next.length - 1 }));
  }

  function removeAt(i: number) {
    const next = photos[activeTab].filter((_, j) => j !== i);
    onPhotosChange(activeTab, next);
    setActiveIndex((s) => ({ ...s, [activeTab]: Math.max(0, Math.min(s[activeTab], next.length - 1)) }));
  }

  function goTo(i: number) {
    setActiveIndex((s) => ({ ...s, [activeTab]: i }));
  }

  return (
    <div className="border border-line bg-bg-elevated p-5">
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((c) => {
          const count = photos[c.key].length;
          const active = c.key === activeTab;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setActiveTab(c.key)}
              className={`flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide px-3 py-1.5 border transition-colors ${
                active
                  ? "bg-amber text-bg-inset border-amber"
                  : "bg-bg-inset text-ink-dim border-line hover:text-ink"
              }`}
            >
              {c.label}
              {c.required && <span className="text-danger">*</span>}
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 ${active ? "bg-bg-inset/30" : "bg-line/60"}`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`relative aspect-4/3 border overflow-hidden ${
          dragging ? "border-amber bg-amber/5" : "border-line bg-bg-inset"
        }`}
      >
        {activePhotos.length === 0 ? (
          <button
            type="button"
            onClick={() => pickerRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center gap-2 text-center px-6"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-dim">
              <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
              <polyline points="7 9 12 4 17 9" />
              <line x1="12" y1="4" x2="12" y2="16" />
            </svg>
            <span className="text-[13px] font-medium text-ink-dim">Drop photos here, or click to browse</span>
            <span className="text-[11px] text-ink-dim/70 max-w-[220px]">{meta.hint}</span>
          </button>
        ) : (
          <>
            <img src={urls[idx]} alt={`${meta.label} ${idx + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(idx)}
              aria-label="Remove photo"
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-ink/60 text-bg hover:bg-danger transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            {activePhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo((idx - 1 + activePhotos.length) % activePhotos.length)}
                  aria-label="Previous photo"
                  className="absolute top-1/2 -translate-y-1/2 left-2 w-7 h-7 flex items-center justify-center bg-ink/50 text-bg hover:bg-ink/80 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => goTo((idx + 1) % activePhotos.length)}
                  aria-label="Next photo"
                  className="absolute top-1/2 -translate-y-1/2 right-2 w-7 h-7 flex items-center justify-center bg-ink/50 text-bg hover:bg-ink/80 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                <div className="absolute bottom-2 left-0 right-0 flex gap-1.5 justify-center">
                  {activePhotos.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`Go to photo ${i + 1}`}
                      className={`h-1 transition-all ${i === idx ? "w-4 bg-bg" : "w-1.5 bg-bg/50"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {activePhotos.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-3">
          {urls.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`relative w-12 h-12 shrink-0 border overflow-hidden ${
                i === idx ? "border-amber" : "border-line"
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => pickerRef.current?.click()}
            aria-label="Add more photos"
            className="w-12 h-12 shrink-0 border border-dashed border-line flex items-center justify-center text-ink-dim hover:border-amber hover:text-amber transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      )}

      <p className="text-[11px] text-ink-dim mt-3">{meta.hint}</p>

      <input
        ref={pickerRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          addFiles(e.target.files ?? []);
          e.target.value = "";
        }}
      />

      {categories.map((c) => (
        <HiddenFileInput key={c.key} field={c.field} files={photos[c.key]} />
      ))}
    </div>
  );
}
