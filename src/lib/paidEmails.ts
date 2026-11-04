// Nachkauf-Sequenz für zahlende Monats-Kunden (Englisch, wie die Schüler-UI):
// Onboarding → erster Erfolg → Lern-Rhythmus → Reaktivierung → Fortschritt →
// Jahresabo-Upsell. Der Cron entscheidet anhand der Tage seit Kauf, welche Stufe
// fällig ist. Nurture-/Angebots-Mails nur mit Werbe-Einwilligung; jede Mail
// trägt einen 1-Klick-Abmeldelink.

import { SITE, APP_PRICE_MONTHLY, APP_YEARLY_TOTAL, APP_YEARLY_PER_MONTH } from "@/lib/config";
import { sendEmail } from "@/lib/mail";
import { unsubUrl } from "@/lib/unsubscribe";

const BASE_URL = "https://www.germanwithmarvin.com";

// Reihenfolge = Priorität; `day` = Tage nach Kauf, ab wann die Stufe fällig ist.
export const PAID_STAGES = [
  { key: "onboarding", day: 0 },
  { key: "first_win", day: 2 },
  { key: "rhythm", day: 5 },
  { key: "comeback", day: 10 },
  { key: "progress", day: 21 },
  { key: "annual", day: 25 },
] as const;

export type PaidStage = (typeof PAID_STAGES)[number]["key"];

type Content = { subject: string; heading: string; intro: string; cta: string; href: string; bullets?: string[]; proof?: string; outro?: string };

// Jahresersparnis ggü. Monatsabo (12 × Monatspreis − Jahrespreis), z. B. $120.
const ANNUAL_SAVING = Math.max(0, APP_PRICE_MONTHLY * 12 - APP_YEARLY_TOTAL);

function contentFor(stage: PaidStage, firstName: string): Content {
  const hi = firstName ? `Hi ${firstName},` : "Hi,";
  switch (stage) {
    case "onboarding":
      return {
        subject: "You're in 🎉 Here's your clear path to B2",
        heading: "Welcome to the full course!",
        intro: `${hi} you now have everything unlocked — all video lessons A1–B2, 2,600+ flashcards in my own voice, stories, exercises and the exam trainer. The secret isn't doing more, it's following one path. Here's how to start strong:`,
        bullets: [
          "Open your dashboard and start at your level — the lessons build on each other.",
          "Do today's flashcards (5 minutes) — that's what makes words stick.",
          "When you're ready for a test, the exam trainer gives you instant feedback.",
        ],
        cta: "Open your dashboard",
        href: `${BASE_URL}/dashboard`,
        outro: "Reply to this email anytime — I read them.",
      };
    case "first_win":
      return {
        subject: "Your first win: sound natural with these 💬",
        heading: "A quick win for today",
        intro: `${hi} small, natural phrases make you sound fluent faster than big grammar. Drop these into your day and they'll stick:`,
        bullets: [
          "„Alles klar?“ — a casual „all good? / got it?“",
          "„Genau.“ — „exactly“ (Germans say this constantly).",
          "„Ich hätte gern …“ — the polite way to order or ask for something.",
        ],
        cta: "Practice today's lesson",
        href: `${BASE_URL}/dashboard`,
      };
    case "rhythm":
      return {
        subject: "The 10-minute rhythm that actually works ⏱️",
        heading: "Make it a habit, not a chore",
        intro: `${hi} the learners who get to B2 aren't the ones who study for hours — they're the ones who show up for 10 minutes most days. A rhythm that works:`,
        bullets: [
          "1 short lesson to learn something new.",
          "5 minutes of flashcards to lock in words.",
          "Once a week, one exam-trainer section to test yourself.",
        ],
        cta: "Do today's 10 minutes",
        href: `${BASE_URL}/dashboard`,
      };
    case "comeback":
      return {
        subject: "Your German is waiting for you 👋",
        heading: "Pick up where you left off",
        intro: `${hi} haven't seen you in a few days — totally normal, life gets busy. The good news: your progress is saved and you can jump straight back in where you stopped. Even 5 minutes today keeps your momentum alive.`,
        cta: "Jump back in",
        href: `${BASE_URL}/dashboard`,
      };
    case "progress":
      return {
        subject: "Three weeks in — look how far you've come 📈",
        heading: "You're building something real",
        intro: `${hi} three weeks of steady practice adds up more than you think. If you've been consistent, you're ready to push a little: try a lesson one notch harder, or take a full mock exam in the exam trainer to see where you stand.`,
        proof: `"I learn a lot and still have a lot of fun in his classes." — Tânia`,
        cta: "Try the exam trainer",
        href: `${BASE_URL}/exams`,
      };
    case "annual":
      return {
        subject: `Save $${ANNUAL_SAVING} a year on your German 🎁`,
        heading: "A quieter way to pay — and save",
        intro: `${hi} you're clearly in this for real — so here's a thank-you option. Switch to the yearly plan and pay $${APP_YEARLY_TOTAL} once (that's $${APP_YEARLY_PER_MONTH}/month) instead of $${APP_PRICE_MONTHLY}/month. You save about $${ANNUAL_SAVING} a year, it never auto-renews, and you can just learn without a monthly charge on your mind.`,
        cta: "See the yearly plan",
        href: `${BASE_URL}/pricing`,
      };
  }
}

function html(c: Content, unsub: string): string {
  const bullets = c.bullets ? `<ul style="font-size:15px;line-height:1.6;margin:0 0 20px;padding-left:20px;color:#2a1a12;">${c.bullets.map((b) => `<li style="margin:0 0 6px;">${b}</li>`).join("")}</ul>` : "";
  const proof = c.proof ? `<p style="font-size:14px;font-style:italic;color:#6b5a4a;border-left:3px solid #E3A12F;padding:4px 0 4px 12px;margin:0 0 20px;">${c.proof}</p>` : "";
  const outro = c.outro ? `<p style="font-size:14px;color:#6b5a4a;margin:18px 0 0;">${c.outro}</p>` : "";
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#2a1a12;">
    <h1 style="color:#8A3030;font-size:22px;margin:0 0 12px;">${c.heading}</h1>
    <p style="font-size:15px;line-height:1.55;margin:0 0 20px;">${c.intro}</p>
    ${bullets}
    ${proof}
    <p style="margin:24px 0;">
      <a href="${c.href}" style="background:#8A3030;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;display:inline-block;">${c.cta}</a>
    </p>
    ${outro}
    <hr style="border:none;border-top:1px solid #eadfce;margin:24px 0;">
    <p style="font-size:12px;color:#9a8a7a;line-height:1.5;">
      German with Marvin · Reply to this email to reach your teacher.<br>
      Don't want these emails? <a href="${unsub}" style="color:#9a8a7a;">Unsubscribe</a>.
    </p>
  </div>`;
}

function text(c: Content, unsub: string): string {
  const bullets = c.bullets ? c.bullets.map((b) => `• ${b}`).join("\n") + "\n\n" : "";
  const proof = c.proof ? `${c.proof}\n\n` : "";
  const outro = c.outro ? `${c.outro}\n\n` : "";
  return `${c.intro}\n\n${bullets}${proof}${c.cta}: ${c.href}\n\n${outro}—\nGerman with Marvin · reply to reach your teacher.\nUnsubscribe: ${unsub}`;
}

export async function sendPaidStage(stage: PaidStage, to: string, userId: string, fullName?: string | null): Promise<boolean> {
  const firstName = fullName ? fullName.split(" ")[0] : "";
  const c = contentFor(stage, firstName);
  const unsub = unsubUrl(BASE_URL, userId);
  return sendEmail({
    to,
    replyTo: SITE.contactEmail,
    subject: c.subject,
    html: html(c, unsub),
    text: text(c, unsub),
  });
}
