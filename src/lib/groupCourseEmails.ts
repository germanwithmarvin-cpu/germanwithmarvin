// Bestätigungsmail nach dem Kauf des B1-Live-Gruppenkurses. Englisch, gleiche
// Marken-Optik wie die Stunden-Mails. Enthält Termine, Join-Link und eine .ics
// mit allen (wiederkehrenden) Sitzungen. Antworten gehen an SITE.contactEmail.

import { GROUP_COURSE, SITE } from "@/lib/config";
import { sendEmail } from "@/lib/mail";
import { lessonIcsBase64 } from "@/lib/ics";
import { courseFirstSession, courseRrule, formatInTz } from "@/lib/courseSchedule";

const BASE_URL = "https://www.germanwithmarvin.com";

function scheduleLine(): string {
  const dayNames: Record<string, string> = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };
  const days = GROUP_COURSE.days.map((d) => dayNames[d] ?? d).join(" & ");
  return `${days}, ${GROUP_COURSE.time}–${GROUP_COURSE.endTime} (${GROUP_COURSE.timezone})`;
}

export async function sendGroupCourseConfirmation(opts: { to: string; name?: string | null }): Promise<boolean> {
  const { startUtc, endUtc } = courseFirstSession();
  const firstWhen = formatInTz(startUtc, GROUP_COURSE.timezone);
  const hi = opts.name ? `Hi ${opts.name.split(" ")[0]},` : "Hi,";
  const join = GROUP_COURSE.meetLink;

  const ics = lessonIcsBase64({
    uid: `${GROUP_COURSE.slug}-${startUtc.getTime()}@germanwithmarvin.com`,
    startISO: startUtc.toISOString(),
    endISO: endUtc.toISOString(),
    summary: GROUP_COURSE.name,
    description: join ? `Join: ${join}` : "Your join link will be in your welcome email / account.",
    location: join || undefined,
    rrule: courseRrule(),
  });

  const joinBtn = join
    ? `<p style="margin:24px 0;"><a href="${join}" style="background:#E3A12F;color:#2a0f0f;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:10px;display:inline-block;">Open the class link</a></p>
       <p style="color:#6b5a4a;font-size:13px;margin:0 0 8px;">Or copy this link:<br><span style="word-break:break-all;">${join}</span></p>`
    : `<p style="color:#6b5a4a;font-size:14px;">Your class link will arrive in a separate email before the course starts.</p>`;

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#2a1a12;">
    <h1 style="color:#8A3030;font-size:22px;margin:0 0 12px;">You're in — welcome to the B1 group course!</h1>
    <p style="font-size:15px;line-height:1.5;margin:0 0 16px;">${hi} your spot in <strong>${GROUP_COURSE.name}</strong> is confirmed. We've attached a calendar file with all ${GROUP_COURSE.totalSessions} sessions.</p>
    <div style="background:#FFF1D2;border:1px solid #e9d4a3;border-radius:12px;padding:16px 18px;">
      <div style="font-size:16px;font-weight:700;color:#8A3030;">${scheduleLine()}</div>
      <div style="font-size:14px;color:#2a1a12;margin-top:6px;">Starts: ${firstWhen}</div>
      <div style="font-size:13px;color:#6b5a4a;margin-top:4px;">${GROUP_COURSE.weeks} weeks · ${GROUP_COURSE.totalSessions} live sessions · max ${GROUP_COURSE.maxSeats} people</div>
    </div>
    ${joinBtn}
    <p style="font-size:14px;line-height:1.5;color:#5a4a3a;">As a course member you also have full access to the self-study app (videos, flashcards, practice) for the whole course. Start here:<br>
      <a href="${BASE_URL}/dashboard" style="color:#8A3030;">${BASE_URL}/dashboard</a></p>
    <hr style="border:none;border-top:1px solid #eadfce;margin:24px 0;">
    <p style="font-size:12px;color:#9a8a7a;">German with Marvin · Reply to this email if you have any question.</p>
  </div>`;

  const text = `${hi}\n\nYour spot in ${GROUP_COURSE.name} is confirmed.\n\nWhen: ${scheduleLine()}\nStarts: ${firstWhen}\n${GROUP_COURSE.weeks} weeks, ${GROUP_COURSE.totalSessions} live sessions.\n\n${join ? `Class link: ${join}\n` : "Your class link will arrive before the course starts.\n"}\nYou also get full app access during the course: ${BASE_URL}/dashboard\n\nGerman with Marvin`;

  return sendEmail({
    to: opts.to,
    replyTo: SITE.contactEmail,
    subject: "You're in — B1 Exam Prep group course ✅",
    html,
    text,
    attachments: [{ filename: "b1-course.ics", content: ics, contentType: "text/calendar" }],
  });
}
