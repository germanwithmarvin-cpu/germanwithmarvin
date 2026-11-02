import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { getConnection, googleConfigured, getEventById } from "@/lib/google";
import { sendLessonRescheduled } from "@/lib/lessonEmails";
import { hasBookingConflict } from "@/lib/lessonConflicts";

export const runtime = "nodejs";
export const maxDuration = 60;

function admin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}
function json(d: unknown, s = 200) {
  return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } });
}

const EPS = 60e3; // Abweichungen < 1 Min gelten als „gleich" (Rundung/Sekunden).

type Row = { id: string; student_id: string; starts_at: string; ends_at: string; google_event_id: string; meet_link: string | null };

// Gleicht im Google-Kalender von Hand verschobene/gelöschte Stunden mit der
// Plattform ab. Zweistufig: mode="preview" zeigt nur den Unterschied (nichts
// wird geändert, keine Mail), mode="apply" übernimmt die neuen Zeiten für die
// ausgewählten Buchungen und mailt den betroffenen Schülern Bescheid.
// Nur für den Buchungs-Lehrer. Google-Kalender = Quelle der Wahrheit.
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Not signed in" }, 401);
  const { data: teacher } = await supabase.from("teachers").select("id").eq("user_id", user.id).maybeSingle();
  if (!teacher) return json({ error: "Teachers only." }, 403);
  if (!googleConfigured()) return json({ error: "Google is not configured on the server." }, 500);

  const conn = await getConnection(teacher.id);
  if (!conn.connected) return json({ connected: false, items: [] });

  const body = await req.json().catch(() => ({}));
  const mode: string = body?.mode === "apply" ? "apply" : "preview";
  const db = admin();

  const { data: ts } = await db.from("lesson_teacher_settings").select("timezone").eq("teacher_id", teacher.id).maybeSingle();
  const tz = ts?.timezone ?? "Europe/Berlin";

  // Künftige gebuchte Stunden MIT Google-Termin – nur die können abweichen.
  const { data: rawRows } = await db
    .from("lesson_bookings")
    .select("id, student_id, starts_at, ends_at, google_event_id, meet_link")
    .eq("teacher_id", teacher.id)
    .eq("status", "booked")
    .not("google_event_id", "is", null)
    .gt("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });
  const rows = (rawRows ?? []) as Row[];

  // Auf Wunsch nur ausgewählte Buchungen anwenden.
  const only: string[] | null = Array.isArray(body?.apply) ? body.apply.map(String) : null;

  const nameCache = new Map<string, { name: string | null; email: string | null }>();
  const items: Record<string, unknown>[] = [];
  for (const b of rows) {
    if (mode === "apply" && only && !only.includes(b.id)) continue;

    const g = await getEventById(b.google_event_id, teacher.id);
    if (!g) continue; // Lese-/Auth-Fehler → nicht als Änderung werten

    const dbStart = new Date(b.starts_at).getTime();
    const dbEnd = new Date(b.ends_at).getTime();
    const student = await studentInfo(db, b.student_id, nameCache);
    const base = { bookingId: b.id, studentName: student.name, email: student.email, dbStart: b.starts_at, dbEnd: b.ends_at };

    if (g.gone) {
      items.push({ ...base, kind: "gone" });
      continue; // „apply" rührt gelöschte Termine nicht an (siehe UI-Hinweis).
    }

    // Start ODER Ende abweichend → verschoben (auch reine Dauer-/Endzeitänderung).
    const gStart = new Date(g.startISO).getTime();
    const gEnd = new Date(g.endISO).getTime();
    const changed = Math.abs(gStart - dbStart) >= EPS || Math.abs(gEnd - dbEnd) >= EPS;
    if (!changed) {
      if (mode === "preview") continue; // unverändert → nicht anzeigen
      items.push({ ...base, kind: "ok" });
      continue;
    }

    // Würde die neue Zeit eine andere gebuchte Stunde überlappen? Dann NICHT
    // übernehmen/mailen, sondern als Konflikt melden (Lehrer muss es klären).
    if (await hasBookingConflict(db, teacher.id, g.startISO, g.endISO, b.id)) {
      items.push({ ...base, kind: "collision", googleStart: g.startISO, googleEnd: g.endISO });
      continue;
    }

    // Verschoben.
    if (mode === "preview") {
      items.push({ ...base, kind: "moved", googleStart: g.startISO, googleEnd: g.endISO });
      continue;
    }

    // apply: neue Zeit übernehmen + Schüler mailen (alte Zeit = DB-Stand).
    const oldStartISO = b.starts_at;
    const { error: upErr } = await db.from("lesson_bookings")
      .update({ starts_at: g.startISO, ends_at: g.endISO }).eq("id", b.id);
    if (upErr) { items.push({ ...base, kind: "error", message: upErr.message }); continue; }

    let mailed = false;
    if (student.email) {
      try {
        mailed = await sendLessonRescheduled(
          { bookingId: b.id, to: student.email, studentName: student.name, startISO: g.startISO, endISO: g.endISO, meetLink: b.meet_link, timezone: tz },
          oldStartISO,
        );
      } catch { /* Mail best effort – Zeit ist trotzdem aktualisiert */ }
    }
    items.push({ ...base, kind: "moved", googleStart: g.startISO, googleEnd: g.endISO, mailed });
  }

  return json({ connected: true, timezone: tz, items });
}

async function studentInfo(db: ReturnType<typeof admin>, userId: string, nameCache: Map<string, { name: string | null; email: string | null }>): Promise<{ name: string | null; email: string | null }> {
  if (nameCache.has(userId)) return nameCache.get(userId)!;
  let out = { name: null as string | null, email: null as string | null };
  try {
    const { data } = await db.auth.admin.getUserById(userId);
    const email = data?.user?.email ?? null;
    const name = (data?.user?.user_metadata?.full_name as string) || email || null;
    out = { name, email };
  } catch { /* ignore */ }
  nameCache.set(userId, out);
  return out;
}
