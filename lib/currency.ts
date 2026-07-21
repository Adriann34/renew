// Single source of truth for the currencies Renew supports. Used by the seller's
// price input, the viewer's currency switcher, listing validation, price
// formatting, and the exchange-rate fetch. Every code here must be one that our
// rate provider (Frankfurter / ECB) publishes — see lib/exchangeRates.ts.
//
// `locale` is the locale we format this currency IN, so symbols/grouping render
// idiomatically (₱, €, ¥, kr) and — crucially — identically on the server and the
// client regardless of the viewer's browser locale, which avoids hydration
// mismatches. We always show whole units (no minor-unit/decimal handling) because
// prices are stored as whole major units.

export type CurrencyMeta = {
  code: string; // ISO 4217
  symbol: string; // short symbol for inputs/switcher labels
  name: string;
  locale: string; // locale used for Intl currency formatting
};

export const DEFAULT_CURRENCY = "USD";

// Curated list — broad international coverage without an unusably long dropdown.
// All are in the ECB/Frankfurter set.
export const CURRENCIES: CurrencyMeta[] = [
  { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US" },
  { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE" },
  { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", locale: "en-PH" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", locale: "ja-JP" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "en-IN" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", locale: "en-AU" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", locale: "en-CA" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", locale: "en-SG" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", locale: "ms-MY" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", locale: "zh-CN" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", locale: "en-HK" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", locale: "ko-KR" },
  { code: "THB", symbol: "฿", name: "Thai Baht", locale: "th-TH" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", locale: "id-ID" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", locale: "en-NZ" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", locale: "de-CH" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", locale: "sv-SE" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", locale: "nb-NO" },
  { code: "DKK", symbol: "kr", name: "Danish Krone", locale: "da-DK" },
  { code: "PLN", symbol: "zł", name: "Polish Złoty", locale: "pl-PL" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", locale: "pt-BR" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso", locale: "es-MX" },
  { code: "ZAR", symbol: "R", name: "South African Rand", locale: "en-ZA" },
];

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code);

const BY_CODE = new Map(CURRENCIES.map((c) => [c.code, c]));

export function isSupportedCurrency(code: string | null | undefined): code is string {
  return !!code && BY_CODE.has(code);
}

/** Metadata for a code, falling back to USD so formatting never throws on bad data. */
export function getCurrencyMeta(code: string | null | undefined): CurrencyMeta {
  return (code && BY_CODE.get(code)) || BY_CODE.get(DEFAULT_CURRENCY)!;
}

// Country (ISO 3166-1 alpha-2) → currency, used to auto-detect a viewer's display
// currency from their geolocated country. Only regions whose currency we support
// are listed; anything else falls through to USD. Eurozone members all map to EUR.
const REGION_CURRENCY: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  PH: "PHP",
  JP: "JPY",
  IN: "INR",
  AU: "AUD",
  CA: "CAD",
  SG: "SGD",
  MY: "MYR",
  CN: "CNY",
  HK: "HKD",
  KR: "KRW",
  TH: "THB",
  ID: "IDR",
  NZ: "NZD",
  CH: "CHF",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  PL: "PLN",
  BR: "BRL",
  MX: "MXN",
  ZA: "ZAR",
  // Eurozone
  DE: "EUR", FR: "EUR", ES: "EUR", IT: "EUR", NL: "EUR", BE: "EUR",
  AT: "EUR", PT: "EUR", IE: "EUR", FI: "EUR", GR: "EUR", SK: "EUR",
  SI: "EUR", LT: "EUR", LV: "EUR", EE: "EUR", LU: "EUR", CY: "EUR",
  MT: "EUR", HR: "EUR",
};

/**
 * Auto-detect a display currency from an ISO 3166-1 alpha-2 country code (e.g. the
 * `x-vercel-ip-country` geo header). Falls back to USD for unknown/unsupported
 * countries or a missing code. We deliberately use physical location rather than
 * the browser's Accept-Language: most users leave their OS in English regardless of
 * where they are, so language would collapse almost everyone to USD.
 */
export function currencyFromCountry(country: string | null | undefined): string {
  if (!country) return DEFAULT_CURRENCY;
  return REGION_CURRENCY[country.toUpperCase()] ?? DEFAULT_CURRENCY;
}

/**
 * Resolve the currency a viewer should SEE prices in. Precedence:
 *   1. explicit cookie choice (navbar switcher / saved setting) — most specific
 *   2. their saved account preference — overrides geo auto-detect
 *   3. geolocation auto-detect (country → currency)
 *   4. USD
 * Invalid/unsupported values at any level are skipped.
 */
export function resolveDisplayCurrency({
  cookie,
  preferred,
  country,
}: {
  cookie?: string | null;
  preferred?: string | null;
  country?: string | null;
}): string {
  if (isSupportedCurrency(cookie)) return cookie;
  if (isSupportedCurrency(preferred)) return preferred;
  return currencyFromCountry(country);
}

export const CURRENCY_COOKIE = "renew-currency";
