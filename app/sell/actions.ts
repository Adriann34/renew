"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma, type PhotoKind } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { parseListingFields } from "@/lib/listingValidation";
import {
  ALLOWED_PHOTO_TYPES,
  MAX_PHOTO_BYTES,
  MAX_PHOTOS_PER_LISTING,
  uploadPhoto,
} from "@/lib/photoUpload";
import {
  isAiVerificationEnabled,
  verifyListingClaims,
  autofillDiagnostics,
  PHOTO_KIND_LABEL,
  type AiImageInput,
  type AutofillResult,
} from "@/lib/aiVerify";

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
  const aiImages: AiImageInput[] = [];
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
      aiImages.push({ label: PHOTO_KIND_LABEL[kind], kind, buffer: Buffer.from(await file.arrayBuffer()) });
    }
  }

  // Run AI photo-verification concurrently with the uploads. Best-effort: resolves
  // to null (never throws) if the feature is off or the call fails, and never blocks publish.
  const verifyPromise = isAiVerificationEnabled()
    ? verifyListingClaims(
        {
          title,
          category: categoryRaw,
          grade: gradeRaw,
          spec,
          description,
          benchmarkLabel,
          benchmarkScore,
          wattageDraw,
          bootVerified,
        },
        aiImages
      )
    : Promise.resolve(null);

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

  const aiResult = await verifyPromise;
  const aiFields = aiResult
    ? {
        aiVerified: aiResult.verified,
        aiVerdict: aiResult as unknown as Prisma.InputJsonValue,
        aiCheckedAt: new Date(),
      }
    : {};

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
        ...aiFields,
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

export type AutofillState = { fields: AutofillResult } | { error: string };

/**
 * Reads the proof photos already attached in the create form and proposes the
 * diagnostic-report fields (grade, benchmark, wattage, boot). Auth-checked and
 * server-authoritative — the extraction runs here, not on the client. The client
 * gates this behind having the photos; this re-validates images defensively.
 */
export async function autofillDiagnosticsAction(formData: FormData): Promise<AutofillState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };
  if (!isAiVerificationEnabled()) return { error: "AI autofill isn't available right now." };

  const aiImages: AiImageInput[] = [];
  for (const { field, kind } of PHOTO_FIELDS) {
    const files = formData.getAll(field).filter((f): f is File => f instanceof File && f.size > 0);
    for (const file of files) {
      if (!ALLOWED_PHOTO_TYPES.has(file.type) || file.size > MAX_PHOTO_BYTES) continue;
      aiImages.push({ label: PHOTO_KIND_LABEL[kind], kind, buffer: Buffer.from(await file.arrayBuffer()) });
    }
  }
  if (aiImages.length === 0) return { error: "Add your proof photos first." };

  const result = await autofillDiagnostics(aiImages);
  if (!result) return { error: "Couldn't read the photos — please fill the report in manually." };
  return { fields: result };
}
