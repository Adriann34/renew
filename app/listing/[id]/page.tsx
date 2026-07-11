import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DiagnosticTag } from "@/components/DiagnosticTag";
import { ListingGallery, type GalleryGroup } from "@/components/listing/ListingGallery";
import { ListingActions } from "@/components/listing/ListingActions";
import { DeleteListingButton } from "@/components/listing/DeleteListingButton";
import { MessageSellerButton } from "@/components/listing/MessageSellerButton";
import { BuyNowButton } from "@/components/listing/BuyNowButton";
import { ListingDescription } from "@/components/listing/ListingDescription";
import { AiVerdictPanel } from "@/components/listing/AiVerdictPanel";
import { getListingById } from "@/lib/listings";
import { parseAiVerdict } from "@/lib/aiVerify";
import { isListingSaved } from "@/lib/saved";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import type { PhotoKind } from "@prisma/client";

const PHOTO_KIND_LABELS: Record<PhotoKind, string> = {
  CONDITION: "Condition",
  BURN_IN: "Burn-in test",
  BENCHMARK: "Benchmark",
  BOOT: "Boot / POST",
};

const PHOTO_KIND_ORDER: PhotoKind[] = ["CONDITION", "BURN_IN", "BENCHMARK", "BOOT"];

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) notFound();

  const aiVerdict = parseAiVerdict(listing.aiVerdict);

  const groups: GalleryGroup[] = PHOTO_KIND_ORDER.map((kind) => ({
    kind,
    label: PHOTO_KIND_LABELS[kind],
    photos: listing.photos.filter((p) => p.kind === kind),
  })).filter((group) => group.photos.length > 0);

  const proofCount = groups.length;
  const sellerLabel = listing.seller.name ?? listing.seller.email;
  const initials = sellerLabel.slice(0, 2).toUpperCase();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = !!user && user.id === listing.sellerId;
  const initialSaved = user ? await isListingSaved(user.id, listing.id) : false;

  return (
    <main>
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-6">
        <Link
          href="/#listings"
          className="inline-flex items-center gap-2 text-[13px] text-ink-dim hover:text-ink transition-colors"
        >
          ← Back to listings
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-10 items-start">
        <div className="w-full lg:w-125 lg:sticky lg:top-22 shrink-0">
          <ListingGallery groups={groups} title={listing.title} />
        </div>

        <div className="w-full lg:flex-1 lg:min-w-0">
          {isOwner && (
            <div className="flex items-center justify-between gap-3 flex-wrap border border-line bg-bg-elevated px-3 py-2.5 mb-5 rounded-(--radius-tag)">
              <span className="text-[12px] text-ink-dim">This is your listing.</span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/listing/${listing.id}/edit`}
                  className="border border-line text-[13px] font-medium px-3 h-8 flex items-center rounded-(--radius-tag) hover:border-ink-dim transition-colors"
                >
                  Edit
                </Link>
                <DeleteListingButton listingId={listing.id} />
              </div>
            </div>
          )}

          {!isOwner && listing.status === "SOLD" && (
            <div className="border border-line bg-bg-elevated px-3 py-2.5 mb-5 rounded-(--radius-tag)">
              <span className="text-[12px] text-ink-dim">
                This listing has been marked as sold and is no longer available.
              </span>
            </div>
          )}

          <p className="text-[11px] uppercase tracking-widest text-ink-dim mb-1">
            {listing.category} · {listing.spec}
          </p>

          <div className="flex items-start justify-between gap-4">
            <h1 className="font-display font-semibold text-2xl leading-tight">
              {listing.title}
            </h1>
            <ListingActions listingId={listing.id} initialSaved={initialSaved} />
          </div>

          <div className="flex items-center gap-3 mt-3 mb-6">
            <p className="font-mono text-amber text-2xl">{formatPrice(listing.price)}</p>
            {aiVerdict?.status === "verified" && (
              <span className="inline-flex items-center gap-1.5 border border-amber text-amber bg-amber/10 text-[11px] font-medium uppercase tracking-wide px-2.5 py-1 rounded-(--radius-tag)">
                ✦ AI-verified
              </span>
            )}
            {listing.bootVerified && (
              <span className="inline-flex items-center gap-1.5 border border-pass text-pass bg-pass/10 text-[11px] font-medium uppercase tracking-wide px-2.5 py-1 rounded-(--radius-tag)">
                ✓ Verified listing
              </span>
            )}
          </div>

          <div className="mb-4">
            <DiagnosticTag
              grade={listing.grade}
              benchmarkScore={listing.benchmarkScore}
              benchmarkLabel={listing.benchmarkLabel}
              wattageDraw={listing.wattageDraw}
              bootVerified={listing.bootVerified}
            />
          </div>

          <div className="flex items-center gap-x-4 gap-y-2 flex-wrap border border-line bg-bg-elevated px-4 py-3 mb-6">
            {PHOTO_KIND_ORDER.map((kind) => {
              const has = groups.some((g) => g.kind === kind);
              return (
                <span
                  key={kind}
                  className={`inline-flex items-center gap-1.5 text-[12px] ${
                    has ? "text-ink" : "text-ink-dim/50"
                  }`}
                >
                  <span className={has ? "text-pass" : ""}>{has ? "✓" : "–"}</span>
                  {PHOTO_KIND_LABELS[kind]}
                </span>
              );
            })}
            <span className="ml-auto font-mono text-[11px] text-ink-dim">
              {proofCount}/4 proofs attached
            </span>
          </div>

          {aiVerdict && <AiVerdictPanel result={aiVerdict} />}

          <div className="flex items-center gap-3 py-4 border-t border-b border-line mb-6">
            <div className="w-10 h-10 shrink-0 overflow-hidden flex items-center justify-center rounded-(--radius-tag) bg-amber text-bg-inset font-mono font-semibold text-sm">
              {listing.seller.avatarUrl ? (
                <img src={listing.seller.avatarUrl} alt={sellerLabel} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium truncate">{sellerLabel}</p>
              <p className="text-[12px] text-ink-dim truncate">{listing.location}</p>
            </div>
            {!isOwner && <MessageSellerButton listingId={listing.id} />}
          </div>

          {listing.description && <ListingDescription text={listing.description} />}

          {!isOwner && <BuyNowButton listingId={listing.id} />}
        </div>
      </div>

      <Footer />
    </main>
  );
}
