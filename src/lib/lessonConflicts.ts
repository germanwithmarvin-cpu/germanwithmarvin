import type { SupabaseClient } from "@supabase/supabase-js";

// Prüft, ob sich das Zeitfenster [startISO, endISO) mit einer anderen aktiven
// Stunde desselben Lehrers überschneidet. Lückenlos: filtert direkt per
// Intervall-Überlappung (starts_at < neues Ende UND ends_at > neuer Start), also
// unabhängig von der Dauer der bestehenden Buchungen. excludeId klammert die
// gerade verschobene Buchung aus.
export async function hasBookingConflict(
  db: SupabaseClient,
  teacherId: number,
  startISO: string,
  endISO: string,
  excludeId?: string,
): Promise<boolean> {
  let q = db
    .from("lesson_bookings")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("status", "booked")
    .lt("starts_at", endISO)
    .gt("ends_at", startISO)
    .limit(1);
  if (excludeId) q = q.neq("id", excludeId);
  const { data } = await q;
  return (data?.length ?? 0) > 0;
}
