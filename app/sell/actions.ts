"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Category, type Grade, type PhotoKind } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { compressImage } from "@/lib/image";

export type CreateListingState = { error: string | null };

const PHOTO_FIELDS: { field: string; kind: PhotoKind }[] = [
  { field: "photos_condition", kind: "CONDITION" },
  { field: "photos_burn_in", kind: "BURN_IN" },
  { field: "photos_benchmark", kind: "BENCHMARK" },
  { field: "photos_boot", kind: "BOOT" },
];

async function uploadPhoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listingId: string,
  kind: PhotoKind,
  file: File
): Promise<{ kind: PhotoKind; url: string; path: string }> {
  const original = Buffer.from(await file.arrayBuffer());
  const compressed = await compressImage(original);
  const path = `${listingId}/${kind}/${randomUUID()}.webp`;

  const { error } = await supabase.storage
    .from("listing-photos")
    .upload(path, compressed, { contentType: "image/webp" });
  if (error) throw error;

  const { data } = supabase.storage.from("listing-photos").getPublicUrl(path);
  return { kind, url: data.publicUrl, path };
}

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function num(formData: FormData, key: string): number {
  const value = formData.get(key);
  return typeof value === "string" ? Number(value) : NaN;
}

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

  const title = str(formData, "title");
  const categoryRaw = str(formData, "category");
  const price = num(formData, "price");
  const spec = str(formData, "spec");
  const location = str(formData, "location");
  const description = str(formData, "description");
  const gradeRaw = str(formData, "grade");
  const benchmarkLabel = str(formData, "benchmarkLabel");
  const benchmarkScore = num(formData, "benchmarkScore");
  const wattageDraw = num(formData, "wattageDraw");
  const bootVerified = formData.get("bootVerified") === "on";

  if (!title || !categoryRaw || !spec || !location || !description || !gradeRaw || !benchmarkLabel) {
    return { error: "Please fill in all required fields." };
  }
  if (!Object.values(Category).includes(categoryRaw as Category)) {
    return { error: "Please choose a valid category." };
  }
  if (gradeRaw !== "A" && gradeRaw !== "B" && gradeRaw !== "C") {
    return { error: "Please choose a valid condition." };
  }
  if ([price, benchmarkScore, wattageDraw].some((n) => Number.isNaN(n))) {
    return { error: "Price, benchmark score, and wattage draw must be numbers." };
  }

  const conditionFiles = formData
    .getAll("photos_condition")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (conditionFiles.length === 0) {
    return { error: "Please attach at least one condition photo." };
  }

  const listingId = randomUUID();
  const uploadTasks: Promise<{ kind: PhotoKind; url: string; path: string }>[] = [];

  for (const { field, kind } of PHOTO_FIELDS) {
    const files = formData.getAll(field).filter((f): f is File => f instanceof File && f.size > 0);
    for (const file of files) {
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
        category: categoryRaw as Category,
        price,
        grade: gradeRaw as Grade,
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
