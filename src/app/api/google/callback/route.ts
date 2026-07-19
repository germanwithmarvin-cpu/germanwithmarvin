import { createClient } from "@/lib/supabase/server";
import { exchangeCode } from "@/lib/google";

export const runtime = "nodejs";

// Google leitet nach dem Login hierher zurück.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const origin = url.origin;

  // Nur der Lehrer darf den Token setzen.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("is_teacher").eq("id", user.id).single();
    if (!profile?.is_teacher) return Response.redirect(new URL("/booking", origin));
  }

  if (!code) return Response.redirect(new URL("/booking?google=error", origin));

  const { error } = await exchangeCode(code, `${origin}/api/google/callback`);
  return Response.redirect(new URL(`/booking?google=${error ? "error" : "connected"}`, origin));
}
