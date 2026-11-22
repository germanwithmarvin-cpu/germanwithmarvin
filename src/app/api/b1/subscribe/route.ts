import { createClient as createAdmin } from "@supabase/supabase-js";
import { sendB1Confirm } from "@/lib/b1Emails";

export const runtime = "nodejs";

function admin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}
function json(d: unknown, s = 200) {
  return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } });
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// B1-Test-Lead einsammeln + Double-Opt-in anstoßen. Speichert den Lead als
// "pending" und schickt eine Bestätigungsmail. Das Testergebnis wird dem Nutzer
// trotzdem sofort angezeigt (die E-Mail-Eingabe ist der Gegenwert dafür); die
// Marketing-Serie startet erst NACH der Bestätigung (DSGVO).
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return json({ error: "Please enter a valid email." }, 400);
  if (!body.consent) return json({ error: "Please tick the consent box to continue." }, 400);

  const source = String(body.source ?? "b1-test").slice(0, 60);
  const test_result = body.test_result ? String(body.test_result).slice(0, 10) : null;
  const wunschzeit = body.wunschzeit ? String(body.wunschzeit).slice(0, 60) : null;
  const full_name = body.full_name ? String(body.full_name).slice(0, 120) : null;
  const consent_text = body.consent_text ? String(body.consent_text).slice(0, 500) : null;

  try {
    const db = admin();
    const { data: existing } = await db.from("b1_leads").select("status").eq("email", email).maybeSingle();
    if (existing?.status === "confirmed") {
      // schon bestätigt → nur Datenfelder auffrischen, keine zweite Bestätigungsmail
      await db.from("b1_leads").update({ source, test_result, wunschzeit, full_name, updated_at: new Date().toISOString() }).eq("email", email);
      return json({ ok: true, confirmed: true });
    }
    await db.from("b1_leads").upsert(
      { email, source, test_result, wunschzeit, full_name, status: "pending", marketing_consent: false, consent_text, updated_at: new Date().toISOString() },
      { onConflict: "email" },
    );
    await sendB1Confirm(email, full_name);
  } catch { /* best effort — darf das Ergebnis nie blockieren */ }

  return json({ ok: true });
}
