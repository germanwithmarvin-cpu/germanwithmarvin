import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { createEvent } from "@/lib/google";

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

  const { start } = await req.json().catch(() => ({}));
  if (!start) return json({ error: "Missing start" }, 400);

  const { data: bookingId, error } = await supabase.rpc("book_lesson", { p_start: start });
  if (error) return json({ error: friendly(error.message) }, 400);

  // Google-Termin (best effort – Buchung bleibt gültig, auch wenn das scheitert).
  try {
    const db = admin();
    const { data: settings } = await db.from("lesson_teacher_settings").select("slot_minutes, timezone").eq("id", 1).maybeSingle();
    const slotMin = settings?.slot_minutes ?? 50;
    const tz = settings?.timezone ?? "Europe/Berlin";
    const endISO = new Date(new Date(start).getTime() + slotMin * 60e3).toISOString();
    const studentName = (user.user_metadata?.full_name as string) || user.email || null;
    const { eventId, meetLink } = await createEvent({ startISO: start, endISO, attendeeEmail: user.email, timezone: tz, studentName });
    if (eventId || meetLink) {
      await db.from("lesson_bookings").update({ google_event_id: eventId ?? null, meet_link: meetLink ?? null }).eq("id", bookingId);
      return json({ id: bookingId, meetLink: meetLink ?? null });
    }
  } catch { /* Google optional */ }

  return json({ id: bookingId });
}
