import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EditListingForm } from "@/components/listing/EditListingForm";
import { getListingById } from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/signin?next=/listing/${id}/edit`);
  if (user.id !== listing.sellerId) redirect(`/listing/${id}`);

  return (
    <main>
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-16">
        <Link
          href={`/listing/${id}`}
          className="text-[13px] text-ink-dim hover:text-ink transition-colors"
        >
          ← Back to listing
        </Link>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-teal mb-3 mt-4">
          For sellers
        </p>
        <h1 className="font-display font-semibold text-2xl mb-2">Edit listing</h1>
        <p className="text-ink-dim text-[14px] mb-10 max-w-xl">
          Update your diagnostic report or photos — changes go live as soon as you save.
        </p>

        <EditListingForm listing={listing} />
      </div>

      <Footer />
    </main>
  );
}
