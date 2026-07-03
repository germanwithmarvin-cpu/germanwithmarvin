"use client";

import { createClient } from "@/lib/supabase/client";

export type Message = {
  id: string;
  student_id: string;
  sender: "student" | "teacher" | "system";
  body: string;
  created_at: string;
};

// Automatische Sofort-Antwort an den Schüler.
const AUTO_REPLY =
  "Thanks for your message! I've received it and will reply personally as soon as I read it. 🙂";

// ---------- Schüler-Seite ----------

export async function getMyThread(): Promise<Message[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("student_id", user.id)
    .order("created_at", { ascending: true });
  return (data ?? []) as Message[];
}

// Schüler sendet eine Nachricht. Danach kommt eine automatische Sofort-Antwort,
// aber nur, wenn die letzte Nachricht nicht bereits eine System-Antwort war
// (damit es bei mehreren Nachrichten hintereinander nicht spammt).
export async function sendStudentMessage(body: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase
    .from("messages")
    .insert({ student_id: user.id, sender: "student", body: body.trim() });
  if (error) return { error: error.message };

  // Letzte Nachricht prüfen (vor dieser): war sie schon eine System-Antwort?
  const { data: recent } = await supabase
    .from("messages")
    .select("sender")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })
    .limit(2);
  const previous = recent?.[1]; // [0] ist die gerade gesendete Schüler-Nachricht
  if (previous?.sender !== "system") {
    await supabase
      .from("messages")
      .insert({ student_id: user.id, sender: "system", body: AUTO_REPLY });
  }
  return {};
}

// ---------- Lehrer-Seite ----------

export type Thread = { studentId: string; studentName: string; last: Message; unreplied: boolean };

export async function getThreads(): Promise<Thread[]> {
  const supabase = createClient();
  const { data: msgs } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true });
  const all = (msgs ?? []) as Message[];
  if (all.length === 0) return [];

  const ids = [...new Set(all.map((m) => m.student_id))];
  const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", ids);
  const names = new Map((profiles ?? []).map((p) => [p.id as string, (p.full_name as string) || "Student"]));

  return ids
    .map((id) => {
      const thread = all.filter((m) => m.student_id === id);
      const last = thread[thread.length - 1];
      // "unreplied": die letzte echte Schüler-Nachricht hat noch keine Lehrer-Antwort danach.
      const lastTeacher = [...thread].reverse().find((m) => m.sender === "teacher");
      const lastStudent = [...thread].reverse().find((m) => m.sender === "student");
      const unreplied = Boolean(
        lastStudent && (!lastTeacher || lastStudent.created_at > lastTeacher.created_at),
      );
      return { studentId: id, studentName: names.get(id) || "Student", last, unreplied };
    })
    .sort((a, b) => (a.last.created_at < b.last.created_at ? 1 : -1));
}

export async function getThread(studentId: string): Promise<Message[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: true });
  return (data ?? []) as Message[];
}

export async function sendTeacherReply(studentId: string, body: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("messages")
    .insert({ student_id: studentId, sender: "teacher", body: body.trim() });
  return { error: error?.message };
}
