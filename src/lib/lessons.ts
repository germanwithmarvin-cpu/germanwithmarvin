"use client";

import { createClient } from "@/lib/supabase/client";
import type { Lesson } from "@/lib/data";

// Wandelt eine Datenbank-Zeile (snake_case) in das Lesson-Format der App (camelCase) um.
function fromRow(r: Record<string, unknown>): Lesson {
  return {
    id: r.id as string,
    title: (r.title as string) ?? "",
    level: (r.level as Lesson["level"]) ?? "A1",
    topic: (r.topic as string) ?? "",
    description: (r.description as string) ?? "",
    videoId: (r.video_id as string) ?? "",
    durationMin: (r.duration_min as number) ?? 0,
    xp: (r.xp as number) ?? 0,
    body: (r.body as string) ?? "",
    quizEnabled: (r.quiz_enabled as boolean) ?? false,
    quiz: (r.quiz as Lesson["quiz"]) ?? [],
    exercises: (r.exercises as Lesson["exercises"]) ?? [],
    materials: (r.materials as Lesson["materials"]) ?? [],
  };
}

function toRow(lesson: Lesson, sortOrder?: number) {
  const row: Record<string, unknown> = {
    id: lesson.id,
    title: lesson.title,
    level: lesson.level,
    topic: lesson.topic,
    description: lesson.description,
    video_id: lesson.videoId,
    duration_min: lesson.durationMin,
    xp: lesson.xp,
    body: lesson.body,
    quiz_enabled: lesson.quizEnabled,
    quiz: lesson.quiz,
    exercises: lesson.exercises,
    materials: lesson.materials,
  };
  if (sortOrder !== undefined) row.sort_order = sortOrder;
  return row;
}

export async function getLessons(): Promise<Lesson[]> {
  const supabase = createClient();
  const { data } = await supabase.from("lessons").select("*").order("sort_order", { ascending: true });
  return (data ?? []).map(fromRow);
}

export async function getLesson(id: string): Promise<Lesson | null> {
  const supabase = createClient();
  const { data } = await supabase.from("lessons").select("*").eq("id", id).single();
  return data ? fromRow(data) : null;
}

export async function saveLesson(lesson: Lesson, sortOrder?: number): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from("lessons").upsert(toRow(lesson, sortOrder));
  return { error: error?.message };
}

export async function deleteLesson(id: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from("lessons").delete().eq("id", id);
  return { error: error?.message };
}

// Speichert eine neue Reihenfolge: sort_order = Position in der Liste.
export async function saveLessonOrder(orderedIds: string[]): Promise<{ error?: string }> {
  const supabase = createClient();
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase.from("lessons").update({ sort_order: i + 1 }).eq("id", orderedIds[i]);
    if (error) return { error: error.message };
  }
  return {};
}

// Erzeugt eine eindeutige, URL-taugliche ID aus dem Titel.
export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[äöü]/g, (m) => ({ ä: "ae", ö: "oe", ü: "ue" }[m] || m))
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "lesson"}-${suffix}`;
}
