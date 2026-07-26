import { createClient } from "@/lib/supabase/server";
import { authUrl, googleConfigured } from "@/lib/google";

export const runtime = "nodejs";

// Startet den Google-OAuth-Login. Für jeden Buchungs-Lehrer (Marvin oder weitere);
// die teacher_id reist im OAuth-state mit, damit der Callback den Token beim
// richtigen Lehrer speichert.
export async function GET(req: Request) {
  if (!googleConfigured()) return new Response("Google not configured (set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET).", { status: 500 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.redirect(new URL("/login", req.url));
  const { data: teacher } = await supabase.from("teachers").select("id").eq("user_id", user.id).maybeSingle();
  if (!teacher) return new Response("Only a teacher can connect a calendar.", { status: 403 });

  const origin = new URL(req.url).origin;
  const redirectUri = `${origin}/api/google/callback`;
  return Response.redirect(authUrl(redirectUri, `t:${teacher.id}`));
}
