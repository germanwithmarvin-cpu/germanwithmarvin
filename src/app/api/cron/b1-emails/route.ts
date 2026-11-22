import { createClient as createAdmin } from "@supabase/supabase-js";
import { B1_STAGES, sendB1Stage, type B1Stage } from "@/lib/b1Emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function admin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}
function json(d: unknown, s = 200) { return new Response(JSON.stringify(d, null, 2), { status: s, headers: { "Content-Type": "application/json" } }); }

// Täglicher Cron für die B1-Lead-Serie (nur bestätigte Opt-ins, siehe
// b1_email_candidates). Auth per Header (Vercel-Cron: Authorization; manuell:
// x-cron-secret). ?dry=1 plant nur. GRACE=1: verpasster Lauf wird nachgeholt.
const GRACE = 1;

function dueStage(daysSince: number, sent: string[]): B1Stage | null {
  for (const s of B1_STAGES) {
    if (sent.includes(s.key)) continue;
    if (daysSince >= s.day && daysSince <= s.day + GRACE) return s.key;
  }
  return null;
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return json({ error: "CRON_SECRET not configured" }, 500);
  const url = new URL(req.url);
  const auth = req.headers.get("authorization");
  const ok = auth === `Bearer ${secret}` || req.headers.get("x-cron-secret") === secret;
  if (!ok) return json({ error: "Unauthorized" }, 401);
  const dry = url.searchParams.get("dry") === "1";

  const db = admin();
  const { data, error } = await db.rpc("b1_email_candidates");
  if (error) return json({ error: error.message }, 500);

  type Row = { email: string; full_name: string | null; days_since: number; sent_stages: string[] };
  const rows = (data ?? []) as Row[];

  let sent = 0, skipped = 0;
  const planned: { email: string; stage: string; day: number }[] = [];

  for (const r of rows) {
    const stage = dueStage(r.days_since, r.sent_stages ?? []);
    if (!stage || !r.email) { skipped += 1; continue; }
    planned.push({ email: r.email, stage, day: r.days_since });
    if (dry) continue;
    try {
      const okSend = await sendB1Stage(stage, r.email, r.full_name);
      if (okSend) {
        await db.from("b1_email_log").upsert(
          { email: r.email, stage, sent_at: new Date().toISOString() },
          { onConflict: "email,stage", ignoreDuplicates: true },
        );
        sent += 1;
      } else {
        skipped += 1;
      }
    } catch {
      skipped += 1;
    }
  }

  return json({ ok: true, dry, candidates: rows.length, planned, sent, skipped });
}
