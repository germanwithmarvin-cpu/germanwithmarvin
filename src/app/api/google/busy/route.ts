import { createClient } from "@/lib/supabase/server";
import { busyIntervals } from "@/lib/google";

export const runtime = "nodejs";

// Belegte Zeiten aus dem Google-Kalender des Lehrers (zum Ausblenden von Slots).
export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ busy: [] }), { headers: { "Content-Type": "application/json" } });

  const url = new URL(req.url);
  const from = url.searchParams.get("from") ?? new Date().toISOString();
  const to = url.searchParams.get("to") ?? new Date(Date.now() + 30 * 86400e3).toISOString();
  // Belegtzeiten des gewählten Lehrers (Default 1 = Marvin) – zum Ausblenden von Slots.
  const teacherId = Number.isFinite(Number(url.searchParams.get("teacher"))) ? Math.round(Number(url.searchParams.get("teacher"))) : 1;
  const busy = await busyIntervals(from, to, teacherId);
  return new Response(JSON.stringify({ busy }), { headers: { "Content-Type": "application/json" } });
}
