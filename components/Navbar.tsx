import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AccountMenu } from "@/components/AccountMenu";
import { SearchBar } from "@/components/SearchBar";
import { createClient } from "@/lib/supabase/server";
import { getUnreadConversationCount } from "@/lib/conversations";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The navbar renders on every page — a DB hiccup here shouldn't take the whole
  // app down, so an unread-count failure just means no badge.
  const unreadCount = user
    ? await getUnreadConversationCount(user.id).catch(() => 0)
    : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display font-semibold text-lg tracking-tight">
            re<span className="text-amber">new</span>
          </span>
        </Link>

        <SearchBar />

        <nav className="hidden lg:flex items-center gap-6 text-[13px] text-ink-dim">
          <Link href="/browse" className="hover:text-ink transition-colors">Browse</Link>
          <Link href="/sell" className="hover:text-ink transition-colors">Sell hardware</Link>
        </nav>

        <div className="flex items-center gap-5 ml-auto">
          {user ? (
            <>
              <Link
                href="/messages"
                aria-label={
                  unreadCount > 0
                    ? `Messages, ${unreadCount} unread conversation${unreadCount === 1 ? "" : "s"}`
                    : "Messages"
                }
                className="hidden sm:inline-flex items-center gap-2 text-[13px] text-ink-dim hover:text-ink transition-colors"
              >
                Messages
                {unreadCount > 0 && (
                  <span
                    aria-hidden
                    // min-width + padding, not a fixed width: "1" stays a circle,
                    // "12" grows into a pill instead of overflowing.
                    className="min-w-4.5 h-4.5 px-1.5 inline-flex items-center justify-center rounded-full bg-amber/15 text-amber font-mono text-[11px] leading-none tabular-nums"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
              <AccountMenu />
            </>
          ) : (
            <a
              href="/signin"
              className="hidden sm:block text-[13px] text-ink-dim hover:text-ink transition-colors"
            >
              Sign in
            </a>
          )}
          <ThemeToggle />
          <Link
            href="/sell"
            className="bg-amber text-bg-inset text-[13px] font-medium px-4 h-9 flex items-center rounded-(--radius-tag) hover:bg-amber/90 transition-colors"
          >
            List an item
          </Link>
        </div>
      </div>
    </header>
  );
}
