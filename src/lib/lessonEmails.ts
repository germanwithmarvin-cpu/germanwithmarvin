// Schüler-Mails rund um gebuchte Stunden: Bestätigung (beim Buchen) und
// Erinnerung (per Cron ~1 Tag vorher). Beide enthalten den Join-Link und – bei
// der Bestätigung – eine .ics zum Eintragen in den eigenen Kalender.
//
// Sprache: Englisch, wie die gesamte schülerseitige UI (/register, LessonsList,
// /ha). Antworten gehen an SITE.contactEmail.

import { SITE } from "@/lib/config";
import { sendEmail } from "@/lib/mail";
import { lessonIcsBase64 } from "@/lib/ics";

const BASE_URL = "https://www.germanwithmarvin.com";

type LessonMail = {
  bookingId: string;
  to: string;
  studentName?: string | null;
  startISO: string;
  endISO: string;
  meetLink?: string | null;
  timezone: string;
};

// "Tuesday, 7 Oct 2026, 1:00 PM" im Zeitfenster des Lehrers.
function formatWhen(startISO: string, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long", day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", timeZone: timezone,
    }).format(new Date(startISO));
  } catch {
    return new Date(startISO).toUTCString();
  }
}

function buildHtml(opts: { heading: string; intro: string; whenLine: string; tz: string; meetLink?: string | null }): string {
  const joinBtn = opts.meetLink
    ? `<p style="margin:24px 0;"><a href="${opts.meetLink}" style="background:#E3A12F;color:#2a0f0f;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;display:inline-block;">Join the lesson</a></p>
       <p style="color:#6b5a4a;font-size:13px;margin:0 0 8px;">Or copy this link: <br><span style="word-break:break-all;">${opts.meetLink}</span></p>`
    : `<p style="color:#6b5a4a;font-size:14px;">Your join link will be available in your account shortly before the lesson.</p>`;
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#2a1a12;">
    <h1 style="color:#8A3030;font-size:22px;margin:0 0 12px;">${opts.heading}</h1>
    <p style="font-size:15px;line-height:1.5;margin:0 0 16px;">${opts.intro}</p>
    <div style="background:#FFF1D2;border:1px solid #e9d4a3;border-radius:12px;padding:16px 18px;">
      <div style="font-size:16px;font-weight:700;color:#8A3030;">${opts.whenLine}</div>
      <div style="font-size:13px;color:#6b5a4a;margin-top:4px;">Times shown in ${opts.tz}</div>
    </div>
    ${joinBtn}
    <p style="font-size:14px;line-height:1.5;color:#5a4a3a;">You can also open your lessons any time here:<br>
      <a href="${BASE_URL}/booking" style="color:#8A3030;">${BASE_URL}/booking</a></p>
    <hr style="border:none;border-top:1px solid #eadfce;margin:24px 0;">
    <p style="font-size:12px;color:#9a8a7a;">German with Marvin · Reply to this email to reach your teacher.</p>
  </div>`;
}

function buildText(opts: { intro: string; whenLine: string; tz: string; meetLink?: string | null }): string {
  const join = opts.meetLink
    ? `Join the lesson: ${opts.meetLink}\n`
    : `Your join link will be available in your account shortly before the lesson.\n`;
  return `${opts.intro}\n\n${opts.whenLine} (${opts.tz})\n\n${join}\nYour lessons: ${BASE_URL}/booking\n\nGerman with Marvin`;
}

export async function sendLessonConfirmation(m: LessonMail): Promise<boolean> {
  const when = formatWhen(m.startISO, m.timezone);
  const hi = m.studentName ? `Hi ${m.studentName.split(" ")[0]},` : "Hi,";
  const intro = `${hi} your German lesson is booked. We've attached a calendar file so you can add it to your own calendar (with reminders). See you there!`;
  const ics = lessonIcsBase64({
    uid: `${m.bookingId}@germanwithmarvin.com`,
    startISO: m.startISO,
    endISO: m.endISO,
    summary: "German lesson · German with Marvin",
    description: m.meetLink ? `Join: ${m.meetLink}` : "Open your account for the join link.",
    location: m.meetLink ?? undefined,
  });
  return sendEmail({
    to: m.to,
    replyTo: SITE.contactEmail,
    subject: "Your German lesson is booked ✅",
    html: buildHtml({ heading: "Lesson booked", intro, whenLine: when, tz: m.timezone, meetLink: m.meetLink }),
    text: buildText({ intro, whenLine: when, tz: m.timezone, meetLink: m.meetLink }),
    attachments: [{ filename: "german-lesson.ics", content: ics, contentType: "text/calendar" }],
  });
}

export async function sendLessonReminder(m: LessonMail): Promise<boolean> {
  const when = formatWhen(m.startISO, m.timezone);
  const hi = m.studentName ? `Hi ${m.studentName.split(" ")[0]},` : "Hi,";
  const intro = `${hi} this is a reminder for your upcoming German lesson. Use the button below to join when it's time.`;
  return sendEmail({
    to: m.to,
    replyTo: SITE.contactEmail,
    subject: "Reminder: your German lesson is coming up ⏰",
    html: buildHtml({ heading: "Lesson reminder", intro, whenLine: when, tz: m.timezone, meetLink: m.meetLink }),
    text: buildText({ intro, whenLine: when, tz: m.timezone, meetLink: m.meetLink }),
  });
}
