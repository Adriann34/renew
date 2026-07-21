import { CURRENCY_CODES } from "@/lib/currency";

// Approximate FX rates for showing buyers a price in their own currency. The
// seller's listed price is always the source of truth; anything derived from these
// rates is explicitly labelled as an approximation in the UI. Rates come from
// Frankfurter (ECB reference data — free, no API key, no npm dependency) and are
// only daily-fresh, so caching hard is fine.

/** Units of each currency per 1 USD. Always includes `USD: 1`. */
export type Rates = Record<string, number>;

const RATES_URL = "https://api.frankfurter.dev/v1/latest";
const CACHE_SECONDS = 60 * 60 * 12; // 12h — rates only move daily

/**
 * Fetch current rates (per 1 USD) for every supported currency. Returns `null` on
 * any failure — callers MUST treat null as "conversion unavailable" and fall back
 * to showing the real price only. We never invent a rate: a wrong conversion is
 * worse for trust than no conversion.
 */
export async function getRates(): Promise<Rates | null> {
  try {
    const symbols = CURRENCY_CODES.filter((c) => c !== "USD").join(",");
    const res = await fetch(`${RATES_URL}?base=USD&symbols=${symbols}`, {
      next: { revalidate: CACHE_SECONDS },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { rates?: Record<string, number> };
    if (!data.rates || typeof data.rates !== "object") return null;
    return { USD: 1, ...data.rates };
  } catch {
    return null;
  }
}

/**
 * Convert a whole-unit amount between currencies via a USD pivot, rounded to whole
 * units of the target. Returns `null` if either rate is missing (caller falls back
 * to the real price). Same-currency conversions short-circuit and never fail.
 */
export function convert(
  amount: number,
  from: string,
  to: string,
  rates: Rates | null
): number | null {
  if (from === to) return amount;
  if (!rates) return null;
  const fromRate = from === "USD" ? 1 : rates[from];
  const toRate = to === "USD" ? 1 : rates[to];
  if (!fromRate || !toRate) return null;
  return Math.round((amount / fromRate) * toRate);
}
