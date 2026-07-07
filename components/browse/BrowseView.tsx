"use client";

import { useEffect, useMemo, useState } from "react";
import type { Category, Grade } from "@prisma/client";
import { ListingCard } from "@/components/ListingCard";
import { categoryLabels, categoryPluralLabels } from "@/lib/category";
import type { ListingWithRelations } from "@/lib/listings";
import { FilterSidebar } from "@/components/browse/FilterSidebar";

const PAGE_SIZE = 12;
const MAX_WATT = 500;

type SortKey = "recent" | "price-asc" | "price-desc" | "bench-desc";
type ViewMode = "grid" | "list";
type CategoryTab = Category | "all";

const SORT_LABELS: Record<SortKey, string> = {
  recent: "Sort: Recently verified",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "bench-desc": "Highest benchmark score",
};

export function BrowseView({
  listings,
  categoryOrder,
  categoryCounts,
  totalCount,
  initialCategory,
  initialSearch,
}: {
  listings: ListingWithRelations[];
  categoryOrder: Category[];
  categoryCounts: Partial<Record<Category, number>>;
  totalCount: number;
  initialCategory: CategoryTab;
  initialSearch: string;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState<CategoryTab>(initialCategory);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [maxWatt, setMaxWatt] = useState(MAX_WATT);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("recent");
  const [view, setView] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  function toggleGrade(g: Grade) {
    setGrades((prev) => (prev.includes(g) ? prev.filter((v) => v !== g) : [...prev, g]));
  }

  function toggleCountry(c: string) {
    setCountries((prev) => (prev.includes(c) ? prev.filter((v) => v !== c) : [...prev, c]));
  }

  function clearFilters() {
    setGrades([]);
    setCountries([]);
    setPriceMin(null);
    setPriceMax(null);
    setMaxWatt(MAX_WATT);
    setVerifiedOnly(false);
  }

  // Sidebar facet counts (grade breakdown, location breakdown) are scoped to
  // the selected category tab, not the full dataset — otherwise switching to
  // a near-empty category (e.g. Motherboards) would still show grade/location
  // counts left over from every other category.
  const categoryScoped = useMemo(
    () => (category === "all" ? listings : listings.filter((l) => l.category === category)),
    [listings, category]
  );

  const gradeCounts = useMemo(() => {
    const counts: Partial<Record<Grade, number>> = {};
    for (const l of categoryScoped) counts[l.grade] = (counts[l.grade] ?? 0) + 1;
    return counts;
  }, [categoryScoped]);

  const countryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of categoryScoped) {
      const country = l.location.split(", ").at(-1) ?? l.location;
      counts[country] = (counts[country] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);
  }, [categoryScoped]);

  const filtered = useMemo(() => {
    // Match each whitespace-separated term against title + spec so a query like
    // "4090 founders" narrows rather than requiring the exact phrase.
    const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
    return listings.filter((l) => {
      if (terms.length) {
        const haystack = `${l.title} ${l.spec}`.toLowerCase();
        if (!terms.every((t) => haystack.includes(t))) return false;
      }
      if (category !== "all" && l.category !== category) return false;
      if (grades.length && !grades.includes(l.grade)) return false;
      if (countries.length) {
        const country = l.location.split(", ").at(-1) ?? l.location;
        if (!countries.includes(country)) return false;
      }
      if (priceMin != null && l.price < priceMin) return false;
      if (priceMax != null && l.price > priceMax) return false;
      if (l.wattageDraw > 0 && l.wattageDraw > maxWatt) return false;
      if (verifiedOnly && !l.bootVerified) return false;
      return true;
    });
  }, [listings, search, category, grades, countries, priceMin, priceMax, maxWatt, verifiedOnly]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sort === "price-asc") arr.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") arr.sort((a, b) => b.price - a.price);
    else if (sort === "bench-desc") arr.sort((a, b) => b.benchmarkScore - a.benchmarkScore);
    else arr.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return arr;
  }, [filtered, sort]);

  useEffect(() => {
    setPage(1);
  }, [search, category, grades, countries, priceMin, priceMax, maxWatt, verifiedOnly, sort]);

  // A navbar search while already on /browse re-renders this component with a
  // new `q` param but doesn't remount it, so mirror the incoming value into
  // local state — otherwise the second search wouldn't take effect.
  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const categoryTotal = category === "all" ? totalCount : categoryCounts[category] ?? 0;
  const isSingular = categoryTotal === 1;
  const categoryLabel =
    category === "all"
      ? isSingular
        ? "listing"
        : "listings"
      : isSingular
        ? categoryLabels[category]
        : categoryPluralLabels[category];

  const sidebarProps = {
    gradeCounts,
    countryCounts,
    grades,
    countries,
    priceMin,
    priceMax,
    maxWatt,
    verifiedOnly,
    onToggleGrade: toggleGrade,
    onToggleCountry: toggleCountry,
    onPriceMinChange: setPriceMin,
    onPriceMaxChange: setPriceMax,
    onMaxWattChange: setMaxWatt,
    onToggleVerified: () => setVerifiedOnly((v) => !v),
    onClearAll: clearFilters,
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <h1 className="font-display font-semibold text-3xl md:text-4xl mb-2">Browse listings</h1>
        <p className="text-ink-dim text-[15px] max-w-xl mb-6">
          Filter by category, grade, and the numbers sellers actually tested — draw under load,
          benchmark score, boot status — before you talk to anyone.
        </p>
        <div className="flex items-center border border-line bg-bg-inset px-3 h-11 max-w-md mb-8 focus-within:border-ink-dim transition-colors">
          <span className="text-ink-dim text-sm font-mono">⌕</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or spec — RTX 4080, Ryzen 9, DDR5..."
            aria-label="Search listings"
            className="flex-1 bg-transparent px-2.5 text-[14px] text-ink placeholder:text-ink-dim outline-none [&::-webkit-search-cancel-button]:appearance-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="text-ink-dim hover:text-ink text-lg leading-none px-1"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="border-b border-line overflow-x-auto overflow-y-hidden overscroll-x-contain">
        <div className="flex max-w-7xl mx-auto px-6">
          <CategoryTabButton
            active={category === "all"}
            label="All listings"
            count={totalCount}
            onClick={() => setCategory("all")}
          />
          {categoryOrder.map((c) => (
            <CategoryTabButton
              key={c}
              active={category === c}
              label={categoryPluralLabels[c]}
              count={categoryCounts[c] ?? 0}
              onClick={() => setCategory(c)}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-7 flex flex-col lg:flex-row lg:items-start gap-8">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="lg:hidden self-start flex items-center gap-2 border border-line bg-bg-elevated px-4 h-10 text-[13.5px] font-medium"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="10" y1="18" x2="14" y2="18" />
          </svg>
          Filters
        </button>

        <aside className="hidden lg:block lg:w-65 lg:shrink-0">
          <FilterSidebar {...sidebarProps} />
        </aside>

        {filterOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-ink/30" onClick={() => setFilterOpen(false)} />
            <div className="relative w-[86%] max-w-sm h-full overflow-y-auto bg-bg">
              <div className="flex items-center justify-between px-4 h-12 border-b border-line bg-bg-elevated">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber">Filters</p>
                <button type="button" onClick={() => setFilterOpen(false)} className="text-ink-dim text-xl leading-none px-1">
                  ×
                </button>
              </div>
              <FilterSidebar {...sidebarProps} />
            </div>
          </div>
        )}

        <main className="min-w-0 lg:flex-1">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <p className="text-[14px] text-ink-dim">
              <b className="text-ink">{sorted.length}</b> of {categoryTotal} results
            </p>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="appearance-none border border-line bg-bg-elevated pl-3 pr-8 h-9 text-[13.5px] rounded-(--radius-tag)"
                >
                  {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                    <option key={key} value={key}>
                      {SORT_LABELS[key]}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 pointer-events-none text-ink-dim"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              <div className="flex border border-line rounded-(--radius-tag) overflow-hidden">
                <button
                  type="button"
                  title="Grid view"
                  onClick={() => setView("grid")}
                  className={`w-9 h-9 flex items-center justify-center ${
                    view === "grid" ? "bg-bg-inset text-ink" : "bg-bg-elevated text-ink-dim"
                  }`}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                  </svg>
                </button>
                <button
                  type="button"
                  title="List view"
                  onClick={() => setView("list")}
                  className={`w-9 h-9 flex items-center justify-center border-l border-line ${
                    view === "list" ? "bg-bg-inset text-ink" : "bg-bg-elevated text-ink-dim"
                  }`}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {pageItems.length > 0 ? (
            <div
              className={view === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-5" : "flex flex-col gap-4"}
            >
              {pageItems.map((listing) => (
                <ListingCard key={listing.id} listing={listing} view={view} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-line px-6 py-16 text-center text-ink-dim text-[14px]">
              <b className="block text-ink text-base font-semibold mb-1.5">
                No listings match those filters.
              </b>
              Try widening the price range or clearing a filter — {categoryTotal}{" "}
              {categoryLabel.toLowerCase()} {isSingular ? "is" : "are"} waiting.
            </div>
          )}

          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setPage} />
          )}
        </main>
      </div>
    </>
  );
}

function CategoryTabButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap px-4 h-11 flex items-center gap-2 text-[13.5px] border-b-2 -mb-px transition-colors ${
        active ? "border-amber text-ink font-semibold" : "border-transparent text-ink-dim hover:text-ink"
      }`}
    >
      {label}
      <span className={`font-mono text-[11px] ${active ? "text-amber" : "text-ink-dim"}`}>{count}</span>
    </button>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const pages = paginationRange(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10 font-mono text-[13px]">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
        className="min-w-9 h-9 border border-line text-ink-dim disabled:opacity-40 disabled:pointer-events-none hover:border-amber hover:text-amber"
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`dots-${i}`} className="px-1 text-ink-dim">
            ···
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`min-w-9 h-9 border ${
              p === currentPage
                ? "bg-amber text-bg-inset border-amber"
                : "border-line text-ink-dim hover:border-amber hover:text-amber"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onChange(currentPage + 1)}
        className="min-w-9 h-9 border border-line text-ink-dim disabled:opacity-40 disabled:pointer-events-none hover:border-amber hover:text-amber"
      >
        ›
      </button>
    </div>
  );
}

function paginationRange(current: number, total: number): (number | "…")[] {
  const pages: (number | "…")[] = [];
  const window = 1;
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || Math.abs(p - current) <= window) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }
  return pages;
}
