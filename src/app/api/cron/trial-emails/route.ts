import { createClient as createAdmin } from "@supabase/supabase-js";
import { TRIAL_STAGES, sendTrialStage, type TrialStage } from "@/lib/trialEmails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function admin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}
function json(d: unknown, s = 200) { return new Response(JSON.stringify(d, null, 2), { status: s, headers: { "Content-Type": "application/json" } }); }

// Täglicher Cron (Vercel, siehe vercel.json). Auth wie beim Reminder-Cron:
// Header "Authorization: Bearer <CRON_SECRET>" oder ?secret=<CRON_SECRET>.
// ?dry=1 zeigt nur, WER welche Stufe bekäme, ohne zu senden.
//
// GRACE = 1: fällt ein Tageslauf aus, wird die Stufe am Folgetag nachgeholt.
const GRACE = 1;

function dueStage(daysSince: number, sent: string[]): TrialStage | null {
  for (const s of TRIAL_STAGES) {
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
  const ok = auth === `Bearer ${secret}` || url.searchParams.get("secret") === secret;
  if (!ok) return json({ error: "Unauthorized" }, 401);
  const dry = url.searchParams.get("dry") === "1";

  const db = admin();
  const { data, error } = await db.rpc("trial_email_candidates");
  if (error) return json({ error: error.message }, 500);

  type Row = { user_id: string; email: string | null; full_name: string | null; days_since: number; sent_stages: string[] };
  const rows = (data ?? []) as Row[];

  let sent = 0, skipped = 0;
  const planned: { email: string; stage: string; day: number }[] = [];

  for (const r of rows) {
    const stage = dueStage(r.days_since, r.sent_stages ?? []);
    if (!stage || !r.email) { skipped += 1; continue; }
    planned.push({ email: r.email, stage, day: r.days_since });
    if (dry) continue;
    try {
      const okSend = await sendTrialStage(stage, r.email, r.user_id, r.full_name);
      if (okSend) {
        await db.from("trial_email_log").upsert(
          { user_id: r.user_id, stage, sent_at: new Date().toISOString() },
          { onConflict: "user_id,stage", ignoreDuplicates: true },
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
