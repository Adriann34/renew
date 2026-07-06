import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AccountView } from "@/components/account/AccountView";
import { getListingsBySeller } from "@/lib/listings";
import { getSavedListings } from "@/lib/saved";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/account");

  const [dbUser, listings, saved] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id } }),
    getListingsBySeller(user.id),
    getSavedListings(user.id),
  ]);

  const profile = {
    name: dbUser?.name ?? (user.user_metadata?.name as string | undefined) ?? null,
    email: user.email!,
    phone: dbUser?.phone ?? null,
    location: dbUser?.location ?? null,
    avatarUrl: dbUser?.avatarUrl ?? null,
    createdAt: dbUser?.createdAt ?? new Date(user.created_at),
  };

  return (
    <main>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-10 pb-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber mb-2">
          Account
        </p>
        <h1 className="font-display font-semibold text-2xl">My account</h1>
      </div>

      <AccountView profile={profile} listings={listings} saved={saved} />

      <Footer />
    </main>
  );
}
