import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { createClient } from "@/lib/supabase/server";

export default async function SignUpPage() {
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
            Get started
          </p>
          <h1 className="font-display font-semibold text-2xl mb-8 text-center">
            Create your account
          </h1>

          <SignUpForm />

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
