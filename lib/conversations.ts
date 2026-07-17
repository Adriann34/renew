import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PUBLIC_USER_SELECT } from "@/lib/listings";

// A conversation with everything the inbox list needs: the listing (+ its first
// photo for a thumbnail), both participants, and the most recent message.
// Participants are narrowed to PUBLIC_USER_SELECT — never leak buyer/seller
// email or phone into the client-serialized conversation payload.
export type ConversationSummary = Prisma.ConversationGetPayload<{
  include: {
    listing: { include: { photos: true } };
    buyer: { select: typeof PUBLIC_USER_SELECT };
    seller: { select: typeof PUBLIC_USER_SELECT };
    messages: true;
  };
}>;

// A conversation with its full message history, for the open thread.
export type ConversationWithMessages = Prisma.ConversationGetPayload<{
  include: {
    listing: { include: { photos: true } };
    buyer: { select: typeof PUBLIC_USER_SELECT };
    seller: { select: typeof PUBLIC_USER_SELECT };
    messages: { include: { sender: { select: typeof PUBLIC_USER_SELECT } } };
  };
}>;

/**
 * Returns the existing (listing, buyer) conversation or creates it. The seller is
 * always the listing's owner. Throws if the listing is missing or the buyer is the
 * seller (you can't message yourself).
 */
export async function getOrCreateConversation(listingId: string, buyerId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, sellerId: true },
  });
  if (!listing) throw new Error("Listing not found.");
  if (listing.sellerId === buyerId) throw new Error("You can't message your own listing.");

  return prisma.conversation.upsert({
    where: { listingId_buyerId: { listingId, buyerId } },
    update: {},
    create: { listingId, buyerId, sellerId: listing.sellerId },
  });
}

/** All conversations the user takes part in (as buyer or seller), newest activity first. */
export async function getConversationsForUser(userId: string): Promise<ConversationSummary[]> {
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    include: {
      listing: { include: { photos: true } },
      buyer: { select: PUBLIC_USER_SELECT },
      seller: { select: PUBLIC_USER_SELECT },
      // Just the last message, for the list snippet + unread check.
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  // Sort by real last-message time (falling back to creation) rather than the row's
  // updatedAt — updatedAt auto-bumps on every write, including marking-as-read, which
  // would otherwise reorder the inbox just from opening an old conversation.
  const activity = (c: ConversationSummary) =>
    (c.messages[0]?.createdAt ?? c.createdAt).getTime();
  return conversations.sort((a, b) => activity(b) - activity(a));
}

/** A single conversation with full history, or null if the user isn't a participant. */
export async function getConversationById(
  id: string,
  userId: string
): Promise<ConversationWithMessages | null> {
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      listing: { include: { photos: true } },
      buyer: { select: PUBLIC_USER_SELECT },
      seller: { select: PUBLIC_USER_SELECT },
      messages: {
        include: { sender: { select: PUBLIC_USER_SELECT } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!conversation) return null;
  if (conversation.buyerId !== userId && conversation.sellerId !== userId) return null;
  return conversation;
}

/** True if `userId` has unread messages in this conversation (last message is from the
 * other person and newer than the user's own read marker). */
export function hasUnread(conversation: ConversationSummary, userId: string): boolean {
  const last = conversation.messages[0];
  if (!last || last.senderId === userId) return false;
  const lastRead =
    conversation.buyerId === userId
      ? conversation.buyerLastReadAt
      : conversation.sellerLastReadAt;
  return !lastRead || last.createdAt > lastRead;
}
