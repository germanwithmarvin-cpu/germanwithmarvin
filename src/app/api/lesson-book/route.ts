import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { createEvent } from "@/lib/google";
import { sendLessonConfirmation } from "@/lib/lessonEmails";

export const runtime = "nodejs";

function admin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}
function json(d: unknown, s = 200) { return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } }); }

const friendly = (m: string) =>
  m.includes("no_credits") ? "You have no lesson hours left — top up your plan first."
  : m.includes("slot_taken") ? "That time was just taken — please pick another."
  : m.includes("too_soon") ? "That time is too soon — please book a bit further ahead."
  : m.includes("too_far") ? "That time is too far in the future."
  : m.includes("outside_hours") ? "That time isn't offered — please pick one of the available slots."
  : m.includes("blocked") ? "That time is blocked — please pick another slot."
  : m;

// Bucht die Stunde (DB-Funktion, zieht Guthaben ab) und legt – falls der
// Google-Kalender verbunden ist – Termin + Meet-Link an.
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Not signed in" }, 401);
  const { data: dp } = await supabase.from("profiles").select("is_demo").eq("id", user.id).maybeSingle();
  if (dp?.is_demo) return json({ error: "Booking is disabled on the demo account." }, 403);

  const { start, teacher_id } = await req.json().catch(() => ({}));
  if (!start) return json({ error: "Missing start" }, 400);
  const teacherId = Number.isFinite(Number(teacher_id)) ? Math.round(Number(teacher_id)) : 1;

  const { data: bookingId, error } = await supabase.rpc("book_lesson", { p_teacher: teacherId, p_start: start });
  if (error) return json({ error: friendly(error.message) }, 400);

  const db = admin();
  const { data: settings } = await db.from("lesson_teacher_settings").select("slot_minutes, timezone").eq("teacher_id", teacherId).maybeSingle();
  const slotMin = settings?.slot_minutes ?? 50;
  const tz = settings?.timezone ?? "Europe/Berlin";
  const endISO = new Date(new Date(start).getTime() + slotMin * 60e3).toISOString();
  const studentName = (user.user_metadata?.full_name as string) || user.email || null;

  // Google-Termin + Meet-Link (best effort – Buchung bleibt gültig, auch wenn
  // das scheitert). Termin landet im Kalender des gewählten Lehrers.
  let meetLink: string | null = null;
  try {
    const { eventId, meetLink: ml } = await createEvent({ startISO: start, endISO, attendeeEmail: user.email, timezone: tz, studentName, studentId: user.id, teacherId });
    meetLink = ml ?? null;
    if (eventId || ml) {
      await db.from("lesson_bookings").update({ google_event_id: eventId ?? null, meet_link: ml ?? null }).eq("id", bookingId);
    }
  } catch { /* Google optional */ }

  // Bestätigungs-Mail an den Schüler (mit .ics + Join-Link). Ersetzt die frühere
  // Google-Einladung (Teilnehmer entfernt wegen Preply). Best effort.
  if (user.email) {
    try {
      await sendLessonConfirmation({ bookingId: String(bookingId), to: user.email, studentName, startISO: start, endISO, meetLink, timezone: tz });
    } catch { /* Mail optional */ }
  }

  return json({ id: bookingId, meetLink });
}
