import { createClient } from "@/lib/supabase/server";
import { diagnose } from "@/lib/google";

export const runtime = "nodejs";

// Diagnose der Google-Verbindung (nur Lehrer). Aufruf: /api/google/debug
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "not signed in" }, 401);
  const { data: profile } = await supabase.from("profiles").select("is_teacher").eq("id", user.id).single();
  if (!profile?.is_teacher) return json({ error: "teacher only" }, 403);
  return json(await diagnose());
}

function json(d: unknown, s = 200) {
  return new Response(JSON.stringify(d, null, 2), { status: s, headers: { "Content-Type": "application/json" } });
}
