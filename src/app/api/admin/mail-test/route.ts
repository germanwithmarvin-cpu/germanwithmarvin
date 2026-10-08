import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/mail";

export const runtime = "nodejs";

function json(d: unknown, s = 200) {
  return new Response(JSON.stringify(d, null, 2), { status: s, headers: { "Content-Type": "application/json" } });
}

// Diagnose des E-Mail-Versands (Resend). Im Browser als eingeloggter Lehrer
// aufrufbar: /api/admin/mail-test — zeigt, ob RESEND_API_KEY und MAIL_FROM
// gesetzt sind, ob der Versand an Schüler bereit ist, und schickt dir eine
// echte Test-Mail an deine eigene Adresse.
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Not signed in" }, 401);

  let isTeacher = false;
  const rpc = await supabase.rpc("is_teacher");
  if (rpc.data === true) isTeacher = true;
  else {
    const { data: profile } = await supabase.from("profiles").select("is_teacher").eq("id", user.id).maybeSingle();
    isTeacher = Boolean(profile?.is_teacher);
  }
  if (!isTeacher) return json({ error: "Teachers only." }, 403);

  const hasResendKey = Boolean(process.env.RESEND_API_KEY);
  const mailFrom = process.env.MAIL_FROM ?? null;
  // Ohne MAIL_FROM nutzt der Code onboarding@resend.dev — das stellt NUR an die
  // eigene Resend-Adresse zu, nicht an Schüler. Bereit für Schüler = Key gesetzt
  // UND MAIL_FROM auf der verifizierten Domain.
  const readyForStudents = hasResendKey && Boolean(mailFrom && mailFrom.includes("germanwithmarvin.com"));

  let testEmailSentTo: string | null = null;
  let sendError: string | null = null;
  if (hasResendKey && user.email) {
    try {
      const ok = await sendEmail({
        to: user.email,
        subject: "German with Marvin — mail test ✅",
        text: "Test email from your app. If you received this, Resend sending works.",
        html: "<p>Test email from your app. If you received this, <b>Resend sending works</b>.</p>",
      });
      testEmailSentTo = ok ? user.email : null;
      if (!ok) sendError = "Resend returned a non-OK response (check the API key / domain).";
    } catch (e) {
      sendError = (e as Error).message;
    }
  }

  return json({
    hasResendKey,
    mailFrom: mailFrom ?? "(not set → falls back to onboarding@resend.dev; delivers only to your own Resend address)",
    readyForStudents,
    testEmailSentTo,
    sendError,
    hint: readyForStudents
      ? "All set — emails to students will send."
      : "Set MAIL_FROM in Vercel to: German with Marvin <marvin@germanwithmarvin.com>, then redeploy.",
  });
}
