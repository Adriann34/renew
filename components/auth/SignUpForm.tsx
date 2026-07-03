"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoogleSignInButton } from "./GoogleSignInButton";

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (!data.session) {
      setInfo("Check your email to confirm your account, then sign in.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line bg-bg-elevated p-6 space-y-5">
      {error && <p className="text-[13px] text-danger">{error}</p>}
      {info && <p className="text-[13px] text-pass">{info}</p>}

      <div>
        <label htmlFor="name" className="block text-[12px] text-ink-dim mb-1.5">
          Name
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          className="w-full border border-line bg-bg-inset px-3 h-10 text-[14px] text-ink placeholder:text-ink-dim outline-none focus:border-amber transition-colors"
        />
      </div>

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
        <label htmlFor="password" className="block text-[12px] text-ink-dim mb-1.5">
          Password
        </label>
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

      <div>
        <label htmlFor="confirm-password" className="block text-[12px] text-ink-dim mb-1.5">
          Confirm password
        </label>
        <input
          id="confirm-password"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full border border-line bg-bg-inset px-3 h-10 text-[14px] text-ink placeholder:text-ink-dim outline-none focus:border-amber transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber text-bg-inset text-[14px] font-medium h-10 rounded-(--radius-tag) hover:bg-amber/90 transition-colors disabled:opacity-60"
      >
        {loading ? "Creating account…" : "Create account"}
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
