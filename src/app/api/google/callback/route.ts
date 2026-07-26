import { createClient } from "@/lib/supabase/server";
import { exchangeCode } from "@/lib/google";

export const runtime = "nodejs";

// Google leitet nach dem Login hierher zurück.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const origin = url.origin;

  // Nur ein Buchungs-Lehrer darf den Token setzen. Welcher Lehrer: aus dem
  // OAuth-state (t:<id>), gegen den eingeloggten Nutzer verifiziert.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: teacher } = user
    ? await supabase.from("teachers").select("id").eq("user_id", user.id).maybeSingle()
    : { data: null };
  if (!teacher) return Response.redirect(new URL("/booking", origin));

  if (!code) return Response.redirect(new URL("/booking?google=error", origin));

  // Token immer beim eingeloggten Lehrer speichern (nicht dem state vertrauen).
  const { error } = await exchangeCode(code, `${origin}/api/google/callback`, teacher.id);
  return Response.redirect(new URL(`/booking?google=${error ? "error" : "connected"}`, origin));
}
