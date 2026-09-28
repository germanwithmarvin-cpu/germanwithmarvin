import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { getConnection, syncStudentGoogleEvents, googleConfigured } from "@/lib/google";

export const runtime = "nodejs";
export const maxDuration = 60;

function admin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}
function json(d: unknown, s = 200) {
  return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } });
}

// Holt fehlende Google-Termine fuer ALLE kuenftigen gebuchten Stunden nach
// (z. B. per feste-Zeit-Materialisierung entstandene, die nie im Kalender
// landeten). Idempotent: syncStudentGoogleEvents legt nur Buchungen ohne
// google_event_id an. Nur fuer den Buchungs-Lehrer.
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Not signed in" }, 401);
  const { data: teacher } = await supabase.from("teachers").select("id").eq("user_id", user.id).maybeSingle();
  if (!teacher) return json({ error: "Teachers only." }, 403);
  if (!googleConfigured()) return json({ error: "Google is not configured on the server." }, 500);

  const conn = await getConnection(teacher.id);
  if (!conn.connected) return json({ connected: false, created: 0 });

  const db = admin();
  const { data: rows } = await db
    .from("lesson_bookings")
    .select("student_id")
    .eq("teacher_id", teacher.id)
    .eq("status", "booked")
    .is("google_event_id", null)
    .gt("starts_at", new Date().toISOString());

  const ids = Array.from(new Set((rows ?? []).map((r) => (r as { student_id: string }).student_id)));
  let created = 0;
  for (const id of ids) {
    try { created += await syncStudentGoogleEvents(id); } catch { /* einzelne best effort */ }
  }
  return json({ connected: true, students: ids.length, created });
}
