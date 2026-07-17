"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateConversation } from "@/lib/conversations";
import {
  uploadChatAttachment,
  MAX_CHAT_UPLOAD_BYTES,
} from "@/lib/chatUpload";
import { ALLOWED_PHOTO_TYPES } from "@/lib/photoUpload";
import { enforceUploadBudget } from "@/lib/rateLimit";

const MAX_MESSAGE_LEN = 4000;

export type StartConversationResult = { id: string } | { error: string };

/**
 * Opens (or reuses) the conversation between the signed-in buyer and a listing's
 * seller. Auth and the "can't message your own listing" rule are enforced here on
 * the server. The caller routes to /messages/[id] with the returned id.
 */
export async function startConversationAction(
  listingId: string
): Promise<StartConversationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthenticated" };

  // The buyer may not have a User row yet (created lazily) — the conversation's
  // FK needs it, same as toggleSaveAction does when saving a listing.
  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email!,
      name: (user.user_metadata?.name as string | undefined) ?? null,
    },
  });

  try {
    const conversation = await getOrCreateConversation(listingId, user.id);
    revalidatePath("/messages");
    return { id: conversation.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to start conversation." };
  }
}

export type SendMessageResult =
  | { message: { id: string; senderId: string; body: string; attachmentUrl: string | null; createdAt: Date } }
  | { error: string };

/**
 * Sends a text and/or image message into a conversation. Verifies the sender is a
 * participant, validates the optional attachment, bumps the conversation's activity
 * time, and marks it read for the sender. Receivers get the row live via Realtime.
 */
export async function sendMessageAction(
  conversationId: string,
  formData: FormData
): Promise<SendMessageResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, buyerId: true, sellerId: true },
  });
  if (!conversation) return { error: "Conversation not found." };
  const isParticipant =
    conversation.buyerId === user.id || conversation.sellerId === user.id;
  if (!isParticipant) return { error: "You are not part of this conversation." };

  const body = String(formData.get("body") ?? "").trim();
  if (body.length > MAX_MESSAGE_LEN) {
    return { error: `Messages must be under ${MAX_MESSAGE_LEN} characters.` };
  }

  const file = formData.get("attachment");
  const hasAttachment = file instanceof File && file.size > 0;

  if (!body && !hasAttachment) {
    return { error: "Message can't be empty." };
  }

  let attachmentUrl: string | null = null;
  if (hasAttachment) {
    // Throttle attachment uploads/sharp CPU per user (fails closed on DB error).
    // Text-only messages aren't gated here — they're cheap DB writes.
    if (await enforceUploadBudget(user.id)) {
      return { error: "You're sending attachments too quickly. Please wait a moment." };
    }
    if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
      return { error: "Attachment must be a JPEG, PNG, WebP, or HEIC image." };
    }
    if (file.size > MAX_CHAT_UPLOAD_BYTES) {
      return { error: `Attachments must be under ${MAX_CHAT_UPLOAD_BYTES / (1024 * 1024)}MB.` };
    }
    try {
      attachmentUrl = await uploadChatAttachment(conversationId, file);
    } catch {
      return { error: "Failed to upload the attachment. Please try again." };
    }
  }

  const readField = conversation.buyerId === user.id ? "buyerLastReadAt" : "sellerLastReadAt";

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId, senderId: user.id, body, attachmentUrl },
      select: { id: true, senderId: true, body: true, attachmentUrl: true, createdAt: true },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date(), [readField]: new Date() },
    }),
  ]);

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
  return { message };
}

/** Marks the conversation read for the signed-in participant (clears the unread dot). */
export async function markReadAction(conversationId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { buyerId: true, sellerId: true },
  });
  if (!conversation) return;

  const readField =
    conversation.buyerId === user.id
      ? "buyerLastReadAt"
      : conversation.sellerId === user.id
        ? "sellerLastReadAt"
        : null;
  if (!readField) return;

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { [readField]: new Date() },
  });
  revalidatePath("/messages");
}
