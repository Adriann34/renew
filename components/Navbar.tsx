import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchBar } from "@/components/SearchBar";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { createClient } from "@/lib/supabase/server";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display font-semibold text-lg tracking-tight">
            re<span className="text-amber">new</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center flex-1 max-w-md">
          <SearchBar />
        </div>

        <nav className="hidden lg:flex items-center gap-6 text-[13px] text-ink-dim">
          <Link href="/browse" className="hover:text-ink transition-colors">Browse</Link>
          <Link href="/sell" className="hover:text-ink transition-colors">Sell hardware</Link>
        </nav>

        <div className="flex items-center gap-5 ml-auto">
          <ThemeToggle />
          {user ? (
            <>
              <Link
                href="/messages"
                className="hidden sm:block text-[13px] text-ink-dim hover:text-ink transition-colors"
              >
                Messages
              </Link>
              <Link
                href="/account"
                className="hidden sm:block text-[13px] text-ink-dim hover:text-ink transition-colors"
              >
                Account
              </Link>
              <SignOutButton />
            </>
          ) : (
            <a
              href="/signin"
              className="hidden sm:block text-[13px] text-ink-dim hover:text-ink transition-colors"
            >
              Sign in
            </a>
          )}
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
