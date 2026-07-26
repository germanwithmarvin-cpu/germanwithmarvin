import { createClient } from "@/lib/supabase/server";
import { getConnection, googleConfigured } from "@/lib/google";

export const runtime = "nodejs";

function json(d: unknown, s = 200) { return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } }); }

// Verbindungsstatus des eingeloggten Buchungs-Lehrers (pro teacher_id).
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ connected: false, configured: false });
  const { data: teacher } = await supabase.from("teachers").select("id").eq("user_id", user.id).maybeSingle();
  if (!teacher) return json({ connected: false, configured: false });
  const conn = await getConnection(teacher.id);
  return json({ ...conn, configured: googleConfigured() });
}

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "no auth" }, 401);
  const { data: teacher } = await supabase.from("teachers").select("id").eq("user_id", user.id).maybeSingle();
  if (!teacher) return json({ error: "forbidden" }, 403);
  const { disconnect } = await import("@/lib/google");
  await disconnect(teacher.id);
  return json({ ok: true });
}
