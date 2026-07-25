import { createClient } from "@supabase/supabase-js";

// Zählt einen Besuch über ?ref=CODE. Anonyme Besucher-ID (vid) aus dem Client
// dedupliziert per (code, vid, Tag) via UNIQUE-Constraint. Schreibt mit dem
// Service-Role-Key (umgeht RLS). Existiert der Code nicht, passiert nichts.

export const runtime = "nodejs";

const CODE_RE = /^[A-Za-z0-9-]{3,32}$/;

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function POST(req: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return new Response("ok", { status: 200 }); // still konfiguriert → nichts tun
  }
  let code = "";
  let vid = "";
  try {
    const body = await req.json();
    code = String(body.code ?? "");
    vid = String(body.vid ?? "").slice(0, 64);
  } catch {
    return new Response("ok", { status: 200 });
  }
  if (!CODE_RE.test(code)) return new Response("ok", { status: 200 });

  try {
    const db = admin();
    // Nur zählen, wenn der Code existiert und aktiv ist.
    const { data: rc } = await db.from("referral_codes").select("code").eq("code", code).eq("active", true).maybeSingle();
    if (rc) {
      await db.from("referral_visits").insert({ code, visitor_key: vid || "anon" }); // Duplikate fängt UNIQUE ab
    }
  } catch { /* best effort */ }

  return new Response("ok", { status: 200 });
}
