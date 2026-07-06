import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { compressImage } from "@/lib/image";

export const MAX_CHAT_UPLOAD_BYTES = 10 * 1024 * 1024; // reject anything larger before compressing
export const CHAT_TARGET_BYTES = 150 * 1024; // compress attachments down to ~150KB

/**
 * Compresses a chat image attachment and uploads it to the shared `listing-photos`
 * bucket under a `chat/{conversationId}/` prefix. Uses the admin client to bypass the
 * bucket's listing-scoped RLS (same pattern as avatar uploads in app/account/actions.ts);
 * safe here because the caller is an auth-checked Server Action and the conversation
 * membership is verified before calling this.
 */
export async function uploadChatAttachment(
  conversationId: string,
  file: File
): Promise<string> {
  const original = Buffer.from(await file.arrayBuffer());
  const compressed = await compressImage(original, { targetBytes: CHAT_TARGET_BYTES });
  const path = `chat/${conversationId}/${randomUUID()}.webp`;

  const admin = createAdminClient();
  const { error } = await admin.storage
    .from("listing-photos")
    .upload(path, compressed, { contentType: "image/webp" });
  if (error) throw error;

  const { data } = admin.storage.from("listing-photos").getPublicUrl(path);
  return data.publicUrl;
}
