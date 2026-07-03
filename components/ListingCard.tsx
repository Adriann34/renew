import { GpuMark } from "@/components/icons/GpuMark";
import { DiagnosticTag } from "@/components/DiagnosticTag";
import type { Listing } from "@/lib/data";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <a
      href={`/listing/${listing.id}`}
      className="group block border border-line bg-bg-elevated hover:border-amber/60 transition-colors"
    >
      <div className="aspect-4/3 flex items-center justify-center p-8 border-b border-line">
        <GpuMark className="w-full h-full text-ink-dim group-hover:text-amber/80 transition-colors" />
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-ink-dim mb-1">
              {listing.category} · {listing.vramOrSpec}
            </p>
            <h3 className="font-display font-medium text-[15px] leading-snug">
              {listing.title}
            </h3>
          </div>
          <p className="font-mono text-amber text-[15px] whitespace-nowrap">
            {listing.price.toLocaleString()} kr
          </p>
        </div>

        <DiagnosticTag
          grade={listing.grade}
          benchmarkScore={listing.benchmarkScore}
          benchmarkLabel={listing.benchmarkLabel}
          wattageDraw={listing.wattageDraw}
          bootVerified={listing.bootVerified}
        />

        <div className="flex items-center justify-between text-[11px] text-ink-dim pt-1">
          <span>{listing.hoursUsed.toLocaleString()} hrs logged</span>
          <span>
            {listing.seller} · {listing.location}
          </span>
        </div>
      </div>
    </a>
  );
}
