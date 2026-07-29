import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { SITE } from "@/lib/config";

export const runtime = "nodejs";

function admin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}
function json(d: unknown, s = 200) { return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } }); }

// Schüler antwortet in seiner Konversation. Insert läuft über den Nutzer-Client
// (RLS erzwingt: eigene, OFFENE Konversation, sender='student'). Danach E-Mail an
// den Lehrer – nur wenn RESEND_API_KEY gesetzt ist, sonst still (Antwort ist
// trotzdem im Lehrerbereich sichtbar).
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Not signed in" }, 401);

  const { conversationId, body } = await req.json().catch(() => ({}));
  const text = String(body ?? "").trim();
  if (!conversationId || !text) return json({ error: "Missing message" }, 400);
  if (text.length > 4000) return json({ error: "Message too long" }, 400);

  const { error } = await supabase.from("messages").insert({ conversation_id: conversationId, sender: "student", body: text });
  if (error) return json({ error: error.message }, 400);

  // last_message_at aktualisieren (Schüler darf conversations nicht updaten -> Admin).
  try { await admin().from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversationId); } catch { /* egal */ }

  // E-Mail an den Lehrer (best effort).
  const key = process.env.RESEND_API_KEY;
  if (key) {
    const who = (user.user_metadata?.full_name as string) || user.email || "a student";
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.MAIL_FROM || "German with Marvin <onboarding@resend.dev>",
          to: [SITE.contactEmail],
          reply_to: user.email || undefined,
          subject: `New reply from ${who}`,
          text: `${who} replied:\n\n${text}\n\nOpen the Teacher area → Students to answer.`,
        }),
      });
    } catch { /* egal */ }
  }

  return json({ ok: true });
}
