// B1-Funnel-Mails: (1) Double-Opt-in-Bestätigung, (2) die 5-stufige Nachfass-Serie.
// Englisch, einfache Sätze, gleiche Marken-Optik wie die Trial-Mails.
//
// Die Serien-Texte sind ausgeschrieben (Englisch, einfache Sätze) — Marvin feilt
// wie gewohnt nach. Jede Mail trägt einen 1-Klick-Abmeldelink, signiert über die
// E-Mail (kein Konto nötig).

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

type Content = { subject: string; heading: string; paras: string[]; cta: string; href: string };

// Ausgeschriebene Serientexte (Marvin feilt wie gewohnt nach). `paras` = Absätze;
// der erste beginnt mit der Begrüßung. Betreff + CTA je Stufe.
function contentFor(stage: B1Stage, firstName: string): Content {
  const hi = firstName ? `Hi ${firstName},` : "Hi,";
  switch (stage) {
    case "result":
      return {
        subject: "Your B1 test result — what it really means",
        heading: "Where you stand for B1",
        paras: [
          `${hi} thanks for taking the free B1 test. It takes a bit of courage to check where you really stand — so, well done.`,
          `Here is the honest picture. The B1 exam has four parts: reading, listening, writing and speaking. Almost everyone is strong in one or two and weaker in the others. That is completely normal. The exam does not test how clever you are — it tests a few clear skills that you can learn and practise.`,
          `If you need B1 for your Einbürgerung or your residence permit, here is the good news: with a clear plan and a little guidance, the gap closes faster than you think. I have taken many students all the way to their certificate, including people who felt far from ready at the start.`,
          `Over the next days I will send you a few short, practical tips for the parts most people find hard — writing and speaking. No long theory, just what really helps in the exam. If you want to see the full plan now, have a look at my 8-week B1 course — a small live group, taught by me.`,
        ],
        cta: "See the B1 course",
        href: `${BASE_URL}/b1-course`,
      };
    case "writing":
      return {
        subject: "The B1 writing mistake almost everyone makes ✍️",
        heading: "Fix this in your writing",
        paras: [
          `${hi} in the B1 exam you have to write a short letter or email — for example to a friend, or a more formal message like a request or a complaint.`,
          `Here is the mistake I see most often: people try to write long, "clever" sentences, and then get lost in the grammar. In B1, short and clear wins. Three correct short sentences are worth far more than one long, broken one.`,
          `A simple recipe that works: start with a greeting, say why you are writing in the very first sentence, give your points one by one, and finish with a polite closing. Use the words you are sure about. The examiner wants to see that you can communicate — not that you can write poetry.`,
          `One more tip: learn five or six fixed phrases for letters (how to begin and end politely, how to ask for something). You will use them in almost every writing task. Want to test yourself in the real exam format? You can take the free practice test again any time.`,
        ],
        cta: "Practice with a free test",
        href: `${BASE_URL}/b1-test`,
      };
    case "speaking":
      return {
        subject: "How to pass B1 speaking (even if you're nervous) 🗣️",
        heading: "Speaking: the part most people fear",
        paras: [
          `${hi} almost everyone is nervous about the speaking part. If that is you, you are in very good company — and it is one of the most learnable parts of all.`,
          `The secret: the examiner does not expect perfect German. They want to see that you can keep a conversation going. So it is better to say something simple and keep talking than to stop and search for the perfect word.`,
          `Two things that help a lot. First, learn a few small phrases to buy yourself time, like "Moment, lass mich kurz überlegen…". They sound natural and keep you calm. Second, practise out loud, even when you are alone — saying your answers is not the same as reading them in your head.`,
          `In my course we practise speaking live, every week, in a small group at your level. You get used to talking — so on exam day it feels normal, not scary.`,
        ],
        cta: "See how the course works",
        href: `${BASE_URL}/b1-course`,
      };
    case "trial_lesson":
      return {
        subject: "Come to a free live B1 lesson 🎓",
        heading: "Try a free live lesson",
        paras: [
          `${hi} you have had a few tips from me by email. Now I would like to invite you to something better: a free live B1 lesson with me, online.`,
          `It is a relaxed group lesson. You can meet me, see exactly how I teach, practise a little, and ask all your questions about the exam and the course. No payment and no account needed.`,
          `Come and feel for yourself whether this is the right way for you to reach B1. Most people leave the trial lesson calmer about the exam — because they finally have a clear plan.`,
          `Because it is a live lesson, the number of spots is limited. Save yours below.`,
        ],
        cta: "Save my free spot",
        href: `${BASE_URL}/b1-course#trial`,
      };
    case "course_offer":
      return {
        subject: "Your place in the B1 group",
        heading: "Join the B1 group course",
        paras: [
          `${hi} if you are serious about passing B1 for your Einbürgerung or residence permit, here is the clearest path I can offer you.`,
          `My B1 Exam Prep is an 8-week live course, taught by me, in a small group of no more than 10 people. We meet twice a week and cover everything the exam tests — reading, listening, writing and speaking — with your own homework and personal feedback from me.`,
          `You also get my complete learning app included free for the whole course (normally $29/month): video lessons, the flashcard trainer, grammar, reading stories and an exam trainer. It is your practice toolkit between our live classes.`,
          `The price is a single payment of €290 (plus tax). The group is small on purpose, so places are limited. And it is safe: if too few people join, the course does not start and you get your money back.`,
          `If you want in, join below. And if you have a question first, just reply to this email — it comes straight to me.`,
        ],
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
  const paras = c.paras
    .map((p) => `<p style="font-size:15px;line-height:1.55;margin:0 0 14px;">${p}</p>`)
    .join("");
  const body = `
    ${paras}
    <p style="margin:24px 0;">
      <a href="${c.href}" style="background:#8A3030;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;display:inline-block;">${c.cta}</a>
    </p>`;
  return shell(c.heading, body, unsub);
}

function stageText(c: Content, unsub: string): string {
  return `${c.paras.join("\n\n")}\n\n${c.cta}: ${c.href}\n\n—\nGerman with Marvin · reply to reach Marvin.\nUnsubscribe: ${unsub}`;
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
