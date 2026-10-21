import { NextResponse } from "next/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

// Öffentlich: speichert einen abgeschlossenen Level-Test (nur Niveau + Quelle +
// Zeit, keine persönlichen Daten) für die Marketing-Kennzahlen. Insert über die
// Service-Role (die Tabelle ist per RLS für anon gesperrt).
export const runtime = "nodejs";

const clip = (s: unknown, n: number) => (typeof s === "string" ? s.slice(0, n) : null);

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const level = clip(body.level, 4);
  if (!level) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    const db = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
    await db.from("level_test_results").insert({
      result_level: level,
      utm_source: clip(body.utm_source, 60),
      utm_medium: clip(body.utm_medium, 60),
      referrer: clip(body.referrer, 300),
    });
  } catch { /* Metrik best-effort – Fehler nie an den Nutzer weiterreichen */ }
  return NextResponse.json({ ok: true });
}
