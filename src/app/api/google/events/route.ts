import { createClient } from "@/lib/supabase/server";
import { listEvents } from "@/lib/google";

export const runtime = "nodejs";

// Alle Google-Termine des Lehrers (mit Titel) für die Wochenansicht. Nur Lehrer.
export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ events: [] });
  const { data: profile } = await supabase.from("profiles").select("is_teacher").eq("id", user.id).single();
  if (!profile?.is_teacher) return json({ events: [] });

  const url = new URL(req.url);
  const from = url.searchParams.get("from") ?? new Date(Date.now() - 7 * 86400e3).toISOString();
  const to = url.searchParams.get("to") ?? new Date(Date.now() + 42 * 86400e3).toISOString();
  return json({ events: await listEvents(from, to) });
}

function json(d: unknown) {
  return new Response(JSON.stringify(d), { headers: { "Content-Type": "application/json" } });
}
