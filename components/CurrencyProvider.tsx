"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CURRENCY_COOKIE, DEFAULT_CURRENCY } from "@/lib/currency";
import { convert, type Rates } from "@/lib/exchangeRates";
import { savePreferredCurrencyAction } from "@/app/account/actions";

type CurrencyContextValue = {
  /** Currency the viewer wants prices shown in. */
  displayCurrency: string;
  /** USD-based rate map, or null when the rate fetch failed (conversion unavailable). */
  rates: Rates | null;
  /** Convert an amount from `currency` into the display currency; null if not possible. */
  toDisplay: (amount: number, currency: string) => number | null;
  /** Change the display currency: updates live, persists to a cookie, and (if signed in) to the account. */
  setDisplayCurrency: (code: string) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  initialDisplayCurrency,
  rates,
  canPersist,
  children,
}: {
  initialDisplayCurrency: string;
  rates: Rates | null;
  /** True when a user is signed in, so the choice can be saved to their account. */
  canPersist: boolean;
  children: React.ReactNode;
}) {
  // Client-authoritative after mount: seeded once from the server-resolved value,
  // then only the user's own choice (setDisplayCurrency) changes it. We deliberately
  // do NOT re-sync to `initialDisplayCurrency` on prop changes — an unrelated action
  // that revalidates the layout would otherwise clobber the currency the user just
  // picked (e.g. back to USD when the geo header is absent, as on localhost).
  const [displayCurrency, setCurrency] = useState(initialDisplayCurrency);

  const setDisplayCurrency = useCallback(
    (code: string) => {
      setCurrency(code);
      if (canPersist) {
        // Signed in: the account (DB) is the source of truth, read on every render
        // and shared across devices. Fire-and-forget — the UI already updated.
        void savePreferredCurrencyAction(code);
      } else {
        // Anonymous: no DB row, so remember the choice per-device via a cookie the
        // server reads on the next render (1yr).
        document.cookie = `${CURRENCY_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
      }
    },
    [canPersist]
  );

  const value = useMemo<CurrencyContextValue>(
    () => ({
      displayCurrency,
      rates,
      toDisplay: (amount, currency) => convert(amount, currency, displayCurrency, rates),
      setDisplayCurrency,
    }),
    [displayCurrency, rates, setDisplayCurrency]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (ctx) return ctx;
  // Safe fallback if a price ever renders outside the provider: show real prices
  // only (no conversion), never crash.
  return {
    displayCurrency: DEFAULT_CURRENCY,
    rates: null,
    toDisplay: (amount, currency) => (currency === DEFAULT_CURRENCY ? amount : null),
    setDisplayCurrency: () => {},
  };
}
