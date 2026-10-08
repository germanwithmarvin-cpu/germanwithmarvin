// Trial-Nachfass-Sequenz (Englisch, wie die gesamte Schüler-UI). Eine Mail pro
// Stufe; der Cron entscheidet anhand der Tage seit Anmeldung, welche fällig ist.
//
// Angebots-Mails gehen nur an Nutzer mit Werbe-Einwilligung (siehe
// trial_email_candidates), und jede Mail trägt einen 1-Klick-Abmeldelink.

import { SITE, LEAD_MAGNET_PDF } from "@/lib/config";
import { sendEmail } from "@/lib/mail";
import { unsubUrl } from "@/lib/unsubscribe";

const BASE_URL = "https://www.germanwithmarvin.com";

// Reihenfolge = Priorität; `day` = Tage nach Anmeldung, ab wann die Stufe fällig ist.
export const TRIAL_STAGES = [
  { key: "welcome", day: 0 },
  { key: "first_lesson", day: 1 },
  { key: "streak", day: 3 },
  { key: "ends_tomorrow", day: 4 },
  { key: "last_day", day: 5 },
  { key: "winback", day: 8 },
  { key: "final", day: 20 },
] as const;

export type TrialStage = (typeof TRIAL_STAGES)[number]["key"];

type Content = { subject: string; heading: string; intro: string; cta: string; href: string; gift?: { label: string; url: string } };

function contentFor(stage: TrialStage, firstName: string): Content {
  const hi = firstName ? `Hi ${firstName},` : "Hi,";
  switch (stage) {
    case "welcome":
      return {
        subject: "Welcome 🎉 Here's your free A1 story + your trial",
        heading: "Welcome!",
        intro: `${hi} your 5-day full-access trial just started — and here's a little welcome gift: a free A1 German story to get you reading from day one. Everything else is unlocked too: video lessons, 2,600+ flashcards, stories and the vocab game.`,
        cta: "Start your first lesson",
        href: `${BASE_URL}/dashboard`,
        gift: { label: "Download your A1 story 📖", url: `${BASE_URL}${LEAD_MAGNET_PDF}` },
      };
    case "first_lesson":
      return {
        subject: "Your first German lesson takes 10 minutes ⏱️",
        heading: "Ready for lesson 1?",
        intro: `${hi} the hardest part is just starting. Your first lesson is short and clear — ten minutes and you'll already understand something new in German.`,
        cta: "Open your first lesson",
        href: `${BASE_URL}/dashboard`,
      };
    case "streak":
      return {
        subject: "You're building momentum 🔥",
        heading: "Keep your streak going",
        intro: `${hi} a few minutes a day beats cramming every time. Keep the words fresh with today's flashcards — that's how real progress happens.`,
        cta: "Practice today",
        href: `${BASE_URL}/dashboard`,
      };
    case "ends_tomorrow":
      return {
        subject: "Your free trial ends tomorrow ⏳",
        heading: "One day left on your trial",
        intro: `${hi} your full access ends tomorrow. To keep everything — all levels A1–B2, flashcards and stories — pick a plan. Best value: $19/month, billed yearly.`,
        cta: "Keep my access",
        href: `${BASE_URL}/pricing`,
      };
    case "last_day":
      return {
        subject: "Last day of your free trial",
        heading: "Today's your last trial day",
        intro: `${hi} don't lose your momentum. Continue for $29/month, or $19/month billed yearly — the monthly plan can be cancelled anytime.`,
        cta: "Choose your plan",
        href: `${BASE_URL}/pricing`,
      };
    case "winback":
      return {
        subject: "Still want to speak German? 🇩🇪",
        heading: "Your spot is still here",
        intro: `${hi} life gets busy — no problem. Everything you started is saved. Come back for $19/month (billed yearly) and keep going right where you left off.`,
        cta: "Come back",
        href: `${BASE_URL}/pricing`,
      };
    case "final":
      return {
        subject: "Your German is waiting whenever you are 🎁",
        heading: "We saved your place",
        intro: `${hi} whenever you're ready, your account and progress are still here. Dip back in anytime with the free A1 content — and when you want the full path to B2, we've got you.`,
        cta: "Pick up where you left off",
        href: `${BASE_URL}/dashboard`,
      };
  }
}

function html(c: Content, unsub: string): string {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#2a1a12;">
    <h1 style="color:#8A3030;font-size:22px;margin:0 0 12px;">${c.heading}</h1>
    <p style="font-size:15px;line-height:1.55;margin:0 0 20px;">${c.intro}</p>
    ${c.gift ? `<div style="background:#FBF2DA;border:1px solid #e9d4a3;border-radius:12px;padding:16px;margin:0 0 10px;text-align:center;">
      <div style="font-size:13px;color:#8A3030;font-weight:700;">🎁 Your welcome gift</div>
      <p style="font-size:14px;margin:6px 0 12px;color:#4a3528;">A free A1 German story — the fun way to start reading from day one.</p>
      <a href="${c.gift.url}" style="background:#E3A12F;color:#2a0f0f;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:9px;display:inline-block;">${c.gift.label}</a>
    </div>` : ""}
    <p style="margin:24px 0;">
      <a href="${c.href}" style="background:#8A3030;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;display:inline-block;">${c.cta}</a>
    </p>
    <hr style="border:none;border-top:1px solid #eadfce;margin:24px 0;">
    <p style="font-size:12px;color:#9a8a7a;line-height:1.5;">
      German with Marvin · Reply to this email to reach your teacher.<br>
      Don't want these emails? <a href="${unsub}" style="color:#9a8a7a;">Unsubscribe</a>.
    </p>
  </div>`;
}

function text(c: Content, unsub: string): string {
  return `${c.intro}\n\n${c.gift ? `Your free A1 story: ${c.gift.url}\n\n` : ""}${c.cta}: ${c.href}\n\n—\nGerman with Marvin · reply to reach your teacher.\nUnsubscribe: ${unsub}`;
}

export async function sendTrialStage(stage: TrialStage, to: string, userId: string, fullName?: string | null): Promise<boolean> {
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
