"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
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
      className="hidden sm:block text-[13px] text-ink-dim hover:text-ink transition-colors"
    >
      Sign out
    </button>
  );
}
