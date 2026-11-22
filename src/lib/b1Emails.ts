// B1-Funnel-Mails: (1) Double-Opt-in-Bestätigung, (2) die 5-stufige Nachfass-Serie.
// Englisch, einfache Sätze, gleiche Marken-Optik wie die Trial-Mails.
//
// WICHTIG: Die Serien-Texte unten sind ENTWÜRFE (Betreff + Zweck). Marvin schreibt
// den finalen, persönlichen Text selbst. Jede Mail trägt einen 1-Klick-Abmeldelink,
// signiert über die E-Mail (kein Konto nötig).

import { SITE } from "@/lib/config";
import { sendEmail } from "@/lib/mail";
import { subjectToken } from "@/lib/unsubscribe";

const BASE_URL = "https://www.germanwithmarvin.com";

// Reihenfolge = Priorität; `day` = Tage nach Double-Opt-in-Bestätigung.
export const B1_STAGES = [
  { key: "result", day: 0 },        // Zweck 1: Ergebnis einordnen
  { key: "writing", day: 2 },       // Zweck 2: Fehler im Schreiben
  { key: "speaking", day: 4 },      // Zweck 3: Fehler im Sprechen
  { key: "trial_lesson", day: 6 },  // Zweck 4: Einladung zur Probestunde
  { key: "course_offer", day: 9 },  // Zweck 5: Kursangebot mit Frist
] as const;

export type B1Stage = (typeof B1_STAGES)[number]["key"];

type Content = { subject: string; heading: string; intro: string; cta: string; href: string };

// ENTWÜRFE — Betreff + Zweck. Marvin ersetzt `intro` durch seinen eigenen Text.
function contentFor(stage: B1Stage, firstName: string): Content {
  const hi = firstName ? `Hi ${firstName},` : "Hi,";
  switch (stage) {
    case "result":
      return {
        subject: "Your B1 test result — what it really means",
        heading: "Where you stand for B1",
        intro: `${hi} thanks for taking the free B1 test. [DRAFT — Marvin: explain their result in simple words and what the B1 exam needs.]`,
        cta: "See the B1 course",
        href: `${BASE_URL}/b1-course`,
      };
    case "writing":
      return {
        subject: "The B1 writing mistake almost everyone makes ✍️",
        heading: "Fix this in your writing",
        intro: `${hi} [DRAFT — Marvin: one clear, useful writing tip for the B1 exam (e.g. the formal letter).]`,
        cta: "Practice with a free test",
        href: `${BASE_URL}/b1-test`,
      };
    case "speaking":
      return {
        subject: "How to pass B1 speaking (even if you're nervous) 🗣️",
        heading: "Speaking: the part most people fear",
        intro: `${hi} [DRAFT — Marvin: one speaking tip + reassurance; how the course practises speaking.]`,
        cta: "See how the course works",
        href: `${BASE_URL}/b1-course`,
      };
    case "trial_lesson":
      return {
        subject: "Come to a free live B1 lesson 🎓",
        heading: "Try a free live lesson",
        intro: `${hi} [DRAFT — Marvin: invite to the free live trial lesson; what they'll get out of it.]`,
        cta: "Save my free spot",
        href: `${BASE_URL}/b1-course#trial`,
      };
    case "course_offer":
      return {
        subject: "B1 course — founder price for the first group",
        heading: "Your place in the B1 group",
        intro: `${hi} [DRAFT — Marvin: the course offer, founder price, start date and that spots are limited.]`,
        cta: "Join the B1 course",
        href: `${BASE_URL}/b1-course`,
      };
  }
}

function shell(heading: string, bodyHtml: string, unsub: string): string {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#2a1a12;">
    <h1 style="color:#8A3030;font-size:22px;margin:0 0 12px;">${heading}</h1>
    ${bodyHtml}
    <hr style="border:none;border-top:1px solid #eadfce;margin:24px 0;">
    <p style="font-size:12px;color:#9a8a7a;line-height:1.5;">
      German with Marvin · Reply to this email to reach Marvin.<br>
      Don't want these emails? <a href="${unsub}" style="color:#9a8a7a;">Unsubscribe</a>.
    </p>
  </div>`;
}

function stageHtml(c: Content, unsub: string): string {
  const body = `
    <p style="font-size:15px;line-height:1.55;margin:0 0 20px;">${c.intro}</p>
    <p style="margin:24px 0;">
      <a href="${c.href}" style="background:#8A3030;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;display:inline-block;">${c.cta}</a>
    </p>`;
  return shell(c.heading, body, unsub);
}

function stageText(c: Content, unsub: string): string {
  return `${c.intro}\n\n${c.cta}: ${c.href}\n\n—\nGerman with Marvin · reply to reach Marvin.\nUnsubscribe: ${unsub}`;
}

function unsubFor(email: string): string {
  return `${BASE_URL}/api/b1/unsubscribe?e=${encodeURIComponent(email)}&t=${subjectToken(email)}`;
}

export async function sendB1Stage(stage: B1Stage, to: string, fullName?: string | null): Promise<boolean> {
  const firstName = fullName ? fullName.split(" ")[0] : "";
  const c = contentFor(stage, firstName);
  const unsub = unsubFor(to);
  return sendEmail({
    to,
    replyTo: SITE.contactEmail,
    subject: c.subject,
    html: stageHtml(c, unsub),
    text: stageText(c, unsub),
  });
}

// Double-Opt-in: Bestätigungsmail mit signiertem Link.
export async function sendB1Confirm(to: string, fullName?: string | null): Promise<boolean> {
  const firstName = fullName ? fullName.split(" ")[0] : "";
  const hi = firstName ? `Hi ${firstName},` : "Hi,";
  const confirmUrl = `${BASE_URL}/api/b1/confirm?e=${encodeURIComponent(to)}&t=${subjectToken(to)}`;
  const body = `
    <p style="font-size:15px;line-height:1.55;margin:0 0 20px;">${hi} please confirm your email to get your free B1 tips and your practice test follow-up. One click:</p>
    <p style="margin:24px 0;">
      <a href="${confirmUrl}" style="background:#8A3030;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;display:inline-block;">Confirm my email</a>
    </p>
    <p style="font-size:13px;color:#6b5a4a;">If you didn't request this, you can ignore this email — nothing will be sent.</p>`;
  // In der Bestätigungsmail noch KEIN Abmeldelink nötig (es ist noch kein Abo).
  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#2a1a12;">
    <h1 style="color:#8A3030;font-size:22px;margin:0 0 12px;">Confirm your email</h1>
    ${body}
    <hr style="border:none;border-top:1px solid #eadfce;margin:24px 0;">
    <p style="font-size:12px;color:#9a8a7a;">German with Marvin</p>
  </div>`;
  const text = `${hi} please confirm your email to get your free B1 tips:\n\n${confirmUrl}\n\nIf you didn't request this, just ignore this email.\n\nGerman with Marvin`;
  return sendEmail({ to, replyTo: SITE.contactEmail, subject: "Please confirm your email", html, text });
}
