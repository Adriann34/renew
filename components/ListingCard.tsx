import { GpuMark } from "@/components/icons/GpuMark";
import { ConditionBadge } from "@/components/ConditionBadge";
import { formatPrice } from "@/lib/format";
import type { ListingWithRelations } from "@/lib/listings";

export function ListingCard({ listing }: { listing: ListingWithRelations }) {
  const conditionPhoto = listing.photos
    .filter((p) => p.kind === "CONDITION")
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];

  return (
    <a
      href={`/listing/${listing.id}`}
      className="group block border border-line bg-bg-elevated hover:border-amber/60 transition-colors"
    >
      <div className="aspect-4/3 border-b border-line overflow-hidden">
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
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-ink-dim mb-1">
              {listing.category} · {listing.spec}
            </p>
            <h3 className="font-display font-medium text-[15px] leading-snug">
              {listing.title}
            </h3>
          </div>
          <p className="font-mono text-amber text-[15px] whitespace-nowrap">
            {formatPrice(listing.price)}
          </p>
        </div>

        <ConditionBadge grade={listing.grade} />

        <div className="text-[11px] text-ink-dim pt-1">
          {listing.seller.name ?? listing.seller.email} · {listing.location}
        </div>
      </div>
    </a>
  );
}
