import { notFound, redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { MessagesShell } from "@/components/messages/MessagesShell";
import { ChatThread, type ChatMessage } from "@/components/messages/ChatThread";
import { ContextPanel } from "@/components/messages/ContextPanel";
import { getConversationsForUser, getConversationById } from "@/lib/conversations";
import { createClient } from "@/lib/supabase/server";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/signin?next=/messages/${id}`);

  const [conversations, active] = await Promise.all([
    getConversationsForUser(user.id),
    getConversationById(id, user.id),
  ]);
  // null when the conversation doesn't exist or the user isn't a participant —
  // don't leak which case it is.
  if (!active) notFound();

  const other = active.buyerId === user.id ? active.seller : active.buyer;
  const otherName = other.name ?? other.email;
  const thumbnailUrl =
    active.listing.photos.find((p) => p.kind === "CONDITION")?.url ??
    active.listing.photos[0]?.url ??
    null;

  const initialMessages: ChatMessage[] = active.messages.map((m) => ({
    id: m.id,
    senderId: m.senderId,
    body: m.body,
    attachmentUrl: m.attachmentUrl,
    createdAt: m.createdAt,
  }));

  return (
    <div className="h-screen flex flex-col">
      <Navbar />

      <div className="shrink-0 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber mb-1">
          Messages
        </p>
        <h1 className="font-display font-semibold text-2xl">Messages</h1>
      </div>

      <div className="flex-1 min-h-0 max-w-7xl w-full mx-auto px-4 sm:px-6 pb-4 flex">
        <MessagesShell conversations={conversations} currentUserId={user.id} activeId={id}>
          <div className="flex-1 flex min-w-0">
            <ChatThread
              conversationId={active.id}
              currentUserId={user.id}
              other={{ name: otherName, avatarUrl: other.avatarUrl }}
              listing={{
                id: active.listing.id,
                title: active.listing.title,
                price: active.listing.price,
                category: active.listing.category,
                spec: active.listing.spec,
              }}
              initialMessages={initialMessages}
            />
            <ContextPanel
              listingId={active.listing.id}
              title={active.listing.title}
              price={active.listing.price}
              category={active.listing.category}
              spec={active.listing.spec}
              thumbnailUrl={thumbnailUrl}
            />
          </div>
        </MessagesShell>
      </div>
    </div>
  );
}
