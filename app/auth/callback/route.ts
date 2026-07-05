import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Only allow same-site relative paths ("/x") — never "//x" (protocol-relative)
// or anything containing "@"/"://", which can be used to redirect off-site
// once concatenated onto `origin` (e.g. `next=@evil.com/`).
function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("://") || next.includes("@")) {
    return "/";
  }
  return next;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/signin?error=auth-callback-failed`);
}
