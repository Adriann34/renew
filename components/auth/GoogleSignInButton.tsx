"use client";

import { createClient } from "@/lib/supabase/client";

export function GoogleSignInButton() {
  async function handleClick() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full border border-line bg-bg-inset text-ink text-[14px] font-medium h-10 rounded-(--radius-tag) hover:bg-bg-elevated transition-colors"
    >
      Continue with Google
    </button>
  );
}
