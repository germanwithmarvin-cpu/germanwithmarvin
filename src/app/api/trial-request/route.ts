import { createClient as createAdmin } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/mail";
import { SITE, PROBESTUNDE } from "@/lib/config";
import { nextProbestunde, formatInTz } from "@/lib/courseSchedule";

export const runtime = "nodejs";

function admin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}
function json(d: unknown, s = 200) {
  return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } });
}
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Öffentliche Probestunden-Anfrage (kein Login, kein Stripe). Speichert die
// Anfrage, bestätigt dem Interessenten den FESTEN Termin (+ Join-Link) und
// benachrichtigt Marvin. Reines Lead-Capture — berührt das Buchungssystem nicht.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return json({ error: "Please enter a valid email." }, 400);
  if (!body.consent) return json({ error: "Please tick the consent box to continue." }, 400);
  const name = body.name ? String(body.name).slice(0, 120) : null;
  const preferred_time = body.preferred_time ? String(body.preferred_time).slice(0, 60) : null;

  const { startUtc } = nextProbestunde();
  const when = formatInTz(startUtc, PROBESTUNDE.timezone);
  const join = PROBESTUNDE.meetLink;

  try {
    const db = admin();
    await db.from("trial_requests").insert({ name, email, preferred_time, source: "probestunde", status: "new" });

    // 1) Bestätigung an den Interessenten
    const hi = name ? `Hi ${name.split(" ")[0]},` : "Hi,";
    const joinBtn = join
      ? `<p style="margin:22px 0;"><a href="${join}" style="background:#E3A12F;color:#2a0f0f;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;display:inline-block;">Join the lesson</a></p><p style="font-size:13px;color:#6b5a4a;">Or copy this link:<br><span style="word-break:break-all;">${join}</span></p>`
      : `<p style="font-size:14px;color:#6b5a4a;">We'll send you the join link before the lesson.</p>`;
    const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#2a1a12;">
      <h1 style="color:#8A3030;font-size:22px;margin:0 0 12px;">Your free B1 trial lesson 🎓</h1>
      <p style="font-size:15px;line-height:1.5;margin:0 0 16px;">${hi} thanks for signing up for a free live trial lesson. Here's the next one:</p>
      <div style="background:#FFF1D2;border:1px solid #e9d4a3;border-radius:12px;padding:16px 18px;">
        <div style="font-size:16px;font-weight:700;color:#8A3030;">${when}</div>
        <div style="font-size:13px;color:#6b5a4a;margin-top:4px;">Times shown in ${PROBESTUNDE.timezone}</div>
      </div>
      ${joinBtn}
      <p style="font-size:13px;color:#6b5a4a;">Can't make this time? Just reply to this email and we'll find another.</p>
      <hr style="border:none;border-top:1px solid #eadfce;margin:24px 0;">
      <p style="font-size:12px;color:#9a8a7a;">German with Marvin · Reply to this email to reach Marvin.</p>
    </div>`;
    const text = `${hi}\n\nThanks for signing up for a free live B1 trial lesson.\n\nNext lesson: ${when} (${PROBESTUNDE.timezone})\n${join ? `Join: ${join}\n` : "We'll send the join link before the lesson.\n"}\nCan't make it? Reply to this email.\n\nGerman with Marvin`;
    await sendEmail({ to: email, replyTo: SITE.contactEmail, subject: "Your free B1 trial lesson 🎓", html, text });

    // 2) Benachrichtigung an Marvin (zum Planen)
    await sendEmail({
      to: SITE.contactEmail,
      subject: `New trial-lesson request: ${name ?? email}`,
      html: `<p>New free trial lesson request:</p><ul><li>Name: ${name ?? "—"}</li><li>Email: ${email}</li><li>Preferred time: ${preferred_time ?? "—"}</li></ul>`,
      text: `New trial lesson request\nName: ${name ?? "—"}\nEmail: ${email}\nPreferred time: ${preferred_time ?? "—"}`,
    });
  } catch { /* best effort — darf das Formular nie blockieren */ }

  return json({ ok: true });
}
