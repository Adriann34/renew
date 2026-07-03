"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function SignInPage() {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <main>
      <Navbar />

      <div className="min-h-[70vh] flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber mb-3 text-center">
            Welcome back
          </p>
          <h1 className="font-display font-semibold text-2xl mb-8 text-center">
            Sign in to Renew
          </h1>

          <form
            onSubmit={handleSubmit}
            className="border border-line bg-bg-elevated p-6 space-y-5"
          >
            <div>
              <label htmlFor="email" className="block text-[12px] text-ink-dim mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
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
                placeholder="••••••••"
                className="w-full border border-line bg-bg-inset px-3 h-10 text-[14px] text-ink placeholder:text-ink-dim outline-none focus:border-amber transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber text-bg-inset text-[14px] font-medium h-10 rounded-[var(--radius-tag)] hover:bg-amber/90 transition-colors"
            >
              Sign in
            </button>
          </form>

          <p className="text-center text-[13px] text-ink-dim mt-6">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-ink hover:text-amber transition-colors">
              Sign up
            </a>
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
