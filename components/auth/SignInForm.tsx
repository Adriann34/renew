"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoogleSignInButton } from "./GoogleSignInButton";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line bg-bg-elevated p-6 space-y-5">
      {error && <p className="text-[13px] text-danger">{error}</p>}

      <div>
        <label htmlFor="email" className="block text-[12px] text-ink-dim mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full border border-line bg-bg-inset px-3 h-10 text-[14px] text-ink placeholder:text-ink-dim outline-none focus:border-amber transition-colors"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="password" className="block text-[12px] text-ink-dim">
            Password
          </label>
          <a href="#" className="text-[12px] text-ink-dim hover:text-ink transition-colors">
            Forgot?
          </a>
        </div>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full border border-line bg-bg-inset px-3 h-10 text-[14px] text-ink placeholder:text-ink-dim outline-none focus:border-amber transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber text-bg-inset text-[14px] font-medium h-10 rounded-(--radius-tag) hover:bg-amber/90 transition-colors disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-[11px] text-ink-dim uppercase tracking-wide">or</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <GoogleSignInButton />
    </form>
  );
}
