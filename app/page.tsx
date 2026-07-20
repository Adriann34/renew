import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { CategoryStrip } from "@/components/CategoryStrip";
import { TrustBar } from "@/components/TrustBar";
import { SellCta } from "@/components/SellCta";
import { Footer } from "@/components/Footer";
import { ListingCard } from "@/components/ListingCard";
import { getListings } from "@/lib/listings";

export default async function Home() {
  const listings = await getListings();

  return (
    <main>
      <Navbar />
      <Hero />
      <CategoryStrip />

      <section id="listings" className="max-w-7xl mx-auto px-6 pt-10 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber mb-2">
              Just tested
            </p>
            <h2 className="font-display font-semibold text-2xl">
              Recently published listings
            </h2>
          </div>
          <Link href="/browse" className="text-[13px] text-ink-dim hover:text-ink">
            View all →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <TrustBar />
      <SellCta />
      <Footer />
    </main>
  );
}
