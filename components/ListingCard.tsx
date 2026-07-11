import Link from "next/link";
import { GpuMark } from "@/components/icons/GpuMark";
import { ConditionBadge } from "@/components/ConditionBadge";
import { formatPrice } from "@/lib/format";
import type { ListingWithRelations } from "@/lib/listings";

export function ListingCard({
  listing,
  view = "grid",
}: {
  listing: ListingWithRelations;
  view?: "grid" | "list";
}) {
  const conditionPhoto = listing.photos
    .filter((p) => p.kind === "CONDITION")
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];

  return (
    <Link
      href={`/listing/${listing.id}`}
      className={`group block border border-line bg-bg-elevated hover:border-amber/60 transition-colors ${
        view === "list" ? "flex flex-row" : ""
      }`}
    >
      <div
        className={`relative border-line overflow-hidden shrink-0 ${
          view === "list" ? "w-40 sm:w-56 border-r" : "aspect-4/3 border-b"
        }`}
      >
        {conditionPhoto ? (
          <img
            src={conditionPhoto.url}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-8">
            <GpuMark className="w-full h-full text-ink-dim group-hover:text-amber/80 transition-colors" />
          </div>
        )}

        {listing.aiVerified && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 bg-bg-elevated/90 border border-amber/50 text-amber text-[10px] font-mono uppercase tracking-wide px-2 py-1 rounded-(--radius-tag)">
            <span className="w-1.5 h-1.5 rounded-full bg-amber" />
            AI-verified
          </span>
        )}
      </div>

      <div className="p-4 space-y-3 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-ink-dim mb-1">
              {listing.category} · {listing.spec}
            </p>
            <h3 className="font-display font-medium text-[15px] leading-snug truncate">
              {listing.title}
            </h3>
          </div>
          <p className="font-mono text-amber text-[15px] whitespace-nowrap">
            {formatPrice(listing.price)}
          </p>
        </div>

        <ConditionBadge grade={listing.grade} />

        <div className="text-[11px] text-ink-dim pt-1 truncate">
          {listing.seller.name ?? listing.seller.email} · {listing.location}
        </div>
      </div>
    </Link>
  );
}
