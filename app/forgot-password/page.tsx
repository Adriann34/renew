import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { createClient } from "@/lib/supabase/server";

export default async function ForgotPasswordPage() {
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
            Reset password
          </p>
          <h1 className="font-display font-semibold text-2xl mb-3 text-center">
            Forgot your password?
          </h1>
          <p className="text-center text-[13px] text-ink-dim mb-8">
            Enter your email and we&apos;ll send you a link to set a new one.
          </p>

          <ForgotPasswordForm />
        </div>
      </div>

      <Footer />
    </main>
  );
}
