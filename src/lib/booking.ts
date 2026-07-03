"use client";

import { createClient } from "@/lib/supabase/client";

export type TeacherSettings = {
  weekdays: number[];
  slots: string[];
  session_minutes: number;
};

export type Booking = {
  id: string;
  student_id: string;
  lesson_type: string;
  starts_at: string;
  duration_min: number;
  status: string;
  created_at: string;
};

export async function getSettings(): Promise<TeacherSettings> {
  const supabase = createClient();
  const { data } = await supabase.from("teacher_settings").select("weekdays, slots, session_minutes").eq("id", 1).single();
  return data ?? { weekdays: [1, 2, 3, 4, 5], slots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"], session_minutes: 50 };
}

export async function saveSettings(s: TeacherSettings): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from("teacher_settings").update(s).eq("id", 1);
  return { error: error?.message };
}

// Belegte Startzeiten in einem Zeitraum (als ISO-Strings).
export async function getTakenSlots(from: Date, to: Date): Promise<Set<string>> {
  const supabase = createClient();
  const { data } = await supabase.rpc("taken_slots", { from_ts: from.toISOString(), to_ts: to.toISOString() });
  return new Set((data ?? []).map((d: string) => new Date(d).toISOString()));
}

export async function createBooking(lessonType: string, startsAt: Date, durationMin: number): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const { error } = await supabase.from("bookings").insert({
    student_id: user.id,
    lesson_type: lessonType,
    starts_at: startsAt.toISOString(),
    duration_min: durationMin,
  });
  return { error: error?.message };
}

export async function getMyBookings(): Promise<Booking[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from("bookings").select("*").eq("student_id", user.id).order("starts_at", { ascending: true });
  return (data ?? []) as Booking[];
}

// ---- Lehrer ----
export async function getAllBookings(): Promise<(Booking & { student?: string })[]> {
  const supabase = createClient();
  const { data } = await supabase.from("bookings").select("*").order("starts_at", { ascending: true });
  const rows = (data ?? []) as Booking[];
  if (rows.length === 0) return [];
  const ids = [...new Set(rows.map((r) => r.student_id))];
  const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", ids);
  const names = new Map((profiles ?? []).map((p) => [p.id as string, (p.full_name as string) || "Student"]));
  return rows.map((r) => ({ ...r, student: names.get(r.student_id) || "Student" }));
}

export async function setBookingStatus(id: string, status: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  return { error: error?.message };
}
