import Link from "next/link";
import { categoryOrder, categoryPluralLabels } from "@/lib/category";

const TABS = [
  { label: "All listings", href: "/browse" },
  ...categoryOrder.map((cat) => ({
    label: categoryPluralLabels[cat],
    href: `/browse?category=${cat}`,
  })),
];

export function CategoryStrip() {
  return (
    <div className="border-b border-line overflow-x-auto">
      <div className="max-w-7xl mx-auto px-6 flex">
        {TABS.map((tab, i) => (
          <Link
            key={tab.label}
            href={tab.href}
            className={`whitespace-nowrap px-5 h-12 flex items-center text-[13px] border-r border-line ${
              i === 0 ? "text-amber font-medium" : "text-ink-dim hover:text-ink"
            } transition-colors`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
