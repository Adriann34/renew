import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CreateListingForm } from "@/components/listing/CreateListingForm";
import { createClient } from "@/lib/supabase/server";

export default async function SellPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/sell");

  return (
    <main>
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-teal mb-3">
          For sellers
        </p>
        <h1 className="font-display font-semibold text-2xl mb-2">
          List your hardware
        </h1>
        <p className="text-ink-dim text-[14px] mb-10">
          Fill in your diagnostic report and back it up with photos. Verified
          listings sell faster and for better prices.
        </p>

        <CreateListingForm />
      </div>

      <Footer />
    </main>
  );
}
