import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS and can call the admin API (e.g. deleteUser).
// Only ever import this from "use server" action files; SUPABASE_SECRET_KEY has
// no NEXT_PUBLIC_ prefix so it's already unreachable from client bundles, but
// this client itself must never be constructed outside a server context.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
