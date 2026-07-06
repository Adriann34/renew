"use server";

import { randomUUID } from "node:crypto";
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
  uploadPhoto,
} from "@/lib/photoUpload";

export type CreateListingState = { error: string | null };

const PHOTO_FIELDS: { field: string; kind: PhotoKind }[] = [
  { field: "photos_condition", kind: "CONDITION" },
  { field: "photos_burn_in", kind: "BURN_IN" },
  { field: "photos_benchmark", kind: "BENCHMARK" },
  { field: "photos_boot", kind: "BOOT" },
];

export async function createListingAction(
  _prevState: CreateListingState,
  formData: FormData
): Promise<CreateListingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to create a listing." };
  }

  const parsed = parseListingFields(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }
  const {
    title,
    category: categoryRaw,
    price,
    grade: gradeRaw,
    spec,
    location,
    description,
    bootVerified,
    benchmarkLabel,
    benchmarkScore,
    wattageDraw,
  } = parsed.fields;

  const conditionFiles = formData
    .getAll("photos_condition")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (conditionFiles.length === 0) {
    return { error: "Please attach at least one condition photo." };
  }

  const listingId = randomUUID();
  const uploadTasks: Promise<{ kind: PhotoKind; url: string; path: string }>[] = [];
  let totalPhotoCount = 0;

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

  let listing;
  try {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email!,
        name: (user.user_metadata?.name as string | undefined) ?? null,
      },
    });

    listing = await prisma.listing.create({
      data: {
        id: listingId,
        title,
        category: categoryRaw,
        price,
        grade: gradeRaw,
        spec,
        location,
        description,
        benchmarkScore,
        benchmarkLabel,
        wattageDraw,
        bootVerified,
        sellerId: user.id,
        photos: {
          create: uploaded.map(({ kind, url }) => ({ kind, url })),
        },
      },
    });
  } catch {
    if (uploaded.length > 0) {
      await supabase.storage.from("listing-photos").remove(uploaded.map((u) => u.path));
    }
    return { error: "Failed to create listing. Please try again." };
  }

  revalidatePath("/");
  redirect(`/listing/${listing.id}`);
}
