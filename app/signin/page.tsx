import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SignInForm } from "@/components/auth/SignInForm";
import { createClient } from "@/lib/supabase/server";

export default async function SignInPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

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

          <SignInForm />

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
