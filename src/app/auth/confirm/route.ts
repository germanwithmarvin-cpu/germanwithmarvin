import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Ziel des Bestätigungslinks aus der Willkommens-E-Mail. Verifiziert die Adresse
// (token_hash -> verifyOtp, empfohlen/robust) oder tauscht einen PKCE-Code aus
// (falls das Standard-Template genutzt wird) und loggt den Nutzer dann ein.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") || "/dashboard";
  const dest = new URL(nextParam.startsWith("/") ? nextParam : "/dashboard", url.origin);

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(dest);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(dest);
  }
  return NextResponse.redirect(new URL("/login?confirm=failed", url.origin));
}
