"use client";

import { createClient } from "@/lib/supabase/client";

// Fortschritt des eingeloggten Schülers – gespeichert in Supabase.

export type Progress = {
  completedLessons: string[];
  xp: number;
};

const empty: Progress = { completedLessons: [], xp: 0 };

export async function loadProgress(): Promise<Progress> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return empty;

  const [{ data: rows }, { data: profile }] = await Promise.all([
    supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id),
    supabase.from("profiles").select("xp").eq("id", user.id).single(),
  ]);

  return {
    completedLessons: (rows ?? []).map((r) => r.lesson_id as string),
    xp: profile?.xp ?? 0,
  };
}

// XP direkt gutschreiben (z. B. aus dem Wort-Rakete-Spiel). Gibt den neuen Stand zurück.
export async function addXp(amount: number): Promise<number> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || amount <= 0) return 0;
  const { data: profile } = await supabase.from("profiles").select("xp").eq("id", user.id).single();
  const next = (profile?.xp ?? 0) + amount;
  await supabase.from("profiles").update({ xp: next }).eq("id", user.id);
  return next;
}

export async function completeLesson(lessonId: string, xp: number): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Lektion als abgeschlossen markieren (doppelte werden ignoriert).
  const { error } = await supabase
    .from("lesson_progress")
    .insert({ user_id: user.id, lesson_id: lessonId });

  // Nur XP gutschreiben, wenn die Lektion neu abgeschlossen wurde.
  if (!error) {
    const { data: profile } = await supabase.from("profiles").select("xp").eq("id", user.id).single();
    await supabase.from("profiles").update({ xp: (profile?.xp ?? 0) + xp }).eq("id", user.id);
  }
}
