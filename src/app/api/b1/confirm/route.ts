import { createClient as createAdmin } from "@supabase/supabase-js";
import { subjectValid } from "@/lib/unsubscribe";

export const runtime = "nodejs";

function admin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}

// Double-Opt-in-Bestätigung: signierten Link aus der Bestätigungsmail prüfen und
// den Lead auf "confirmed" setzen (erst jetzt marketing_consent=true). Danach auf
// die Danke-Seite leiten, die das Meta-"Lead"-Event feuert (?confirmed=1).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const email = (url.searchParams.get("e") ?? "").trim().toLowerCase();
  const token = url.searchParams.get("t") ?? "";

  if (!email || !subjectValid(email, token)) {
    return Response.redirect(`${origin}/b1-confirmed?confirm=failed`, 302);
  }
  try {
    await admin()
      .from("b1_leads")
      .update({ status: "confirmed", marketing_consent: true, confirmed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("email", email)
      .neq("status", "confirmed"); // confirmed_at nicht bei jedem Re-Klick zurücksetzen
  } catch { /* best effort */ }

  return Response.redirect(`${origin}/b1-confirmed?confirmed=1`, 302);
}
