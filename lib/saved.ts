import { prisma } from "@/lib/prisma";
import { PUBLIC_USER_SELECT } from "@/lib/listings";

export async function getSavedListings(userId: string) {
  const saved = await prisma.savedListing.findMany({
    where: { userId },
    include: {
      listing: { include: { photos: true, seller: { select: PUBLIC_USER_SELECT } } },
    },
    orderBy: { createdAt: "desc" },
  });
  return saved.map((s) => s.listing);
}

export function isListingSaved(userId: string, listingId: string) {
  return prisma.savedListing
    .findUnique({ where: { userId_listingId: { userId, listingId } } })
    .then((s) => s !== null);
}
