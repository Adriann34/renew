import "server-only";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Postgres-backed fixed-window rate limiting + usage caps.
 *
 * Why Postgres and not in-memory: Vercel runs many short-lived, isolated function
 * instances, so an in-process counter resets constantly and never sees the real
 * request rate — it's no limit at all. A shared row in the DB is counted the same
 * across every instance. This is the app's only defense against a single free
 * signup spamming Gemini + `sharp` without bound.
 *
 * Fail policy: cost-bearing paths (AI, uploads) pass `failClosed: true` so a
 * transient DB error DENIES rather than silently letting abuse through the money
 * path. Cheap paths (city autocomplete) fail open so a DB blip doesn't break a
 * harmless feature.
 */

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  /** Seconds until the current window resets — for a Retry-After header. */
  retryAfterSec: number;
};

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// ── Tunable limits ──────────────────────────────────────────────────────────
// These are deliberately conservative for a free-tier hobby project: generous
// enough for real use, low enough that abuse hits a wall fast. Adjust freely.
export const LIMITS = {
  // Global kill switch: total AI calls across ALL users per day. When this trips,
  // every AI feature stops until midnight UTC — the "just stop working" backstop.
  aiGlobalPerDay: 500,
  // Per authenticated user.
  aiUserPerHour: 15,
  aiUserPerDay: 50,
  // Per client IP (blunts one attacker cycling through throwaway accounts).
  aiIpPerHour: 30,
  // Uploads / sharp CPU (listing create + chat attachments), per user.
  uploadUserPerHour: 30,
  // Total NEW listings a single user can create per day. Bounds DB growth so one
  // account can't flood the table with thousands of rows to bloat/break the DB.
  // Sits under the hourly upload throttle, which blunts bursts.
  listingCreatePerDay: 25,
  // Public city autocomplete, per IP.
  citiesIpPerMinute: 60,
} as const;

/**
 * Increments the counter for `key` in the current `windowMs` window and reports
 * whether the caller is still within `limit`. The bucket is a single
 * (key, windowStart) row incremented atomically via upsert, so concurrent
 * instances share one count.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  opts: { failClosed?: boolean } = {}
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / windowMs) * windowMs);
  const retryAfterSec = Math.ceil((windowStart.getTime() + windowMs - now) / 1000);

  try {
    const row = await prisma.rateLimit.upsert({
      where: { key_windowStart: { key, windowStart } },
      create: { key, windowStart, count: 1 },
      update: { count: { increment: 1 } },
      select: { count: true },
    });
    const allowed = row.count <= limit;
    return { allowed, remaining: Math.max(0, limit - row.count), retryAfterSec };
  } catch {
    // DB unreachable: deny on cost paths, allow on cheap ones.
    return { allowed: !opts.failClosed, remaining: 0, retryAfterSec };
  }
}

/** Best-effort client IP from proxy headers (Vercel populates x-forwarded-for). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return h.get("x-real-ip")?.trim() || "unknown";
}

export function clientIpFromHeaders(h: Headers): string {
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return h.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Enforces the full AI budget for one call: global daily kill switch, then
 * per-user (hour + day), then per-IP (hour). Returns `null` when the call may
 * proceed, or the first failing result (with a retry hint) when it must be
 * blocked. All checks fail closed. Order matters — the global cap is checked
 * first so a hard stop can't be starved by per-user checks.
 */
export async function enforceAiBudget(
  userId: string,
  ip: string
): Promise<RateLimitResult | null> {
  const checks: Promise<RateLimitResult>[] = [
    rateLimit("ai:global", LIMITS.aiGlobalPerDay, DAY, { failClosed: true }),
    rateLimit(`ai:user:${userId}:h`, LIMITS.aiUserPerHour, HOUR, { failClosed: true }),
    rateLimit(`ai:user:${userId}:d`, LIMITS.aiUserPerDay, DAY, { failClosed: true }),
    rateLimit(`ai:ip:${ip}`, LIMITS.aiIpPerHour, HOUR, { failClosed: true }),
  ];
  // Run all so every window is counted, then report the first breach.
  const results = await Promise.all(checks);
  return results.find((r) => !r.allowed) ?? null;
}

/** Per-user upload/sharp throttle. Returns the failing result, or null if allowed. */
export async function enforceUploadBudget(userId: string): Promise<RateLimitResult | null> {
  const r = await rateLimit(`upload:user:${userId}`, LIMITS.uploadUserPerHour, HOUR, {
    failClosed: true,
  });
  return r.allowed ? null : r;
}

/**
 * Per-user daily cap on NEW listings. Bounds how fast one account can grow the
 * listings table (anti-flood / DB-bloat protection). Returns the failing result,
 * or null if allowed. Fails closed.
 */
export async function enforceListingCreateBudget(
  userId: string
): Promise<RateLimitResult | null> {
  const r = await rateLimit(
    `listing:create:${userId}`,
    LIMITS.listingCreatePerDay,
    DAY,
    { failClosed: true }
  );
  return r.allowed ? null : r;
}

export { MINUTE, HOUR, DAY };
