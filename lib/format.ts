import { getCurrencyMeta } from "@/lib/currency";

/**
 * Format a whole-unit amount as currency, e.g. formatMoney(12000, "PHP") → "₱12,000".
 * Uses the currency's home locale so symbols/grouping render idiomatically and
 * identically on server and client (no hydration drift). Whole units only — we
 * never show minor-unit decimals.
 */
export function formatMoney(amount: number, currency: string = "USD"): string {
  const meta = getCurrencyMeta(currency);
  try {
    return new Intl.NumberFormat(meta.locale, {
      style: "currency",
      currency: meta.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Intl can throw on an unexpected currency code — degrade rather than crash.
    return `${meta.symbol}${amount.toLocaleString()}`;
  }
}

/** A converted figure, prefixed to signal it's an estimate, e.g. "≈ $215". */
export function formatApprox(amount: number, currency: string): string {
  return `≈ ${formatMoney(amount, currency)}`;
}

/**
 * Back-compat USD shim. Prefer <Price> (currency-aware, with conversion) or
 * formatMoney(amount, currency) for anything tied to a real listing.
 */
export function formatPrice(price: number): string {
  return formatMoney(price, "USD");
}
