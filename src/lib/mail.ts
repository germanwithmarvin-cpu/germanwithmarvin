// Zentraler, wiederverwendbarer E-Mail-Versand über Resend (Server-seitig).
//
// Nötige Env-Vars (in Vercel):
//   RESEND_API_KEY  – API-Key von resend.com
//   MAIL_FROM       – Absender, z. B. "German with Marvin <hallo@germanwithmarvin.com>"
//                     WICHTIG: zum Versand an Schüler muss die Domain in Resend
//                     verifiziert sein. Ohne MAIL_FROM wird onboarding@resend.dev
//                     benutzt – das erreicht NUR deine eigene Resend-Adresse.
//
// Alle Funktionen sind "best effort": schlägt der Versand fehl, wird false
// zurückgegeben (nie geworfen), damit der aufrufende Ablauf (z. B. Buchung)
// nicht abbricht.

export type MailAttachment = {
  filename: string;
  content: string; // base64
  contentType?: string;
};

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  attachments?: MailAttachment[];
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const from = process.env.MAIL_FROM || "German with Marvin <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        ...(opts.html ? { html: opts.html } : {}),
        ...(opts.text ? { text: opts.text } : {}),
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
        ...(opts.attachments?.length
          ? { attachments: opts.attachments.map((a) => ({ filename: a.filename, content: a.content, ...(a.contentType ? { content_type: a.contentType } : {}) })) }
          : {}),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
