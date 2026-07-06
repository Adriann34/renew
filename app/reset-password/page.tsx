import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { createClient } from "@/lib/supabase/server";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Reaching here means the recovery link already established a session via
  // /auth/callback. Without one, there's nothing to reset — send them back to
  // request a fresh link (a stale/expired reset link lands here too).
  if (!user) redirect("/forgot-password");

  return (
    <main>
      <Navbar />

      <div className="min-h-[70vh] flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber mb-3 text-center">
            Reset password
          </p>
          <h1 className="font-display font-semibold text-2xl mb-3 text-center">
            Set a new password
          </h1>
          <p className="text-center text-[13px] text-ink-dim mb-8">
            Choose a strong password you&apos;re not using anywhere else.
          </p>

          <UpdatePasswordForm />
        </div>
      </div>

      <Footer />
    </main>
  );
}
