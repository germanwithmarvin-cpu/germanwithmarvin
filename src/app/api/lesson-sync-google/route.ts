import { createClient } from "@/lib/supabase/server";
import { syncStudentGoogleEvents } from "@/lib/google";

export const runtime = "nodejs";

function json(d: unknown, s = 200) {
  return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } });
}

// Legt fehlende Google-Termine für die künftigen Buchungen des eingeloggten
// Schülers an (v. a. die per feste-Zeit materialisierten). Best effort.
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Not signed in" }, 401);

  try {
    const synced = await syncStudentGoogleEvents(user.id);
    return json({ synced });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
}
