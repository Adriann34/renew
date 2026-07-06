// Shared photo-upload limits. This module is intentionally dependency-free so
// it can be imported from BOTH client components (the upload UI) and server
// code (the Server Action checks) — keep it that way (no server-only imports).

// Per-photo cap. Anything larger is rejected in the UI before it's ever added.
// Note this is NOT a storage limit: every photo is re-compressed to ~200KB
// server-side (lib/image.ts) before being stored, regardless of input size.
// This cap only bounds upload bandwidth and keeps any single file well under
// the Server Action body limit below.
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10MB

// Total across ALL photos in one create/edit submission. Next sends every photo
// in a single multipart body and caps that body at 15MB
// (serverActions.bodySizeLimit in next.config.ts); exceeding it throws an
// unhandled "Body exceeded" error. We gate the combined size on the client a
// bit under 15MB, so the request can never be built large enough to hit it.
export const MAX_TOTAL_UPLOAD_BYTES = 14 * 1024 * 1024; // 14MB

export const MAX_PHOTOS_PER_LISTING = 20;

export const ALLOWED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

// Extension fallback: some browsers report an empty or non-standard MIME type
// for HEIC/HEIF, so we accept a file whose extension is allowed even when its
// reported type isn't — this avoids falsely rejecting valid iPhone photos.
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif"]);

export function isAllowedPhoto(file: File): boolean {
  if (ALLOWED_PHOTO_TYPES.has(file.type)) return true;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED_EXTENSIONS.has(ext);
}

/** Human-readable size, e.g. "10MB" or "12.3MB". */
export function formatMb(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${Number.isInteger(mb) ? mb : mb.toFixed(1)}MB`;
}
