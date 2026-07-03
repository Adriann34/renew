import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">
        <a href="/" className="flex items-center gap-2">
          <span className="font-display font-semibold text-lg tracking-tight">
            re<span className="text-amber">new</span>
          </span>
        </a>

        <div className="hidden md:flex items-center flex-1 max-w-md ml-14">
          <div className="w-full flex items-center border border-line bg-bg-inset px-3 h-9">
            <span className="text-ink-dim text-xs font-mono">⌕</span>
            <input
              type="text"
              placeholder="Search RTX 4080, Ryzen 9, DDR5..."
              className="flex-1 bg-transparent px-2 text-[13px] text-ink placeholder:text-ink-dim outline-none"
            />
          </div>
        </div>

        <div className="hidden lg:flex flex-1 justify-center">
          <nav className="flex items-center gap-6 text-[13px] text-ink-dim">
            <a href="#" className="hover:text-ink transition-colors">Browse</a>
            <a href="#" className="hover:text-ink transition-colors">Sell hardware</a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="/signin"
            className="hidden sm:block text-[13px] text-ink-dim hover:text-ink transition-colors"
          >
            Sign in
          </a>
          <a
            href="#"
            className="bg-amber text-bg-inset text-[13px] font-medium px-4 h-9 flex items-center rounded-[var(--radius-tag)] hover:bg-amber/90 transition-colors"
          >
            List an item
          </a>
        </div>
      </div>
    </header>
  );
}
