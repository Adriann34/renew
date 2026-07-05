"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Category, type Grade, type PhotoKind } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { compressImage } from "@/lib/image";
import { categoryDiagnosticTier } from "@/lib/category";

export type CreateListingState = { error: string | null };

const PHOTO_FIELDS: { field: string; kind: PhotoKind }[] = [
  { field: "photos_condition", kind: "CONDITION" },
  { field: "photos_burn_in", kind: "BURN_IN" },
  { field: "photos_benchmark", kind: "BENCHMARK" },
  { field: "photos_boot", kind: "BOOT" },
];

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const MAX_PHOTOS_PER_LISTING = 20;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

const MAX_TITLE_LEN = 120;
const MAX_SPEC_LEN = 120;
const MAX_LOCATION_LEN = 120;
const MAX_DESCRIPTION_LEN = 2000;
const MAX_BENCHMARK_LABEL_LEN = 60;
const MAX_PRICE = 1_000_000;
const MAX_WATTAGE = 5000;
const MAX_BENCHMARK_SCORE = 10_000_000;

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
  const bootVerified = formData.get("bootVerified") === "on";

  if (!title || !categoryRaw || !spec || !location || !description || !gradeRaw) {
    return { error: "Please fill in all required fields." };
  }
  if (!Object.values(Category).includes(categoryRaw as Category)) {
    return { error: "Please choose a valid category." };
  }
  if (gradeRaw !== "A" && gradeRaw !== "B" && gradeRaw !== "C") {
    return { error: "Please choose a valid condition." };
  }

  // Which diagnostic fields this category's form actually collects — kept in
  // sync with CreateListingForm, which only renders the matching inputs.
  const tier = categoryDiagnosticTier[categoryRaw as Category];
  const hasBenchmark = tier === "full";
  const hasWattage = tier === "full" || tier === "wattage-boot";

  const benchmarkLabel = hasBenchmark ? str(formData, "benchmarkLabel") : "";
  const benchmarkScore = hasBenchmark ? num(formData, "benchmarkScore") : 0;
  const wattageDraw = hasWattage ? num(formData, "wattageDraw") : 0;

  if (hasBenchmark && !benchmarkLabel) {
    return { error: "Please fill in all required fields." };
  }
  if (Number.isNaN(price) || (hasBenchmark && Number.isNaN(benchmarkScore)) || (hasWattage && Number.isNaN(wattageDraw))) {
    return { error: "Price, benchmark score, and wattage draw must be numbers." };
  }
  if (price < 0 || price > MAX_PRICE) {
    return { error: `Price must be between 0 and ${MAX_PRICE.toLocaleString()}.` };
  }
  if (hasWattage && (wattageDraw < 0 || wattageDraw > MAX_WATTAGE)) {
    return { error: `Wattage draw must be between 0 and ${MAX_WATTAGE}.` };
  }
  if (hasBenchmark && (benchmarkScore < 0 || benchmarkScore > MAX_BENCHMARK_SCORE)) {
    return { error: "Benchmark score is out of range." };
  }
  if (
    title.length > MAX_TITLE_LEN ||
    spec.length > MAX_SPEC_LEN ||
    location.length > MAX_LOCATION_LEN ||
    description.length > MAX_DESCRIPTION_LEN ||
    benchmarkLabel.length > MAX_BENCHMARK_LABEL_LEN
  ) {
    return { error: "One or more fields exceed their maximum length." };
  }

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
