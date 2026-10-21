import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Marketing-Kennzahlen der letzten 8 Wochen, gruppiert nach utm_source.
// Lehrer-geschützt; liest per Service-Role auth.users + profiles +
// paid_subscriptions + level_test_results und aggregiert im Server.
//
// Definitionen (bewusst einfach gehalten):
//  - Registrierungen = neue Konten (auth.users.created_at)
//  - Level-Tests     = abgeschlossene Tests (level_test_results)
//  - Probeabos       = neue Konten, die einen Trial-Zugang bekamen
//                      (access_scope='full' + kurze access_expires_at <= 31 Tage)
//  - Zahlende         = aktive Stripe-Abos (paid_subscriptions, Datum=updated_at)
//                      + Jahreszugänge (profiles mit ferner access_expires_at,
//                        Kaufdatum ≈ Ablauf − 365 Tage)

function admin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}
const DAY = 86400e3;
function mondayUTC(d: Date): Date {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7));
  return x;
}
const src = (s: unknown) => { const v = typeof s === "string" ? s.trim().toLowerCase() : ""; return v || "direct"; };

type Row = { regs: number; tests: number; trials: number; paying: number };
const zero = (): Row => ({ regs: 0, tests: 0, trials: 0, paying: 0 });

export async function POST() {
  // --- Lehrer-Gate ---
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const rpc = await supabase.rpc("is_teacher");
  let isTeacher = rpc.data === true;
  if (!isTeacher) {
    const { data: p } = await supabase.from("profiles").select("is_teacher").eq("id", user.id).maybeSingle();
    isTeacher = Boolean(p?.is_teacher);
  }
  if (!isTeacher) return NextResponse.json({ error: "Teacher only" }, { status: 403 });

  const db = admin();

  // --- Daten laden ---
  const users: { id: string; email: string; createdAt: Date; source: string }[] = [];
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data?.users?.length) break;
    for (const u of data.users) {
      const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
      users.push({ id: u.id, email: (u.email ?? "").toLowerCase(), createdAt: new Date(u.created_at), source: src(meta.utm_source) });
    }
    if (data.users.length < 1000) break;
  }
  const [{ data: profiles }, { data: subs }, { data: tests }] = await Promise.all([
    db.from("profiles").select("id, access_scope, access_expires_at"),
    db.from("paid_subscriptions").select("email, status, updated_at"),
    db.from("level_test_results").select("result_level, utm_source, created_at"),
  ]);
  const profById = new Map((profiles ?? []).map((p) => [p.id as string, p]));
  const srcByEmail = new Map(users.map((u) => [u.email, u.source]));

  // --- 8 Wochen-Buckets (Montag-Start, UTC) ---
  const thisMon = mondayUTC(new Date());
  const weekStarts: Date[] = [];
  for (let i = 7; i >= 0; i--) weekStarts.push(new Date(thisMon.getTime() - i * 7 * DAY));
  const first = weekStarts[0].getTime();
  const idx = (d: Date): number => { const m = mondayUTC(d).getTime(); const k = Math.round((m - first) / (7 * DAY)); return k >= 0 && k < 8 ? k : -1; };

  const weeks: Row[] = weekStarts.map(zero);
  const bySrc = new Map<string, Row>();
  const bump = (s: string, k: keyof Row, wi: number) => {
    if (wi >= 0) weeks[wi][k]++;
    if (!bySrc.has(s)) bySrc.set(s, zero());
    if (wi >= 0) bySrc.get(s)![k]++;
  };

  // Registrierungen + Probeabos + Jahreszugänge
  let payingActive = 0;
  for (const u of users) {
    bump(u.source, "regs", idx(u.createdAt));
    const p = profById.get(u.id);
    const exp = p?.access_expires_at ? new Date(p.access_expires_at as string) : null;
    const full = p?.access_scope === "full";
    if (full && exp) {
      const days = (exp.getTime() - u.createdAt.getTime()) / DAY;
      if (days <= 31) bump(u.source, "trials", idx(u.createdAt));        // Trial
      if (exp.getTime() > Date.now() + 180 * DAY) {                       // Jahreszugang
        bump(u.source, "paying", idx(new Date(exp.getTime() - 365 * DAY)));
        payingActive++;
      }
    }
  }
  // Aktive Stripe-Abos
  for (const s of subs ?? []) {
    if (!["active", "trialing"].includes((s.status as string) ?? "")) continue;
    payingActive++;
    const source = srcByEmail.get((s.email as string ?? "").toLowerCase()) ?? "direct";
    bump(source, "paying", idx(new Date(s.updated_at as string)));
  }
  // Level-Tests
  for (const t of tests ?? []) bump(src(t.utm_source), "tests", idx(new Date(t.created_at as string)));

  const bySource = [...bySrc.entries()].map(([source, r]) => ({ source, ...r })).sort((a, b) => (b.regs + b.tests) - (a.regs + a.tests));
  return NextResponse.json({
    weeks: weekStarts.map((w, i) => ({ weekStart: w.toISOString().slice(0, 10), ...weeks[i] })),
    bySource,
    payingActiveTotal: payingActive,
    totalUsers: users.length,
    generatedAt: new Date().toISOString(),
  });
}
