import { prisma } from "@/lib/prisma";

export async function getSavedListings(userId: string) {
  const saved = await prisma.savedListing.findMany({
    where: { userId },
    include: { listing: { include: { photos: true, seller: true } } },
    orderBy: { createdAt: "desc" },
  });
  return saved.map((s) => s.listing);
}

export function isListingSaved(userId: string, listingId: string) {
  return prisma.savedListing
    .findUnique({ where: { userId_listingId: { userId, listingId } } })
    .then((s) => s !== null);
}
