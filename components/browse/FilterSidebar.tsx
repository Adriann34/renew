"use client";

import type { Grade } from "@prisma/client";
import { gradeLabel, gradeDot } from "@/lib/grade";

const GRADES: Grade[] = ["A", "B", "C"];

const PRICE_CHIPS = [
  { label: "Under $150", min: 0, max: 150 },
  { label: "$150–500", min: 150, max: 500 },
  { label: "$500–1,500", min: 500, max: 1500 },
  { label: "$1,500+", min: 1500, max: Infinity },
];

const MIN_WATT = 50;
const MAX_WATT = 500;

export type FilterState = {
  grades: Grade[];
  countries: string[];
  priceMin: number | null;
  priceMax: number | null;
  maxWatt: number;
  verifiedOnly: boolean;
};

export function FilterSidebar({
  gradeCounts,
  countryCounts,
  grades,
  countries,
  priceMin,
  priceMax,
  maxWatt,
  verifiedOnly,
  onToggleGrade,
  onToggleCountry,
  onPriceMinChange,
  onPriceMaxChange,
  onMaxWattChange,
  onToggleVerified,
  onClearAll,
}: {
  gradeCounts: Partial<Record<Grade, number>>;
  countryCounts: { country: string; count: number }[];
  grades: Grade[];
  countries: string[];
  priceMin: number | null;
  priceMax: number | null;
  maxWatt: number;
  verifiedOnly: boolean;
  onToggleGrade: (grade: Grade) => void;
  onToggleCountry: (country: string) => void;
  onPriceMinChange: (value: number | null) => void;
  onPriceMaxChange: (value: number | null) => void;
  onMaxWattChange: (value: number) => void;
  onToggleVerified: () => void;
  onClearAll: () => void;
}) {
  return (
    <div className="border border-line bg-bg-elevated">
      <div className="flex items-center justify-between px-4 h-11 border-b border-line">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber">Filters</p>
        <button
          type="button"
          onClick={onClearAll}
          className="font-mono text-[11.5px] text-ink-dim underline underline-offset-2 hover:text-amber transition-colors"
        >
          Clear all
        </button>
      </div>

      <details className="border-b border-line group" open>
        <summary className="list-none flex items-center justify-between px-4 py-3 text-[13.5px] font-semibold cursor-pointer">
          Grade
          <Chevron />
        </summary>
        <div className="px-4 pb-4 flex flex-col gap-2.5">
          {GRADES.map((g) => (
            <label
              key={g}
              className="flex items-center gap-2.5 text-[13.5px] cursor-pointer hover:text-amber transition-colors"
            >
              <input
                type="checkbox"
                className="w-3.5 h-3.5 accent-amber"
                checked={grades.includes(g)}
                onChange={() => onToggleGrade(g)}
              />
              <span className={`w-2 h-2 rounded-sm shrink-0 ${gradeDot[g]}`} />
              <span>
                {g} — {gradeLabel[g]}
              </span>
              <span className="ml-auto font-mono text-[11.5px] text-ink-dim">
                {gradeCounts[g] ?? 0}
              </span>
            </label>
          ))}
        </div>
      </details>

      <details className="border-b border-line group" open>
        <summary className="list-none flex items-center justify-between px-4 py-3 text-[13.5px] font-semibold cursor-pointer">
          Price
          <Chevron />
        </summary>
        <div className="px-4 pb-4 flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={priceMin ?? ""}
              onChange={(e) => onPriceMinChange(e.target.value === "" ? null : Number(e.target.value))}
              className="w-full border border-line bg-bg px-2.5 py-1.5 text-[13px] rounded-(--radius-tag)"
            />
            <span className="text-ink-dim text-xs">—</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={priceMax ?? ""}
              onChange={(e) => onPriceMaxChange(e.target.value === "" ? null : Number(e.target.value))}
              className="w-full border border-line bg-bg px-2.5 py-1.5 text-[13px] rounded-(--radius-tag)"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {PRICE_CHIPS.map((chip) => {
              const active = priceMin === chip.min && priceMax === (chip.max === Infinity ? null : chip.max);
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    if (active) {
                      onPriceMinChange(null);
                      onPriceMaxChange(null);
                    } else {
                      onPriceMinChange(chip.min);
                      onPriceMaxChange(chip.max === Infinity ? null : chip.max);
                    }
                  }}
                  className={`font-mono text-[11.5px] px-2.5 py-1 rounded-full border transition-colors ${
                    active
                      ? "border-amber text-amber"
                      : "border-line text-ink-dim hover:border-amber hover:text-amber"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>
      </details>

      <details className="border-b border-line group">
        <summary className="list-none flex items-center justify-between px-4 py-3 text-[13.5px] font-semibold cursor-pointer">
          Draw under load
          <Chevron />
        </summary>
        <div className="px-4 pb-4">
          <input
            type="range"
            min={MIN_WATT}
            max={MAX_WATT}
            step={10}
            value={maxWatt}
            onChange={(e) => onMaxWattChange(Number(e.target.value))}
            className="w-full accent-amber"
          />
          <div className="flex justify-between font-mono text-[11.5px] text-ink-dim mt-1">
            <span>{MIN_WATT}W</span>
            <span>{maxWatt >= MAX_WATT ? `≤ ${MAX_WATT}W` : `≤ ${maxWatt}W`}</span>
          </div>
        </div>
      </details>

      <details className="border-b border-line group" open>
        <summary className="list-none flex items-center justify-between px-4 py-3 text-[13.5px] font-semibold cursor-pointer">
          Diagnostic proof
          <Chevron />
        </summary>
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={onToggleVerified}
            role="switch"
            aria-checked={verifiedOnly}
            className="w-full flex items-center justify-between text-[13.5px]"
          >
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pass" />
              Verified listings only
            </span>
            <span
              className={`relative w-9 h-5 rounded-full shrink-0 transition-colors ${
                verifiedOnly ? "bg-pass" : "bg-line"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-bg-elevated transition-transform ${
                  verifiedOnly ? "translate-x-4" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </details>

      {countryCounts.length > 0 && (
        <details className="group">
          <summary className="list-none flex items-center justify-between px-4 py-3 text-[13.5px] font-semibold cursor-pointer">
            Location
            <Chevron />
          </summary>
          <div className="px-4 pb-4 flex flex-col gap-2.5">
            {countryCounts.map(({ country, count }) => (
              <label
                key={country}
                className="flex items-center gap-2.5 text-[13.5px] cursor-pointer hover:text-amber transition-colors"
              >
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 accent-amber"
                  checked={countries.includes(country)}
                  onChange={() => onToggleCountry(country)}
                />
                <span>{country}</span>
                <span className="ml-auto font-mono text-[11.5px] text-ink-dim">{count}</span>
              </label>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function Chevron() {
  return (
    <span className="w-2 h-2 border-r-[1.5px] border-b-[1.5px] border-ink-dim rotate-45 group-open:-rotate-135 transition-transform shrink-0" />
  );
}
