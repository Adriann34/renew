"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MIN_PASSWORD_LEN = 8;

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LEN) {
      setError(`Password must be at least ${MIN_PASSWORD_LEN} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    // The recovery link already exchanged its code for a session (via
    // /auth/callback), so updateUser applies to the account being recovered.
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setDone(true);
    router.refresh();
    setTimeout(() => router.push("/account"), 1200);
  }

  if (done) {
    return (
      <div className="border border-line bg-bg-elevated p-6">
        <p className="text-[13px] text-pass border border-pass/40 bg-pass/5 px-3 py-2">
          Password updated. Taking you to your account…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line bg-bg-elevated p-6 space-y-5">
      {error && <p className="text-[13px] text-danger">{error}</p>}

      <div>
        <label htmlFor="password" className="block text-[12px] text-ink-dim mb-1.5">
          New password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={MIN_PASSWORD_LEN}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full border border-line bg-bg-inset px-3 h-10 text-[14px] text-ink placeholder:text-ink-dim outline-none focus:border-amber transition-colors"
        />
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-[12px] text-ink-dim mb-1.5">
          Confirm new password
        </label>
        <input
          id="confirm-password"
          type="password"
          required
          minLength={MIN_PASSWORD_LEN}
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
        {loading ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
