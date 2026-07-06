import { randomUUID } from "node:crypto";
import type { PhotoKind } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { compressImage } from "@/lib/image";

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const MAX_PHOTOS_PER_LISTING = 20;
export const ALLOWED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export async function uploadPhoto(
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

/** Extracts the Supabase Storage object path from a public listing-photo URL, or null for seed/demo photos that live in /public. */
export function storagePathFromUrl(url: string): string | null {
  const marker = "/listing-photos/";
  const i = url.indexOf(marker);
  return i === -1 ? null : url.slice(i + marker.length);
}
