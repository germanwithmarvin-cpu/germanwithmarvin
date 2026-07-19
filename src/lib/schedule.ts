"use client";

import { createClient } from "@/lib/supabase/client";

export type WeeklyWindow = { weekday: number; start: string; end: string }; // weekday 0=So..6=Sa, "HH:MM"
export type TeacherSettings = {
  timezone: string;
  slotMinutes: number;
  leadHours: number;
  horizonDays: number;
  bufferMinutes: number;
  weekly: WeeklyWindow[];
};
export type Booking = {
  id: string;
  studentId: string;
  startsAt: string;
  endsAt: string;
  status: string;
  meetLink: string | null;
};
export type Slot = { startISO: string };

export const DEFAULT_SETTINGS: TeacherSettings = {
  timezone: "Europe/Berlin",
  slotMinutes: 50,
  leadHours: 12,
  horizonDays: 28,
  bufferMinutes: 10,
  weekly: [],
};

// ---- Zeitzonen-Helfer (ohne Bibliothek) ------------------------------------
// Offset einer Zeitzone (ms, wie weit sie UTC voraus ist) zu einem Zeitpunkt.
function tzOffsetMs(utcMs: number, tz: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const m: Record<string, string> = {};
  for (const p of dtf.formatToParts(new Date(utcMs))) m[p.type] = p.value;
  const asUTC = Date.UTC(+m.year, +m.month - 1, +m.day, +m.hour % 24, +m.minute, +m.second);
  return asUTC - utcMs;
}
// Lokale Wanduhrzeit (in tz) → UTC-Instant.
function zonedWallToUtc(y: number, mo: number, d: number, h: number, mi: number, tz: string): Date {
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  return new Date(guess - tzOffsetMs(guess, tz));
}
// Datum-Bestandteile in einer Zeitzone.
function partsInTz(date: Date, tz: string) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hour12: false, weekday: "short",
    year: "numeric", month: "2-digit", day: "2-digit",
  });
  const m: Record<string, string> = {};
  for (const p of dtf.formatToParts(date)) m[p.type] = p.value;
  const wdMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { year: +m.year, month: +m.month, day: +m.day, weekday: wdMap[m.weekday] ?? 0 };
}

// ---- Slot-Erzeugung --------------------------------------------------------
export function generateSlots(
  settings: TeacherSettings,
  takenMs: Set<number>,
  blocks: { starts_at: string; ends_at: string }[],
  now: Date = new Date(),
): Slot[] {
  const earliest = now.getTime() + settings.leadHours * 3600e3;
  const latest = now.getTime() + settings.horizonDays * 86400e3;
  const blockRanges = blocks.map((b) => [new Date(b.starts_at).getTime(), new Date(b.ends_at).getTime()] as const);
  const seen = new Set<number>();
  const out: Slot[] = [];

  for (let i = 0; i <= settings.horizonDays; i++) {
    const p = partsInTz(new Date(now.getTime() + i * 86400e3), settings.timezone);
    for (const w of settings.weekly.filter((x) => x.weekday === p.weekday)) {
      const [sh, sm] = w.start.split(":").map(Number);
      const [eh, em] = w.end.split(":").map(Number);
      const endMins = eh * 60 + em;
      for (let mins = sh * 60 + sm; mins + settings.slotMinutes <= endMins; mins += settings.slotMinutes + settings.bufferMinutes) {
        const utc = zonedWallToUtc(p.year, p.month, p.day, Math.floor(mins / 60), mins % 60, settings.timezone);
        const t = utc.getTime();
        if (t < earliest || t > latest || seen.has(t) || takenMs.has(t)) continue;
        if (blockRanges.some(([a, b]) => t < b && t + settings.slotMinutes * 60e3 > a)) continue;
        seen.add(t);
        out.push({ startISO: utc.toISOString() });
      }
    }
  }
  return out.sort((a, b) => a.startISO.localeCompare(b.startISO));
}

// ---- Datenzugriff ----------------------------------------------------------
export async function getTeacherSettings(): Promise<TeacherSettings> {
  const { data } = await createClient().from("lesson_teacher_settings").select("*").eq("id", 1).maybeSingle();
  if (!data) return DEFAULT_SETTINGS;
  return {
    timezone: data.timezone ?? DEFAULT_SETTINGS.timezone,
    slotMinutes: data.slot_minutes ?? 50,
    leadHours: data.lead_hours ?? 12,
    horizonDays: data.horizon_days ?? 28,
    bufferMinutes: data.buffer_minutes ?? 10,
    weekly: (data.weekly as WeeklyWindow[]) ?? [],
  };
}

export async function saveTeacherSettings(s: TeacherSettings): Promise<{ error?: string }> {
  const { error } = await createClient().from("lesson_teacher_settings").update({
    timezone: s.timezone,
    slot_minutes: s.slotMinutes,
    lead_hours: s.leadHours,
    horizon_days: s.horizonDays,
    buffer_minutes: s.bufferMinutes,
    weekly: s.weekly,
  }).eq("id", 1);
  return { error: error?.message };
}

export async function getBlocks(): Promise<{ starts_at: string; ends_at: string }[]> {
  const { data } = await createClient().from("lesson_blocks").select("starts_at, ends_at");
  return data ?? [];
}

export async function getTakenMs(fromISO: string, toISO: string): Promise<Set<number>> {
  const { data } = await createClient().rpc("taken_lesson_slots", { p_from: fromISO, p_to: toISO });
  const set = new Set<number>();
  for (const t of (data as string[] | null) ?? []) set.add(new Date(t).getTime());
  return set;
}

export async function getMyBookings(): Promise<Booking[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from("lesson_bookings").select("*").eq("student_id", user.id).order("starts_at", { ascending: true });
  return (data ?? []).map(mapBooking);
}

export async function getAllBookings(): Promise<Booking[]> {
  const { data } = await createClient().from("lesson_bookings").select("*").order("starts_at", { ascending: true });
  return (data ?? []).map(mapBooking);
}

function mapBooking(r: Record<string, unknown>): Booking {
  return {
    id: r.id as string,
    studentId: r.student_id as string,
    startsAt: r.starts_at as string,
    endsAt: r.ends_at as string,
    status: r.status as string,
    meetLink: (r.meet_link as string) ?? null,
  };
}

export async function bookLesson(startISO: string): Promise<{ id?: string; error?: string }> {
  const { data, error } = await createClient().rpc("book_lesson", { p_start: startISO });
  if (error) return { error: friendly(error.message) };
  return { id: data as string };
}

export async function cancelLesson(id: string): Promise<{ result?: string; error?: string }> {
  const { data, error } = await createClient().rpc("cancel_lesson", { p_booking: id });
  if (error) return { error: friendly(error.message) };
  return { result: data as string };
}

function friendly(msg: string): string {
  if (msg.includes("no_credits")) return "You have no lesson hours left — top up your plan first.";
  if (msg.includes("slot_taken")) return "That time was just taken — please pick another.";
  if (msg.includes("too_soon")) return "That time is too soon — please book a bit further ahead.";
  if (msg.includes("too_far")) return "That time is too far in the future.";
  if (msg.includes("not_active")) return "This lesson can’t be cancelled anymore.";
  return msg;
}
