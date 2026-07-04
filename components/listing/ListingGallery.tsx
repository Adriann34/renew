"use client";

import { useState } from "react";
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

  if (groups.length === 0) {
    return (
      <div className="aspect-4/3 flex items-center justify-center border border-line bg-bg-elevated p-8">
        <GpuMark className="w-full h-full text-ink-dim" />
      </div>
    );
  }

  const group = groups[tabIdx];
  const photo = group.photos[photoIdx];
  const multi = group.photos.length > 1;

  function selectTab(i: number) {
    setTabIdx(i);
    setPhotoIdx(0);
  }

  function step(delta: number) {
    const count = group.photos.length;
    setPhotoIdx((i) => (i + delta + count) % count);
  }

  return (
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

        {multi && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-(--radius-tag) bg-ink/60 text-bg hover:bg-ink/80 transition-colors"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-(--radius-tag) bg-ink/60 text-bg hover:bg-ink/80 transition-colors"
            >
              ›
            </button>
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
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
  );
}
