import { createClient as createAdmin } from "@supabase/supabase-js";
import { sendLessonReminder } from "@/lib/lessonEmails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function admin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}
function json(d: unknown, s = 200) { return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } }); }

// Erinnerungs-Mails an Schüler für bald anstehende, gebuchte Stunden.
//
// Auslöser: Vercel-Cron (siehe vercel.json). Vercel schickt automatisch den
// Header "Authorization: Bearer <CRON_SECRET>", wenn CRON_SECRET als Env gesetzt
// ist. Zum manuellen Test geht auch ?secret=<CRON_SECRET>.
//
// Fenster: Stunden, die in den nächsten ~26 h beginnen und noch keine Erinnerung
// haben (reminded_at IS NULL). Das 26-h-Fenster funktioniert auf jedem Plan:
// läuft der Cron stündlich (Vercel Pro), geht die Mail ~1 Tag vorher raus; läuft
// er nur einmal täglich (Hobby), erwischt der Tageslauf die Stunden von morgen.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return json({ error: "CRON_SECRET not configured" }, 500);
  const url = new URL(req.url);
  const auth = req.headers.get("authorization");
  const ok = auth === `Bearer ${secret}` || url.searchParams.get("secret") === secret;
  if (!ok) return json({ error: "Unauthorized" }, 401);

  const db = admin();
  const now = new Date();
  const windowEnd = new Date(now.getTime() + 26 * 3600e3);

  const { data: bookings, error } = await db
    .from("lesson_bookings")
    .select("id, student_id, teacher_id, starts_at, ends_at, meet_link")
    .eq("status", "booked")
    .is("reminded_at", null)
    .gt("starts_at", now.toISOString())
    .lte("starts_at", windowEnd.toISOString())
    .order("starts_at", { ascending: true })
    .limit(100);
  if (error) return json({ error: error.message }, 500);

  const tzCache = new Map<number, string>();
  async function tzFor(teacherId: number): Promise<string> {
    if (tzCache.has(teacherId)) return tzCache.get(teacherId)!;
    const { data } = await db.from("lesson_teacher_settings").select("timezone").eq("teacher_id", teacherId).maybeSingle();
    const tz = data?.timezone ?? "Europe/Berlin";
    tzCache.set(teacherId, tz);
    return tz;
  }

  let sent = 0, skipped = 0;
  for (const b of (bookings ?? []) as { id: string; student_id: string; teacher_id: number; starts_at: string; ends_at: string; meet_link: string | null }[]) {
    try {
      const { data: authRes } = await db.auth.admin.getUserById(b.student_id);
      const email = authRes?.user?.email ?? null;
      const name = (authRes?.user?.user_metadata?.full_name as string) || email || null;
      if (!email) { skipped += 1; continue; }
      const tz = await tzFor(b.teacher_id ?? 1);
      const okSend = await sendLessonReminder({ bookingId: String(b.id), to: email, studentName: name, startISO: b.starts_at, endISO: b.ends_at, meetLink: b.meet_link, timezone: tz });
      // reminded_at auch bei Mail-Fehler setzen wäre riskant (keine 2. Chance);
      // daher nur bei Erfolg markieren.
      if (okSend) {
        await db.from("lesson_bookings").update({ reminded_at: new Date().toISOString() }).eq("id", b.id);
        sent += 1;
      } else {
        skipped += 1;
      }
    } catch {
      skipped += 1;
    }
  }

  return json({ ok: true, candidates: bookings?.length ?? 0, sent, skipped });
}
