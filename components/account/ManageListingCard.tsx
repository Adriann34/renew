import Link from "next/link";
import { GpuMark } from "@/components/icons/GpuMark";
import { ConditionBadge } from "@/components/ConditionBadge";
import { DeleteListingButton } from "@/components/listing/DeleteListingButton";
import { MarkSoldButton } from "@/components/account/MarkSoldButton";
import { formatPrice } from "@/lib/format";
import type { ListingWithSaveCount } from "@/lib/listings";

export function ManageListingCard({ listing }: { listing: ListingWithSaveCount }) {
  const conditionPhoto = listing.photos
    .filter((p) => p.kind === "CONDITION")
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
  const savedCount = listing._count.savedBy;
  const isSold = listing.status === "SOLD";

  return (
    <div className="border border-line bg-bg-elevated">
      <Link href={`/listing/${listing.id}`} className="relative block aspect-4/3 border-b border-line overflow-hidden group">
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

        <div className="absolute top-2 left-2">
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wide px-2 py-1 rounded-(--radius-tag) bg-bg-elevated/90 border ${
              isSold ? "border-line text-ink-dim" : "border-pass/40 text-pass"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isSold ? "bg-ink-dim" : "bg-pass"}`} />
            {isSold ? "Sold" : "Active"}
          </span>
        </div>
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
          <p className="font-mono text-amber text-[15px] whitespace-nowrap">
            {formatPrice(listing.price)}
          </p>
        </div>

        <ConditionBadge grade={listing.grade} />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-ink-dim font-mono">
            {savedCount} saved · listed {new Date(listing.createdAt).toLocaleDateString()}
          </p>
          <DeleteListingButton listingId={listing.id} iconOnly />
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-line">
          <Link
            href={`/listing/${listing.id}/edit`}
            className="flex-1 text-center border border-line text-[12px] font-semibold px-3 h-8 flex items-center justify-center rounded-(--radius-tag) hover:border-ink-dim transition-colors"
          >
            Edit
          </Link>
          {!isSold && <MarkSoldButton listingId={listing.id} />}
        </div>
      </div>
    </div>
  );
}
