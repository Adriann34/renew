"use client";

import { useCurrency } from "@/components/CurrencyProvider";
import { CURRENCIES } from "@/lib/currency";

/**
 * Navbar control for the currency prices are shown in — mirrors ThemeToggle. The
 * choice takes effect immediately (context), persists to a cookie so SSR stays in
 * sync, and saves to the account when signed in (handled in the provider).
 */
export function CurrencySwitcher() {
  const { displayCurrency, setDisplayCurrency } = useCurrency();

  return (
    <div className="relative flex items-center">
      <select
        aria-label="Display currency"
        value={displayCurrency}
        onChange={(e) => setDisplayCurrency(e.target.value)}
        className="appearance-none bg-transparent text-ink-dim hover:text-ink transition-colors text-[13px] font-mono pl-1.5 pr-4 h-8 cursor-pointer outline-none"
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 pointer-events-none text-ink-dim"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}
