import Image from "next/image";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DiagnosticTag } from "@/components/DiagnosticTag";
import { GpuMark } from "@/components/icons/GpuMark";
import { getListingById } from "@/lib/listings";
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

  const photosByKind = PHOTO_KIND_ORDER.map((kind) => ({
    kind,
    photos: listing.photos.filter((p) => p.kind === kind),
  })).filter((group) => group.photos.length > 0);

  return (
    <main>
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12">
        <div>
          {photosByKind.length === 0 ? (
            <div className="aspect-4/3 flex items-center justify-center border border-line bg-bg-elevated p-8">
              <GpuMark className="w-full h-full text-ink-dim" />
            </div>
          ) : (
            <div className="space-y-6">
              {photosByKind.map(({ kind, photos }) => (
                <div key={kind}>
                  <p className="text-[11px] uppercase tracking-widest text-ink-dim mb-2">
                    {PHOTO_KIND_LABELS[kind]}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="aspect-4/3 relative border border-line bg-bg-elevated overflow-hidden"
                      >
                        <Image
                          src={photo.url}
                          alt={`${PHOTO_KIND_LABELS[kind]} photo for ${listing.title}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-widest text-ink-dim mb-1">
            {listing.category} · {listing.spec}
          </p>
          <h1 className="font-display font-semibold text-2xl mb-3">
            {listing.title}
          </h1>
          <p className="font-mono text-amber text-2xl mb-6">
            {formatPrice(listing.price)}
          </p>

          <DiagnosticTag
            grade={listing.grade}
            benchmarkScore={listing.benchmarkScore}
            benchmarkLabel={listing.benchmarkLabel}
            wattageDraw={listing.wattageDraw}
            bootVerified={listing.bootVerified}
          />

          <div className="text-[13px] text-ink-dim mt-5 pt-5 border-t border-line">
            {listing.seller.name ?? listing.seller.email} · {listing.location}
          </div>

          {listing.description && (
            <div className="mt-5 pt-5 border-t border-line">
              <p className="text-[11px] uppercase tracking-widest text-ink-dim mb-2">
                Description
              </p>
              <p className="text-[14px] text-ink whitespace-pre-wrap leading-relaxed">
                {listing.description}
              </p>
            </div>
          )}

          <button
            type="button"
            disabled
            className="w-full mt-8 bg-bg-inset border border-line text-ink-dim text-[14px] font-medium h-11 rounded-(--radius-tag) cursor-not-allowed"
          >
            Buy now — coming soon
          </button>
        </div>
      </div>

      <Footer />
    </main>
  );
}
