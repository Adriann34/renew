"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { PhotoKind } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { parseListingFields } from "@/lib/listingValidation";
import {
  ALLOWED_PHOTO_TYPES,
  MAX_PHOTO_BYTES,
  MAX_PHOTOS_PER_LISTING,
  storagePathFromUrl,
  uploadPhoto,
} from "@/lib/photoUpload";

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
  revalidatePath("/account");
  redirect("/account");
}

export type UpdateListingState = { error: string | null };

const PHOTO_FIELDS: { field: string; kind: PhotoKind }[] = [
  { field: "photos_condition", kind: "CONDITION" },
  { field: "photos_burn_in", kind: "BURN_IN" },
  { field: "photos_benchmark", kind: "BENCHMARK" },
  { field: "photos_boot", kind: "BOOT" },
];

export async function updateListingAction(
  _prevState: UpdateListingState,
  formData: FormData
): Promise<UpdateListingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be signed in to edit a listing." };
  }

  const listingId = String(formData.get("id") ?? "");
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { photos: true },
  });
  if (!listing) return { error: "Listing not found." };
  if (listing.sellerId !== user.id) {
    return { error: "You can only edit your own listings." };
  }

  const parsed = parseListingFields(formData);
  if ("error" in parsed) return { error: parsed.error };
  const {
    title,
    price,
    grade,
    spec,
    location,
    description,
    bootVerified,
    benchmarkLabel,
    benchmarkScore,
    wattageDraw,
  } = parsed.fields;

  const removedPhotoIds = formData.getAll("removedPhotoIds").map(String).filter(Boolean);
  const remainingPhotos = listing.photos.filter((p) => !removedPhotoIds.includes(p.id));

  const newConditionFiles = formData
    .getAll("photos_condition")
    .filter((f): f is File => f instanceof File && f.size > 0);
  const remainingConditionPhotos = remainingPhotos.filter((p) => p.kind === "CONDITION");
  if (remainingConditionPhotos.length === 0 && newConditionFiles.length === 0) {
    return { error: "A listing needs at least one condition photo." };
  }

  const uploadTasks: Promise<{ kind: PhotoKind; url: string; path: string }>[] = [];
  let totalPhotoCount = remainingPhotos.length;

  for (const { field, kind } of PHOTO_FIELDS) {
    const files = formData.getAll(field).filter((f): f is File => f instanceof File && f.size > 0);
    for (const file of files) {
      totalPhotoCount += 1;
      if (totalPhotoCount > MAX_PHOTOS_PER_LISTING) {
        return { error: `You can attach at most ${MAX_PHOTOS_PER_LISTING} photos.` };
      }
      if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
        return { error: "Photos must be JPEG, PNG, WebP, or HEIC images." };
      }
      if (file.size > MAX_PHOTO_BYTES) {
        return { error: `Each photo must be under ${MAX_PHOTO_BYTES / (1024 * 1024)}MB.` };
      }
      uploadTasks.push(uploadPhoto(supabase, listingId, kind, file));
    }
  }

  const results = await Promise.allSettled(uploadTasks);
  const uploaded = results
    .filter((r): r is PromiseFulfilledResult<{ kind: PhotoKind; url: string; path: string }> => r.status === "fulfilled")
    .map((r) => r.value);
  const anyFailed = results.some((r) => r.status === "rejected");

  if (anyFailed) {
    if (uploaded.length > 0) {
      await supabase.storage.from("listing-photos").remove(uploaded.map((u) => u.path));
    }
    return { error: "Failed to upload one or more photos. Please try again." };
  }

  const removedPhotos = listing.photos.filter((p) => removedPhotoIds.includes(p.id));
  const removedStoragePaths = removedPhotos
    .map((p) => storagePathFromUrl(p.url))
    .filter((p): p is string => Boolean(p));

  try {
    await prisma.$transaction([
      ...(removedPhotoIds.length > 0
        ? [prisma.listingPhoto.deleteMany({ where: { id: { in: removedPhotoIds } } })]
        : []),
      prisma.listing.update({
        where: { id: listingId },
        data: {
          title,
          price,
          grade,
          spec,
          location,
          description,
          benchmarkScore,
          benchmarkLabel,
          wattageDraw,
          bootVerified,
          photos: { create: uploaded.map(({ kind, url }) => ({ kind, url })) },
        },
      }),
    ]);
  } catch {
    if (uploaded.length > 0) {
      await supabase.storage.from("listing-photos").remove(uploaded.map((u) => u.path));
    }
    return { error: "Failed to save changes. Please try again." };
  }

  if (removedStoragePaths.length > 0) {
    try {
      await supabase.storage.from("listing-photos").remove(removedStoragePaths);
    } catch {
      // Non-fatal: DB is already consistent; orphaned storage files can be reaped later.
    }
  }

  revalidatePath("/");
  revalidatePath("/browse");
  revalidatePath("/account");
  redirect(`/listing/${listingId}`);
}

export async function setListingStatusAction(
  listingId: string,
  status: "ACTIVE" | "SOLD"
): Promise<{ error: string } | { ok: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return { error: "Listing not found." };
  if (listing.sellerId !== user.id) return { error: "You can only update your own listings." };

  await prisma.listing.update({ where: { id: listingId }, data: { status } });

  revalidatePath("/");
  revalidatePath("/browse");
  revalidatePath("/account");
  return { ok: true };
}

export async function toggleSaveAction(
  listingId: string
): Promise<{ error: string } | { saved: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to save listings." };

  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: { id: user.id, email: user.email!, name: (user.user_metadata?.name as string | undefined) ?? null },
  });

  const existing = await prisma.savedListing.findUnique({
    where: { userId_listingId: { userId: user.id, listingId } },
  });

  if (existing) {
    await prisma.savedListing.delete({ where: { id: existing.id } });
    revalidatePath("/account");
    return { saved: false };
  }

  await prisma.savedListing.create({ data: { userId: user.id, listingId } });
  revalidatePath("/account");
  return { saved: true };
}
