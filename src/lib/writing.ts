"use client";

import { createClient } from "@/lib/supabase/client";

export type Submission = {
  id: string;
  prompt: string;
  body: string;
  feedback: string | null;
  status: string;
  created_at: string;
};

// Eine Schreibaufgabe einreichen.
export async function submitWriting(prompt: string, body: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  const { error } = await supabase
    .from("writing_submissions")
    .insert({ user_id: user.id, prompt, body });
  return { error: error?.message };
}

// Eigene Einreichungen des Schülers laden.
export async function getMySubmissions(): Promise<Submission[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("writing_submissions")
    .select("id, prompt, body, feedback, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return (data ?? []) as Submission[];
}

// Für den Lehrer: alle Einreichungen laden (RLS erlaubt das nur Lehrer-Konten).
export async function getAllSubmissions(): Promise<(Submission & { student?: string })[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("writing_submissions")
    .select("id, user_id, prompt, body, feedback, status, created_at")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as (Submission & { user_id: string })[];
  if (rows.length === 0) return [];

  // Namen der Schüler in einem zweiten Schritt laden (Lehrer dürfen Profile lesen).
  const ids = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", ids);
  const names = new Map((profiles ?? []).map((p) => [p.id as string, p.full_name as string | null]));

  return rows.map((r) => ({ ...r, student: names.get(r.user_id) || "Student" }));
}

// Für den Lehrer: Feedback speichern und Status auf "reviewed" setzen.
export async function saveFeedback(id: string, feedback: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("writing_submissions")
    .update({ feedback, status: "reviewed" })
    .eq("id", id);
  return { error: error?.message };
}
