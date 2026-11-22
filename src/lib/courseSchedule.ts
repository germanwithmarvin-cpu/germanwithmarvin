// Zeitzonensichere Termin-Helfer für den Gruppenkurs + die Probestunde.
// Die Kurszeiten stehen als WANDZEIT in GROUP_COURSE.timezone (z. B. 10:00 Berlin).
// Hier rechnen wir sie korrekt in den passenden UTC-Moment um (DST-sicher über Intl),
// damit .ics-Dateien und die Anzeige in Besucher-Zeitzone stimmen.

import { GROUP_COURSE, PROBESTUNDE } from "@/lib/config";

const DOW: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const ICAL_DAY: Record<string, string> = { Sun: "SU", Mon: "MO", Tue: "TU", Wed: "WE", Thu: "TH", Fri: "FR", Sat: "SA" };

// Welche Wandzeit zeigt eine Zeitzone für einen gegebenen UTC-Moment?
function wallFromInstant(instantMs: number, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).formatToParts(new Date(instantMs));
  const m: Record<string, string> = {};
  parts.forEach((p) => { m[p.type] = p.value; });
  const hh = m.hour === "24" ? 0 : Number(m.hour);
  return Date.UTC(Number(m.year), Number(m.month) - 1, Number(m.day), hh, Number(m.minute));
}

// Wandzeit (y,mo,d,h,mi) in einer Zeitzone -> exakter UTC-Moment.
export function zonedWallToUtc(y: number, mo: number, d: number, h: number, mi: number, tz: string): Date {
  const asUtc = Date.UTC(y, mo - 1, d, h, mi);
  const offset = wallFromInstant(asUtc, tz) - asUtc; // ms, um die tz vor UTC liegt
  return new Date(asUtc - offset);
}

function hm(t: string): [number, number] {
  const [h, m] = t.split(":").map(Number);
  return [h || 0, m || 0];
}

// Erste Kurssitzung als UTC-Moment (startDate ist der erste Termin).
export function courseFirstSession(): { startUtc: Date; endUtc: Date } {
  const [y, mo, d] = GROUP_COURSE.startDate.split("-").map(Number);
  const [sh, sm] = hm(GROUP_COURSE.time);
  const [eh, em] = hm(GROUP_COURSE.endTime);
  return {
    startUtc: zonedWallToUtc(y, mo, d, sh, sm, GROUP_COURSE.timezone),
    endUtc: zonedWallToUtc(y, mo, d, eh, em, GROUP_COURSE.timezone),
  };
}

// Wiederholungsregel für die .ics (ein VEVENT deckt alle Sitzungen ab).
export function courseRrule(): string {
  const byday = GROUP_COURSE.days.map((d) => ICAL_DAY[d]).join(",");
  return `FREQ=WEEKLY;BYDAY=${byday};COUNT=${GROUP_COURSE.totalSessions}`;
}

// Nächste Probestunde (fester Wochentag + Uhrzeit) ab jetzt, als UTC-Moment.
export function nextProbestunde(fromMs: number = Date.now()): { startUtc: Date; endUtc: Date } {
  const targetDow = DOW[PROBESTUNDE.weekday] ?? 0;
  const [h, m] = hm(PROBESTUNDE.time);
  for (let add = 0; add <= 8; add++) {
    const probe = new Date(fromMs + add * 86400000);
    const wd = new Intl.DateTimeFormat("en-US", { timeZone: PROBESTUNDE.timezone, weekday: "short" }).format(probe);
    const wdNum = DOW[wd.slice(0, 3)] ?? -1;
    if (wdNum !== targetDow) continue;
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: PROBESTUNDE.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(probe);
    const map: Record<string, string> = {};
    parts.forEach((p) => { map[p.type] = p.value; });
    const startUtc = zonedWallToUtc(Number(map.year), Number(map.month), Number(map.day), h, m, PROBESTUNDE.timezone);
    if (startUtc.getTime() <= fromMs) continue;
    const endUtc = new Date(startUtc.getTime() + PROBESTUNDE.durationMin * 60000);
    return { startUtc, endUtc };
  }
  const start = new Date(fromMs + 7 * 86400000);
  return { startUtc: start, endUtc: new Date(start.getTime() + PROBESTUNDE.durationMin * 60000) };
}

// "Saturday, 16 Jan 2027, 10:00" in einer bestimmten Zeitzone (undefined = Gerät des Besuchers).
export function formatInTz(date: Date, tz?: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long", day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", ...(tz ? { timeZone: tz } : {}),
    }).format(date);
  } catch {
    return date.toUTCString();
  }
}
