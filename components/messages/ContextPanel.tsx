import Link from "next/link";
import { Price } from "@/components/Price";

export function ContextPanel({
  listingId,
  title,
  price,
  currency,
  category,
  spec,
  thumbnailUrl,
}: {
  listingId: string;
  title: string;
  price: number;
  currency: string;
  category: string;
  spec: string;
  thumbnailUrl: string | null;
}) {
  return (
    <aside className="hidden xl:flex w-72 shrink-0 border-l border-line p-4 flex-col gap-4 overflow-y-auto">
      <div className="border border-line bg-bg-inset p-3.5 rounded-(--radius-tag)">
        <p className="font-mono text-[10.5px] tracking-widest text-ink-dim uppercase mb-2.5">
          Listing
        </p>
        <div className="aspect-16/10 mb-2.5 overflow-hidden rounded-(--radius-tag) border border-line bg-bg">
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid-texture" />
          )}
        </div>
        <Price amount={price} currency={currency} className="font-bold text-[15px]" />
        <p className="text-[13px] font-medium mt-0.5 mb-0.5">{title}</p>
        <p className="font-mono text-[11px] text-ink-dim mb-3">
          {category} · {spec}
        </p>
        <Link
          href={`/listing/${listingId}`}
          className="block text-center bg-bg-elevated border border-line text-[13px] font-medium py-2 rounded-(--radius-tag) hover:border-ink-dim transition-colors"
        >
          View full listing
        </Link>
      </div>

      <div className="border border-pass/40 bg-pass/10 p-3.5 rounded-(--radius-tag)">
        <div className="flex items-center gap-2 font-semibold text-[13px] text-pass mb-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Stay protected
        </div>
        <p className="text-[12px] text-pass/90 leading-relaxed">
          Keep the deal inside Renew. Never wire money or pay outside the app, even if
          you&apos;re asked to — inspect the item against its diagnostic report first.
        </p>
      </div>
    </aside>
  );
}
