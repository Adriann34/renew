"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type DeleteListingState = { error: string } | void;

// Deletes a listing the signed-in user owns. Ownership is re-checked here on the
// server — never trust the client to only call this for its own listings.
export async function deleteListingAction(listingId: string): Promise<DeleteListingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to delete a listing." };
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { photos: true },
  });

  if (!listing) {
    return { error: "Listing not found." };
  }
  if (listing.sellerId !== user.id) {
    return { error: "You can only delete your own listings." };
  }

  // Best-effort cleanup of uploaded photos in Supabase Storage. Seed/demo photos
  // live in /public and have no storage path, so they're simply skipped.
  const storageMarker = "/listing-photos/";
  const storagePaths = listing.photos
    .map((p) => {
      const i = p.url.indexOf(storageMarker);
      return i === -1 ? null : p.url.slice(i + storageMarker.length);
    })
    .filter((p): p is string => Boolean(p));

  if (storagePaths.length > 0) {
    try {
      await supabase.storage.from("listing-photos").remove(storagePaths);
    } catch {
      // Non-fatal: the DB rows are what matter. Orphaned storage files can be
      // reaped later; don't block deletion on a storage hiccup.
    }
  }

  // ListingPhoto rows cascade-delete via the schema's onDelete: Cascade.
  await prisma.listing.delete({ where: { id: listingId } });

  revalidatePath("/");
  revalidatePath("/browse");
  redirect("/");
}
