import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { updateEventTime, createEvent, googleConfigured, getConnection } from "@/lib/google";
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

// Verschiebt eine gebuchte Stunde auf eine neue Zeit – vom Lehrer direkt auf der
// Plattform. `start` = absoluter ISO-Zeitpunkt (der Client rechnet die vom
// Lehrer gewählte Wanduhrzeit in seiner Browser-Zeitzone um, so wie sie auch in
// der Terminliste angezeigt wird). Aktualisiert DB + Google-Termin und
// benachrichtigt den Schüler per Mail (neue .ics). Guthaben bleibt unberührt.
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Not signed in" }, 401);
  const { data: teacher } = await supabase.from("teachers").select("id").eq("user_id", user.id).maybeSingle();
  if (!teacher) return json({ error: "Teachers only." }, 403);

  const { id, start } = await req.json().catch(() => ({}));
  if (!id || !start) return json({ error: "Missing id or start" }, 400);

  const startMs = new Date(start).getTime();
  if (!Number.isFinite(startMs)) return json({ error: "Invalid time" }, 400);
  if (startMs < Date.now() + 5 * 60e3) return json({ error: "Please pick a time in the future." }, 400);

  const db = admin();

  // Buchung laden und sicherstellen, dass sie diesem Lehrer gehört und aktiv ist.
  const { data: b } = await db
    .from("lesson_bookings")
    .select("id, teacher_id, student_id, starts_at, ends_at, status, google_event_id, meet_link")
    .eq("id", id)
    .maybeSingle();
  if (!b) return json({ error: "Lesson not found." }, 404);
  if (b.teacher_id !== teacher.id) return json({ error: "Not your lesson." }, 403);
  if (b.status !== "booked") return json({ error: "Only upcoming lessons can be moved." }, 400);

  // Dauer aus den Einstellungen (Fallback: bisherige Dauer, sonst 50 Min).
  const { data: ts } = await db.from("lesson_teacher_settings").select("slot_minutes, timezone").eq("teacher_id", teacher.id).maybeSingle();
  const prevDurMs = new Date(b.ends_at).getTime() - new Date(b.starts_at).getTime();
  const slotMs = (ts?.slot_minutes ?? (prevDurMs > 0 ? prevDurMs / 60e3 : 50)) * 60e3;
  const tz = ts?.timezone ?? "Europe/Berlin";
  const startISO = new Date(startMs).toISOString();
  const endISO = new Date(startMs + slotMs).toISOString();

  // Kollisionsprüfung: keine andere aktive Stunde dieses Lehrers darf sich mit
  // dem neuen Zeitfenster überschneiden (lückenlos, dauerunabhängig).
  if (await hasBookingConflict(db, teacher.id, startISO, endISO, id)) {
    return json({ error: "That time overlaps another booked lesson." }, 409);
  }

  const oldStartISO = b.starts_at as string;

  // DB aktualisieren.
  const { error: upErr } = await db.from("lesson_bookings").update({ starts_at: startISO, ends_at: endISO }).eq("id", id);
  if (upErr) return json({ error: upErr.message }, 500);

  // Schülerdaten (für Mail + evtl. neuen Google-Termin).
  let email: string | null = null, name: string | null = null;
  try {
    const { data: au } = await db.auth.admin.getUserById(b.student_id as string);
    email = au?.user?.email ?? null;
    name = (au?.user?.user_metadata?.full_name as string) || email || null;
  } catch { /* ignore */ }

  // Google-Termin mitziehen: vorhandenen verschieben (oder neu anlegen, falls er
  // im Kalender gelöscht wurde bzw. keiner existierte). googleSynced=false NUR,
  // wenn Google verbunden ist, aber die Aktualisierung scheiterte – dann warnt
  // die UI den Lehrer (sein Kalender steht sonst noch auf der alten Zeit). Bei
  // nicht verbundenem/konfiguriertem Google gibt es nichts zu synchronisieren.
  let meetLink: string | null = (b.meet_link as string) ?? null;
  let googleSynced = true;
  async function createAndStore() {
    const { eventId, meetLink: ml } = await createEvent({ startISO, endISO, attendeeEmail: email, timezone: tz, studentName: name, studentId: b!.student_id as string, teacherId: teacher!.id });
    if (eventId || ml) {
      meetLink = ml ?? meetLink;
      await db.from("lesson_bookings").update({ google_event_id: eventId ?? null, meet_link: ml ?? meetLink }).eq("id", id);
    }
    return Boolean(eventId);
  }
  if (googleConfigured()) {
    try {
      const conn = await getConnection(teacher.id);
      if (conn.connected) {
        if (b.google_event_id) {
          const st = await updateEventTime(b.google_event_id as string, startISO, endISO, tz, teacher.id);
          if (st === "gone") googleSynced = await createAndStore(); // im Kalender gelöscht → neu anlegen
          else googleSynced = st === "ok";
        } else {
          googleSynced = await createAndStore();
        }
      }
    } catch { googleSynced = false; }
  }

  // Schüler benachrichtigen (best effort).
  let mailed = false;
  if (email) {
    try {
      mailed = await sendLessonRescheduled(
        { bookingId: String(id), to: email, studentName: name, startISO, endISO, meetLink, timezone: tz },
        oldStartISO,
      );
    } catch { /* Mail optional */ }
  }

  return json({ ok: true, startISO, endISO, mailed, googleSynced });
}
