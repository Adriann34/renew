import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { CategoryStrip } from "@/components/CategoryStrip";
import { TrustBar } from "@/components/TrustBar";
import { SellCta } from "@/components/SellCta";
import { Footer } from "@/components/Footer";
import { ListingCard } from "@/components/ListingCard";
import { listings } from "@/lib/data";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <CategoryStrip />

      <section id="listings" className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber mb-2">
              Just tested
            </p>
            <h2 className="font-display font-semibold text-2xl">
              Recently verified listings
            </h2>
          </div>
          <a href="#" className="text-[13px] text-ink-dim hover:text-ink">
            View all →
          </a>
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
