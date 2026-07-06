"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function handleClick() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      className={
        className ??
        "hidden sm:block border-none bg-transparent text-[13px] text-ink-dim/60 hover:text-ink transition-colors"
      }
    >
      Sign out
    </button>
  );
}
