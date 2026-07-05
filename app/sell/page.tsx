import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { categoryOrder, categoryLabels, categoryDiagnosticTier } from "@/lib/category";

const TIER_BLURB = {
  full: "Full diagnostic report — benchmark score, draw under load, boot verified.",
  "wattage-boot": "Draw under load + boot verified.",
  "boot-only": "Boot verified.",
} as const;

export default async function SellPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/sell");

  return (
    <main>
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-teal mb-3">
          For sellers
        </p>
        <h1 className="font-display font-semibold text-2xl mb-2">
          What are you selling?
        </h1>
        <p className="text-ink-dim text-[14px] mb-10 max-w-xl">
          Pick a category — the diagnostic report you fill in next is tailored to it, so you&apos;re
          never asked for numbers that don&apos;t apply to the part.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {categoryOrder.map((category) => (
            <Link
              key={category}
              href={`/sell/${category.toLowerCase()}`}
              className="group block border border-line bg-bg-elevated p-5 hover:border-amber/60 transition-colors"
            >
              <h2 className="font-display font-medium text-[16px] mb-1.5 group-hover:text-amber transition-colors">
                {categoryLabels[category]}
              </h2>
              <p className="text-ink-dim text-[13px] leading-relaxed">
                {TIER_BLURB[categoryDiagnosticTier[category]]}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
