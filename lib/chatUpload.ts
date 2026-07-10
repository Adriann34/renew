import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { compressImage } from "@/lib/image";

export const MAX_CHAT_UPLOAD_BYTES = 10 * 1024 * 1024; // reject anything larger before compressing
export const CHAT_TARGET_BYTES = 150 * 1024; // compress attachments down to ~150KB
export const CHAT_BUCKET = "chat-attachments"; // PRIVATE bucket — see scripts/setup-chat-bucket.ts

/**
 * Compresses a chat image attachment and uploads it to the PRIVATE `chat-attachments`
 * bucket under a `{conversationId}/` prefix. Uses the admin client to write; the caller
 * is an auth-checked Server Action that has verified conversation membership.
 *
 * Unlike listing photos, chat images must stay private, so this returns the storage
 * *path* (not a public URL). Reads go through /api/chat-attachment/[messageId], which
 * re-checks participation and mints a short-lived signed URL — the object is never
 * publicly reachable.
 */
export async function uploadChatAttachment(
  conversationId: string,
  file: File
): Promise<string> {
  const original = Buffer.from(await file.arrayBuffer());
  const compressed = await compressImage(original, { targetBytes: CHAT_TARGET_BYTES });
  const path = `${conversationId}/${randomUUID()}.webp`;

  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(CHAT_BUCKET)
    .upload(path, compressed, { contentType: "image/webp" });
  if (error) throw error;

  return path;
}
