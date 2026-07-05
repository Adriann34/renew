import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CreateListingForm } from "@/components/listing/CreateListingForm";
import { createClient } from "@/lib/supabase/server";
import { categoryFromSlug, categoryLabels } from "@/lib/category";

export default async function SellCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/signin?next=/sell/${slug}`);

  return (
    <main>
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-16">
        <Link href="/sell" className="text-[13px] text-ink-dim hover:text-ink transition-colors">
          ← Change category
        </Link>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-teal mb-3 mt-4">
          For sellers
        </p>
        <h1 className="font-display font-semibold text-2xl mb-2">
          List your {categoryLabels[category]}
        </h1>
        <p className="text-ink-dim text-[14px] mb-10 max-w-xl">
          Fill in your diagnostic report and back it up with photos. Verified listings sell
          faster and for better prices.
        </p>

        <CreateListingForm category={category} />
      </div>

      <Footer />
    </main>
  );
}
