"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function SignUpPage() {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <main>
      <Navbar />

      <div className="min-h-[70vh] flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber mb-3 text-center">
            Get started
          </p>
          <h1 className="font-display font-semibold text-2xl mb-8 text-center">
            Create your account
          </h1>

          <form
            onSubmit={handleSubmit}
            className="border border-line bg-bg-elevated p-6 space-y-5"
          >
            <div>
              <label htmlFor="name" className="block text-[12px] text-ink-dim mb-1.5">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
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
                placeholder="••••••••"
                className="w-full border border-line bg-bg-inset px-3 h-10 text-[14px] text-ink placeholder:text-ink-dim outline-none focus:border-amber transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber text-bg-inset text-[14px] font-medium h-10 rounded-[var(--radius-tag)] hover:bg-amber/90 transition-colors"
            >
              Create account
            </button>
          </form>

          <p className="text-center text-[13px] text-ink-dim mt-6">
            Already have an account?{" "}
            <a href="/signin" className="text-ink hover:text-amber transition-colors">
              Sign in
            </a>
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
