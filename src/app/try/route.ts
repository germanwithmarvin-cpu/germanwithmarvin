import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Kein-Login-Zugang: /try?key=SECRET loggt den Besucher ins geteilte Demo-Konto
// ein (Vollzugang, Buchung gesperrt). Kein Registrieren noetig.
// Env noetig (in Vercel): DEMO_LINK_KEY, DEMO_EMAIL, DEMO_PASSWORD.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  const expected = process.env.DEMO_LINK_KEY;
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;

  if (!expected || !email || !password) {
    return NextResponse.redirect(new URL("/login?demo=unconfigured", url.origin));
  }
  if (!key || key !== expected) {
    return NextResponse.redirect(new URL("/login?demo=invalid", url.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return NextResponse.redirect(new URL("/login?demo=failed", url.origin));
  }
  // Session-Cookies wurden gesetzt -> Besucher ist als Demo-Konto eingeloggt.
  return NextResponse.redirect(new URL("/dashboard", url.origin));
}
