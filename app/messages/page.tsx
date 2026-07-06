import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { MessagesShell } from "@/components/messages/MessagesShell";
import { getConversationsForUser } from "@/lib/conversations";
import { createClient } from "@/lib/supabase/server";

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin?next=/messages");

  const conversations = await getConversationsForUser(user.id);

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
        <MessagesShell conversations={conversations} currentUserId={user.id}>
          <div className="flex-1 flex items-center justify-center p-10 text-center">
            <p className="text-[13px] text-ink-dim">
              Select a conversation to start chatting.
            </p>
          </div>
        </MessagesShell>
      </div>
    </div>
  );
}
