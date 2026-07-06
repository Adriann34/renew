"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { GpuMark } from "@/components/icons/GpuMark";
import type { PhotoKind } from "@prisma/client";

export type GalleryGroup = {
  kind: PhotoKind;
  label: string;
  photos: { id: string; url: string }[];
};

export function ListingGallery({
  groups,
  title,
}: {
  groups: GalleryGroup[];
  title: string;
}) {
  const [tabIdx, setTabIdx] = useState(0);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const group = groups[tabIdx];
  const count = group?.photos.length ?? 0;
  const multi = count > 1;

  const step = useCallback(
    (delta: number) => {
      setPhotoIdx((i) => (i + delta + count) % count);
    },
    [count],
  );

  // Lightbox keyboard controls + scroll lock while open.
  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(false);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, step]);

  if (groups.length === 0) {
    return (
      <div className="aspect-4/3 flex items-center justify-center border border-line bg-bg-elevated p-8">
        <GpuMark className="w-full h-full text-ink-dim" />
      </div>
    );
  }

  const photo = group.photos[photoIdx];

  function selectTab(i: number) {
    setTabIdx(i);
    setPhotoIdx(0);
  }

  return (
    <>
      <div className="border border-line bg-bg-elevated p-4 space-y-3">
        <div className="flex gap-1.5 flex-wrap">
          {groups.map((g, i) => (
            <button
              key={g.kind}
              type="button"
              onClick={() => selectTab(i)}
              className={`font-mono text-[11px] uppercase tracking-wide px-3 h-7 rounded-(--radius-tag) border transition-colors ${
                i === tabIdx
                  ? "bg-ink text-bg border-ink"
                  : "border-line text-ink-dim hover:text-ink hover:border-ink-dim"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="aspect-4/3 relative border border-line bg-bg-inset overflow-hidden">
          <Image
            key={photo.id}
            src={photo.url}
            alt={`${group.label} photo for ${title}`}
            fill
            className="object-cover"
          />

          {/* Full-surface click target to expand into the lightbox. */}
          <button
            type="button"
            onClick={() => setLightbox(true)}
            aria-label="Expand photo"
            className="absolute inset-0 z-0 cursor-zoom-in"
          />

          {multi && (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-(--radius-tag) bg-ink/60 text-bg hover:bg-ink/80 transition-colors"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-(--radius-tag) bg-ink/60 text-bg hover:bg-ink/80 transition-colors"
              >
                ›
              </button>
              <div className="absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-1.5">
                {group.photos.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPhotoIdx(i)}
                    aria-label={`Go to photo ${i + 1}`}
                    className={`h-1.5 rounded-(--radius-tag) transition-all ${
                      i === photoIdx ? "w-4 bg-bg" : "w-1.5 bg-bg/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {multi && (
          <div className="flex gap-2 flex-wrap">
            {group.photos.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPhotoIdx(i)}
                className={`relative w-13 h-13 shrink-0 overflow-hidden rounded-(--radius-tag) border-2 transition-colors ${
                  i === photoIdx ? "border-amber" : "border-transparent"
                }`}
              >
                <Image src={p.url} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${group.label} photos for ${title}`}
          onClick={() => setLightbox(false)}
          className="fixed inset-0 z-100 flex items-center justify-center bg-ink/90 backdrop-blur-sm p-6"
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Close"
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-bg/10 text-bg text-sm hover:bg-bg/20 transition-colors"
          >
            ✕
          </button>

          {multi && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                aria-label="Previous photo"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-bg/10 text-bg hover:bg-bg/20 transition-colors"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                aria-label="Next photo"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-bg/10 text-bg hover:bg-bg/20 transition-colors"
              >
                ›
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.url}
            alt={`${group.label} photo for ${title}`}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[min(90vw,860px)] max-h-[82vh] w-auto h-auto object-contain rounded-(--radius-tag)"
          />

          {multi && (
            <div className="absolute bottom-5 left-0 right-0 flex justify-center">
              <span className="font-mono text-[12px] text-bg/90 bg-ink/50 px-3 py-1 rounded-(--radius-tag)">
                {photoIdx + 1} / {count}
              </span>
            </div>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}
