/**
 * Shared support-chat constants and types — safe to import from BOTH client and
 * server. (lib/aiSupport.ts is server-only because it holds the Gemini call; the
 * client widget needs these caps too, so they live here to avoid dragging
 * server-only code into the client bundle.)
 */

/** Caps that keep a single turn cheap and bounded (enforced in the route). */
export const MAX_SUPPORT_MESSAGE_CHARS = 2_000;
export const MAX_SUPPORT_HISTORY = 20;

export type SupportRole = "user" | "assistant";
export type SupportMessage = { role: SupportRole; content: string };
