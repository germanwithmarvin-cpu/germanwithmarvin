import { createClient } from "@/lib/supabase/server";
import { authUrl, googleConfigured } from "@/lib/google";

export const runtime = "nodejs";

// Startet den Google-OAuth-Login (nur Lehrer).
export async function GET(req: Request) {
  if (!googleConfigured()) return new Response("Google not configured (set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET).", { status: 500 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.redirect(new URL("/login", req.url));
  const { data: profile } = await supabase.from("profiles").select("is_teacher").eq("id", user.id).single();
  if (!profile?.is_teacher) return new Response("Only the teacher can connect a calendar.", { status: 403 });

  const origin = new URL(req.url).origin;
  const redirectUri = `${origin}/api/google/callback`;
  return Response.redirect(authUrl(redirectUri, "teacher"));
}
