"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GpuMark } from "@/components/icons/GpuMark";
import { ConditionBadge } from "@/components/ConditionBadge";
import { toggleSaveAction } from "@/app/listing/actions";
import { Price } from "@/components/Price";
import type { ListingWithRelations } from "@/lib/listings";

export function SavedListingCard({ listing }: { listing: ListingWithRelations }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const conditionPhoto = listing.photos
    .filter((p) => p.kind === "CONDITION")
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];

  function handleRemove() {
    startTransition(async () => {
      setError(null);
      const result = await toggleSaveAction(listing.id);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="border border-line bg-bg-elevated">
      <Link href={`/listing/${listing.id}`} className="relative block aspect-4/3 border-b border-line overflow-hidden group">
        {conditionPhoto ? (
          <img src={conditionPhoto.url} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-8">
            <GpuMark className="w-full h-full text-ink-dim group-hover:text-amber/80 transition-colors" />
          </div>
        )}
        {listing.bootVerified && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 bg-bg-elevated/90 border border-pass/40 text-pass text-[10px] font-mono uppercase tracking-wide px-2 py-1 rounded-(--radius-tag)">
            <span className="w-1.5 h-1.5 rounded-full bg-pass" />
            Verified
          </span>
        )}
      </Link>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-ink-dim mb-1">
              {listing.category} · {listing.spec}
            </p>
            <Link
              href={`/listing/${listing.id}`}
              className="font-display font-medium text-[15px] leading-snug truncate hover:text-amber transition-colors block"
            >
              {listing.title}
            </Link>
          </div>
          <Price
            amount={listing.price}
            currency={listing.currency}
            align="right"
            className="text-[15px] whitespace-nowrap"
          />
        </div>

        <ConditionBadge grade={listing.grade} />

        <button
          type="button"
          onClick={handleRemove}
          disabled={pending}
          className="w-full border border-line text-[12px] font-semibold h-8 rounded-(--radius-tag) hover:border-danger hover:text-danger disabled:opacity-50 transition-colors"
        >
          {pending ? "Removing…" : "Remove from saved"}
        </button>
        {error && <p className="text-[11px] text-danger">{error}</p>}
      </div>
    </div>
  );
}
