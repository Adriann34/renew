import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { CHAT_BUCKET } from "@/lib/chatUpload";

const SIGNED_URL_TTL_SECONDS = 60;

/**
 * Serves a chat image attachment, re-checking authorization on every request.
 *
 * The stored `attachmentUrl` is a path into the PRIVATE chat-attachments bucket, so it
 * is never publicly reachable. We verify the signed-in user is a participant of the
 * message's conversation, then 302-redirect to a short-lived signed URL. This mirrors,
 * at the object layer, the participant-only RLS that already scopes the message rows.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const { messageId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: {
      attachmentUrl: true,
      conversation: { select: { buyerId: true, sellerId: true } },
    },
  });

  // 404 for missing, non-participant, or attachment-less — never leak which case it is.
  if (!message || !message.attachmentUrl) return new Response("Not found", { status: 404 });
  const { buyerId, sellerId } = message.conversation;
  if (user.id !== buyerId && user.id !== sellerId) {
    return new Response("Not found", { status: 404 });
  }

  // Back-compat: any rows written before the private-bucket switch hold a full public
  // URL, not a path — redirect straight to it so old messages don't 500.
  if (/^https?:\/\//.test(message.attachmentUrl)) {
    return redirectNoStore(message.attachmentUrl);
  }

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(CHAT_BUCKET)
    .createSignedUrl(message.attachmentUrl, SIGNED_URL_TTL_SECONDS);
  if (error || !data) return new Response("Not found", { status: 404 });

  return redirectNoStore(data.signedUrl);
}

// A 302 the browser won't cache — the signed URL expires, so the redirect must not
// be reused past its TTL.
function redirectNoStore(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: location, "Cache-Control": "no-store" },
  });
}
