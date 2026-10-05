// Minimaler iCalendar-(.ics-)Generator für Stunden-Termine.
//
// Zweck: Dem Schüler hängt die Bestätigungs-Mail eine .ics-Datei an. Tippt er
// sie an, landet der Termin in SEINEM eigenen Kalender – inkl. Meet-Link und
// eigener Erinnerungen (VALARM). Das ersetzt die frühere Google-Einladung,
// ohne dass der Schüler als Teilnehmer in Marvins Kalender auftaucht (Preply
// sieht dort nur den anonymen Code).

// ISO-Zeit → iCal-UTC-Basisformat "YYYYMMDDTHHMMSSZ".
function toICSDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

// Sonderzeichen für iCal-Textwerte escapen (Reihenfolge wichtig: Backslash zuerst).
function esc(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export function buildLessonIcs(opts: {
  uid: string;
  startISO: string;
  endISO: string;
  summary: string;
  description?: string;
  location?: string; // z. B. der Meet-Link
  alarmsMinutes?: number[]; // Erinnerungen vor Beginn, Standard 60 + 10 Min
}): string {
  const alarms = opts.alarmsMinutes ?? [60, 10];
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//German with Marvin//Lessons//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${opts.uid}`,
    `DTSTAMP:${toICSDate(new Date().toISOString())}`,
    `DTSTART:${toICSDate(opts.startISO)}`,
    `DTEND:${toICSDate(opts.endISO)}`,
    `SUMMARY:${esc(opts.summary)}`,
  ];
  if (opts.description) lines.push(`DESCRIPTION:${esc(opts.description)}`);
  if (opts.location) {
    lines.push(`LOCATION:${esc(opts.location)}`);
    lines.push(`URL:${esc(opts.location)}`);
  }
  lines.push("STATUS:CONFIRMED");
  for (const m of alarms) {
    lines.push(
      "BEGIN:VALARM",
      `TRIGGER:-PT${m}M`,
      "ACTION:DISPLAY",
      `DESCRIPTION:${esc(opts.summary)}`,
      "END:VALARM",
    );
  }
  lines.push("END:VEVENT", "END:VCALENDAR");
  // iCal verlangt CRLF-Zeilenenden.
  return lines.join("\r\n");
}

// Fertige .ics als base64 (für Resend-Attachment).
export function lessonIcsBase64(opts: Parameters<typeof buildLessonIcs>[0]): string {
  return Buffer.from(buildLessonIcs(opts), "utf8").toString("base64");
}
