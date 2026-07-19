import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { deleteEvent } from "@/lib/google";

export const runtime = "nodejs";

function admin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}
function json(d: unknown, s = 200) { return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } }); }

// Sagt die Stunde ab (DB-Funktion: >24h = Guthaben zurück) und löscht den
// Google-Termin, falls vorhanden.
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Not signed in" }, 401);

  const { id } = await req.json().catch(() => ({}));
  if (!id) return json({ error: "Missing id" }, 400);

  // Event-ID vorab merken (für spätere Löschung).
  const { data: booking } = await admin().from("lesson_bookings").select("google_event_id").eq("id", id).maybeSingle();

  const { data: result, error } = await supabase.rpc("cancel_lesson", { p_booking: id });
  if (error) return json({ error: error.message }, 400);

  if (booking?.google_event_id) {
    try { await deleteEvent(booking.google_event_id); } catch { /* egal */ }
  }
  return json({ result });
}
