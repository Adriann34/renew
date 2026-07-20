"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// Global navbar search. It doesn't filter in place — on submit it sends the
// query to /browse, where BrowseView reads the `q` param and filters listings
// live. Keeping the actual filtering in one place (BrowseView) avoids two
// competing search implementations.
//
// On /browse itself the page already has its own prominent live-filtering
// search bar, so this global one would just be a redundant second box —
// hide it there and let the hero search own the experience.
export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/browse?q=${encodeURIComponent(trimmed)}` : "/browse");
  }

  if (pathname === "/browse") return null;

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="hidden md:flex flex-1 max-w-md items-center border border-line bg-bg-inset px-3 h-9 focus-within:border-ink-dim transition-colors"
    >
      <span className="text-ink-dim text-xs font-mono">⌕</span>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Renew"
        aria-label="Search listings"
        className="flex-1 bg-transparent px-2 text-[13px] text-ink placeholder:text-ink-dim outline-none [&::-webkit-search-cancel-button]:appearance-none"
      />
    </form>
  );
}
