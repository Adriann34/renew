import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupportChatEnabled, streamSupportAnswer } from "@/lib/aiSupport";
import { enforceAiBudget, clientIpFromHeaders } from "@/lib/rateLimit";
import {
  MAX_SUPPORT_HISTORY,
  MAX_SUPPORT_MESSAGE_CHARS,
  type SupportMessage,
} from "@/lib/supportChat";

// Uses the Node runtime: pulls in the Supabase server client and the server-only
// aiSupport module.
export const runtime = "nodejs";

/**
 * Streams a support-bot reply as plain text. Auth is enforced here — only
 * signed-in users may chat (per product requirement), and we never trust the
 * client to have gated itself.
 */
export async function POST(req: NextRequest): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("You must be signed in to chat with support.", { status: 401 });
  }

  if (!isSupportChatEnabled()) {
    return new Response("Support chat is unavailable right now.", { status: 503 });
  }

  // Cost/abuse control: cap AI calls per-user, per-IP, and globally (daily kill
  // switch). Fails closed — a signed-in account is not a licence to spam Gemini.
  const budget = await enforceAiBudget(user.id, clientIpFromHeaders(req.headers));
  if (budget) {
    return new Response("You're sending messages too fast. Please try again shortly.", {
      status: 429,
      headers: { "Retry-After": String(budget.retryAfterSec) },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid request body.", { status: 400 });
  }

  const rawMessages = (body as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(rawMessages)) {
    return new Response("Invalid request: expected a messages array.", { status: 400 });
  }

  // Sanitize: keep only well-formed, non-empty turns; clamp each message length.
  const messages: SupportMessage[] = [];
  for (const m of rawMessages) {
    if (!m || typeof m !== "object") continue;
    const role = (m as { role?: unknown }).role;
    const content = (m as { content?: unknown }).content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") continue;
    const trimmed = content.trim();
    if (!trimmed) continue;
    messages.push({ role, content: trimmed.slice(0, MAX_SUPPORT_MESSAGE_CHARS) });
  }

  // Only the most recent turns are sent to the model, and the latest must be a
  // user question (otherwise there's nothing to answer).
  const history = messages.slice(-MAX_SUPPORT_HISTORY);
  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return new Response("Invalid request: the last message must be from the user.", {
      status: 400,
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let emitted = false;
      try {
        for await (const chunk of streamSupportAnswer(history, req.signal)) {
          emitted = true;
          controller.enqueue(encoder.encode(chunk));
        }
        if (!emitted) {
          controller.enqueue(
            encoder.encode(
              "Sorry — I couldn't generate a response just now. Please try again, or message the seller directly for item-specific questions."
            )
          );
        }
      } catch {
        if (!emitted) {
          controller.enqueue(
            encoder.encode("Sorry — something went wrong on my end. Please try again in a moment.")
          );
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
