import { categories } from "@/lib/data";

export function CategoryStrip() {
  return (
    <div className="border-b border-line overflow-x-auto">
      <div className="max-w-7xl mx-auto px-6 flex">
        {categories.map((cat, i) => (
          <a
            key={cat.label}
            href="#"
            className={`whitespace-nowrap px-5 h-12 flex items-center gap-2 text-[13px] border-r border-line ${
              i === 0 ? "text-amber font-medium" : "text-ink-dim hover:text-ink"
            } transition-colors`}
          >
            {cat.label}
            <span className="font-mono text-[10px] text-ink-dim">
              {cat.count}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
