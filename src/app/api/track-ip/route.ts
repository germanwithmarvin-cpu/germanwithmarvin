import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

export const runtime = "nodejs";

function admin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}
function json(d: unknown) {
  return new Response(JSON.stringify(d), { status: 200, headers: { "Content-Type": "application/json" } });
}

// Speichert die IP des eingeloggten Nutzers dauerhaft (fuer die Mehrfachkonto-
// Pruefung). Die IP kommt aus den Vercel-Headern, NICHT vom Client -> nicht
// faelschbar. signup_ip wird nur einmal gesetzt (erste erfasste IP), last_ip
// immer aktualisiert. Wird pro Session einmal vom App-Layout aufgerufen.
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ ok: false });

  const fwd = req.headers.get("x-forwarded-for") || "";
  const ip = (fwd.split(",")[0] || req.headers.get("x-real-ip") || "").trim();
  if (!ip) return json({ ok: false });

  try {
    const db = admin();
    const { data: prof } = await db.from("profiles").select("signup_ip").eq("id", user.id).maybeSingle();
    await db.from("profiles").update({
      ...(prof && !prof.signup_ip ? { signup_ip: ip } : {}),
      last_ip: ip,
      last_ip_at: new Date().toISOString(),
    }).eq("id", user.id);
  } catch { /* best effort - IP-Tracking darf nie den Login stoeren */ }

  return json({ ok: true });
}
