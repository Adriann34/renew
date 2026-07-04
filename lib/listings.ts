import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ListingWithRelations = Prisma.ListingGetPayload<{
  include: { photos: true; seller: true };
}>;

export function getListings() {
  return prisma.listing.findMany({
    include: { photos: true, seller: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getListingById(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: { photos: true, seller: true },
  });
}
