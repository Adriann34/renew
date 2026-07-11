import "server-only";
import type { PhotoKind } from "@prisma/client";
import { compressImage } from "@/lib/image";

/** Human labels for each proof-photo kind, used to tell the model what it's looking at. */
export const PHOTO_KIND_LABEL: Record<PhotoKind, string> = {
  CONDITION: "Condition",
  BURN_IN: "Burn-in test",
  BENCHMARK: "Benchmark screenshot",
  BOOT: "Boot / POST screen",
};

/**
 * AI photo-verification for listings.
 *
 * Everything Gemini-specific lives in this module — the endpoint, request shape,
 * and response parsing. The rest of the app talks only to `verifyListingClaims`
 * and the exported types, so swapping providers later means editing this file only.
 *
 * The task: given a seller's claimed diagnostics (grade, benchmark, wattage, boot)
 * and their proof photos, decide whether the photos actually SUPPORT the claims.
 * This turns "verified" from a self-ticked checkbox into an evidence check.
 *
 * It is best-effort by design: if the API key is unset, the request fails, or the
 * response is malformed, this returns `null` and the caller proceeds without a
 * verdict — verification must never block publishing a listing.
 */

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const REQUEST_TIMEOUT_MS = 25_000;

// Keep the request small/fast and well under Gemini's 20MB inline-data ceiling.
const MAX_AI_IMAGES = 6;
const AI_IMAGE_MAX_DIMENSION = 1536; // enough to keep benchmark-screenshot text legible
const AI_IMAGE_TARGET_BYTES = 220 * 1024;

export type AiClaimStatus = "match" | "mismatch" | "not_visible";
export type AiVerificationStatus = "verified" | "flagged" | "insufficient";

export type AiClaimVerdict = {
  field: string;
  claimed: string;
  observed: string;
  status: AiClaimStatus;
  note: string;
};

export type AiVerificationResult = {
  status: AiVerificationStatus;
  summary: string;
  confidence: number; // 0..1
  claims: AiClaimVerdict[];
  model: string;
  checkedAt: string; // ISO timestamp
};

export type ListingClaims = {
  title: string;
  category: string;
  grade: string; // A | B | C
  spec: string;
  description: string;
  benchmarkLabel: string;
  benchmarkScore: number;
  wattageDraw: number;
  bootVerified: boolean;
};

/** A proof photo to send to the model: a human label plus the raw image bytes. */
export type AiImageInput = { label: string; buffer: Buffer };

/** True when verification is configured. Callers can skip prep work if not. */
export function isAiVerificationEnabled(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

const GRADE_MEANING: Record<string, string> = {
  A: "Grade A = excellent, like-new, no meaningful cosmetic wear",
  B: "Grade B = good, light/minor cosmetic wear only",
  C: "Grade C = functional but with visible wear or cosmetic damage",
};

// The response contract we force Gemini to return (proto-JSON schema, uppercase types).
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    status: { type: "STRING", enum: ["verified", "flagged", "insufficient"] },
    summary: { type: "STRING" },
    confidence: { type: "NUMBER" },
    claims: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          field: { type: "STRING" },
          claimed: { type: "STRING" },
          observed: { type: "STRING" },
          status: { type: "STRING", enum: ["match", "mismatch", "not_visible"] },
          note: { type: "STRING" },
        },
        required: ["field", "claimed", "observed", "status", "note"],
      },
    },
  },
  required: ["status", "summary", "confidence", "claims"],
} as const;

function buildPrompt(claims: ListingClaims): string {
  return [
    "You are a diagnostic verifier for a used-PC-hardware marketplace where trust comes from evidence, not seller claims.",
    "You are given a seller's stated condition report and their proof photos. Decide whether the PHOTOS actually SUPPORT each claim.",
    "",
    "Rules:",
    "- Judge ONLY from what is visible in the photos. Do not assume or invent details.",
    "- If a claim cannot be checked from any photo, mark that claim 'not_visible' (this is not a failure — it means no evidence either way).",
    "- Mark 'match' when a photo clearly supports the claim, 'mismatch' when a photo clearly contradicts it (e.g. a benchmark screenshot shows a different score, or a 'Grade A' card has obvious visible damage).",
    "- For the benchmark, read the number/tool from any benchmark screenshot and compare to the claimed score/label (allow small variance).",
    "- For boot: a photo showing a working POST/boot/OS screen supports a 'boot verified' claim.",
    "",
    "Overall status:",
    "- 'verified' = the checkable claims match the evidence and nothing contradicts them.",
    "- 'flagged' = at least one claim is contradicted by a photo.",
    "- 'insufficient' = too little is visible to verify the core claims.",
    "confidence is your 0..1 confidence in the overall status.",
    "",
    "Seller's stated report:",
    `- Title: ${claims.title}`,
    `- Category: ${claims.category}`,
    `- Condition grade: ${claims.grade} (${GRADE_MEANING[claims.grade] ?? "unknown grade"})`,
    `- Key spec: ${claims.spec}`,
    `- Benchmark: claims a score of ${claims.benchmarkScore} on "${claims.benchmarkLabel}"`,
    `- Power draw under load: ${claims.wattageDraw} W`,
    `- Boot verified: ${claims.bootVerified ? "yes" : "no"}`,
    claims.description ? `- Description: ${claims.description}` : "- Description: (none)",
    "",
    "Return one claim entry per checkable field (condition/grade, benchmark, boot, and any other claim a photo speaks to). 'claimed' is the seller's value, 'observed' is what you actually see, 'note' is a one-sentence justification.",
  ].join("\n");
}

async function compressForAi(buffer: Buffer): Promise<{ mimeType: string; data: string }> {
  const compressed = await compressImage(buffer, {
    maxDimension: AI_IMAGE_MAX_DIMENSION,
    targetBytes: AI_IMAGE_TARGET_BYTES,
  });
  return { mimeType: "image/webp", data: compressed.toString("base64") };
}

type GeminiPart =
  | { text: string }
  | { inline_data: { mime_type: string; data: string } };

/**
 * Runs the verification. Returns a structured result, or `null` if verification
 * is unavailable or fails for any reason (missing key, no images, timeout, HTTP
 * error, malformed/blocked response). Never throws.
 */
export async function verifyListingClaims(
  claims: ListingClaims,
  images: AiImageInput[]
): Promise<AiVerificationResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const usable = images.filter((i) => i.buffer.length > 0).slice(0, MAX_AI_IMAGES);
  if (usable.length === 0) return null;

  let parts: GeminiPart[];
  try {
    const imageParts: GeminiPart[] = [];
    for (const img of usable) {
      const { mimeType, data } = await compressForAi(img.buffer);
      imageParts.push({ text: `Proof photo — ${img.label}:` });
      imageParts.push({ inline_data: { mime_type: mimeType, data } });
    }
    parts = [{ text: buildPrompt(claims) }, ...imageParts];
  } catch {
    // Image decode/compress failed — can't verify, so skip gracefully.
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0,
        },
      }),
    });

    if (!res.ok) return null;
    const json = (await res.json()) as unknown;
    const text = extractText(json);
    if (!text) return null;

    const parsed = JSON.parse(text) as unknown;
    return normalizeResult(parsed);
  } catch {
    // Timeout, network error, JSON parse error — all non-fatal.
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// Pull the model's text out of the generateContent response, guarding every hop.
function extractText(json: unknown): string | null {
  if (!json || typeof json !== "object") return null;
  const candidates = (json as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  const content = (candidates[0] as { content?: unknown }).content;
  const parts = (content as { parts?: unknown })?.parts;
  if (!Array.isArray(parts)) return null;
  const text = parts
    .map((p) => (p && typeof p === "object" ? (p as { text?: unknown }).text : undefined))
    .filter((t): t is string => typeof t === "string")
    .join("");
  return text || null;
}

const CLAIM_STATUSES: AiClaimStatus[] = ["match", "mismatch", "not_visible"];
const OVERALL_STATUSES: AiVerificationStatus[] = ["verified", "flagged", "insufficient"];

// Validate + coerce the model's JSON into a known-good shape. Anything off-contract
// makes the whole result null (best-effort — we'd rather show no verdict than a broken one).
function normalizeResult(parsed: unknown): AiVerificationResult | null {
  if (!parsed || typeof parsed !== "object") return null;
  const p = parsed as Record<string, unknown>;

  if (!OVERALL_STATUSES.includes(p.status as AiVerificationStatus)) return null;
  if (typeof p.summary !== "string") return null;
  if (!Array.isArray(p.claims)) return null;

  const confidence =
    typeof p.confidence === "number" && Number.isFinite(p.confidence)
      ? Math.min(1, Math.max(0, p.confidence))
      : 0;

  const claims: AiClaimVerdict[] = [];
  for (const raw of p.claims) {
    if (!raw || typeof raw !== "object") continue;
    const c = raw as Record<string, unknown>;
    if (!CLAIM_STATUSES.includes(c.status as AiClaimStatus)) continue;
    claims.push({
      field: String(c.field ?? ""),
      claimed: String(c.claimed ?? ""),
      observed: String(c.observed ?? ""),
      status: c.status as AiClaimStatus,
      note: String(c.note ?? ""),
    });
  }
  if (claims.length === 0) return null;

  return {
    status: p.status as AiVerificationStatus,
    summary: p.summary,
    confidence,
    claims,
    model: GEMINI_MODEL,
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Safely parse the `aiVerdict` JSON column (Prisma `JsonValue`) back into a typed
 * result for rendering. Returns null if the column is empty or doesn't match the
 * expected shape (e.g. written by an older version).
 */
export function parseAiVerdict(value: unknown): AiVerificationResult | null {
  const base = normalizeResult(value);
  if (!base) return null;
  const v = value as Record<string, unknown>;
  return {
    ...base,
    model: typeof v.model === "string" ? v.model : base.model,
    checkedAt: typeof v.checkedAt === "string" ? v.checkedAt : base.checkedAt,
  };
}
