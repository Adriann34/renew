import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ListingWithRelations = Prisma.ListingGetPayload<{
  include: { photos: true; seller: true };
}>;

export type ListingWithSaveCount = Prisma.ListingGetPayload<{
  include: { photos: true; seller: true; _count: { select: { savedBy: true } } };
}>;

export function getListings() {
  return prisma.listing.findMany({
    where: { status: "ACTIVE" },
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

export function getListingsBySeller(sellerId: string) {
  return prisma.listing.findMany({
    where: { sellerId },
    include: { photos: true, seller: true, _count: { select: { savedBy: true } } },
    orderBy: { createdAt: "desc" },
  });
}
