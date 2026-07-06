"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    // The recovery email links back through the OAuth callback (which exchanges
    // the code for a session) and then on to /reset-password to set the new one.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);

    // Show the same confirmation whether or not the email exists — don't leak
    // which addresses have accounts.
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="border border-line bg-bg-elevated p-6 space-y-3">
        <p className="text-[13px] text-pass border border-pass/40 bg-pass/5 px-3 py-2">
          If an account exists for <span className="font-medium">{email}</span>, a
          password reset link is on its way. Check your inbox.
        </p>
        <p className="text-[13px] text-ink-dim">
          Didn&apos;t get it? Check your spam folder, or{" "}
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-ink hover:text-amber underline underline-offset-2 transition-colors"
          >
            try a different email
          </button>
          .
        </p>
      </div>
    );
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

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber text-bg-inset text-[14px] font-medium h-10 rounded-(--radius-tag) hover:bg-amber/90 transition-colors disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send reset link"}
      </button>

      <p className="text-center text-[13px] text-ink-dim">
        Remembered it?{" "}
        <Link href="/signin" className="text-ink hover:text-amber transition-colors">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
