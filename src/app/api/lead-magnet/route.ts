import { createClient as createAdmin } from "@supabase/supabase-js";
import { SITE, LEAD_MAGNET_PDF } from "@/lib/config";
import { sendEmail } from "@/lib/mail";

export const runtime = "nodejs";

const BASE_URL = "https://www.germanwithmarvin.com";

function admin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}
function json(d: unknown, s = 200) { return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } }); }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Lead-Magnet: E-Mail rein → Lead speichern + A1-Story-PDF per Mail schicken
// (plus Trial-CTA). Die Seite zeigt zusätzlich einen Direkt-Download.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const marketing = Boolean(body.marketing);
  const source = typeof body.source === "string" ? body.source.slice(0, 60) : "a1-stories";
  if (!EMAIL_RE.test(email)) return json({ error: "Please enter a valid email." }, 400);

  // Lead merken (best effort – Fehler hier dürfen die Auslieferung nicht stoppen).
  try {
    await admin().from("leads").upsert(
      { email, source, marketing_consent: marketing, updated_at: new Date().toISOString() },
      { onConflict: "email" },
    );
  } catch { /* egal */ }

  const pdfUrl = `${BASE_URL}${LEAD_MAGNET_PDF}`;
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#2a1a12;">
    <h1 style="color:#8A3030;font-size:22px;margin:0 0 12px;">Your free A1 German story 📖</h1>
    <p style="font-size:15px;line-height:1.55;margin:0 0 18px;">Here's your free story — a gentle, fun way to start reading German from day one. Enjoy!</p>
    <p style="margin:22px 0;">
      <a href="${pdfUrl}" style="background:#E3A12F;color:#2a0f0f;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;display:inline-block;">Download your story (PDF)</a>
    </p>
    <p style="font-size:15px;line-height:1.55;">Want the full path from A1 to B2 — video lessons, 2,600+ flashcards and more? Try everything free for 5 days:</p>
    <p style="margin:16px 0;">
      <a href="${BASE_URL}/register" style="color:#8A3030;font-weight:700;">Start your 5-day free trial →</a>
    </p>
    <hr style="border:none;border-top:1px solid #eadfce;margin:24px 0;">
    <p style="font-size:12px;color:#9a8a7a;">German with Marvin · Reply to this email to reach your teacher.</p>
  </div>`;
  const text = `Your free A1 German story is ready.\n\nDownload (PDF): ${pdfUrl}\n\nWant the full path from A1 to B2? Try everything free for 5 days: ${BASE_URL}/register\n\nGerman with Marvin`;

  const sent = await sendEmail({
    to: email,
    replyTo: SITE.contactEmail,
    subject: "Your free A1 German story 📖",
    html,
    text,
  });

  // Direkt-Download-URL zurückgeben, damit die Seite sofort anbieten kann.
  return json({ ok: true, emailed: sent, pdfUrl });
}
