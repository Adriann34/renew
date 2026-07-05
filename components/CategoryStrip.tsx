import Link from "next/link";
import { categories } from "@/lib/data";

// Mirrors the fixed order of `categories`: "All listings" first, then one
// entry per Category enum value (excluding the catch-all OTHER category).
const CATEGORY_HREFS = [
  "/browse",
  "/browse?category=GPU",
  "/browse?category=CPU",
  "/browse?category=MOTHERBOARD",
  "/browse?category=RAM",
  "/browse?category=STORAGE",
  "/browse?category=PSU",
];

export function CategoryStrip() {
  return (
    <div className="border-b border-line overflow-x-auto">
      <div className="max-w-7xl mx-auto px-6 flex">
        {categories.map((cat, i) => (
          <Link
            key={cat.label}
            href={CATEGORY_HREFS[i] ?? "/browse"}
            className={`whitespace-nowrap px-5 h-12 flex items-center gap-2 text-[13px] border-r border-line ${
              i === 0 ? "text-amber font-medium" : "text-ink-dim hover:text-ink"
            } transition-colors`}
          >
            {cat.label}
            <span className="font-mono text-[10px] text-ink-dim">
              {cat.count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
