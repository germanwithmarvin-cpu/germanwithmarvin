"use client";

import { createClient } from "@/lib/supabase/client";

// Lehrer-Kontrolle: liest den Fortschritt aller Schüler über sichere RPCs
// (nur für Lehrer freigegeben, siehe supabase/teacher-analytics.sql).

export type StudentOverview = {
  studentId: string;
  fullName: string;
  email: string;
  joined: string | null;
  lessonsCompleted: number;
  cardsLearned: number;
  cardsSeen: number;
  lastActive: string | null;
};

export async function getStudents(): Promise<StudentOverview[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("teacher_students");
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map((r) => ({
    studentId: r.student_id as string,
    fullName: (r.full_name as string) || "",
    email: (r.email as string) || "",
    joined: (r.joined as string) ?? null,
    lessonsCompleted: Number(r.lessons_completed ?? 0),
    cardsLearned: Number(r.cards_learned ?? 0),
    cardsSeen: Number(r.cards_seen ?? 0),
    lastActive: (r.last_active as string) ?? null,
  }));
}

export async function getStudentLessonIds(studentId: string): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("teacher_student_lessons", { p_student: studentId });
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map((r) => r.lesson_id as string);
}

export type CardsByLevel = { level: string; learned: number; seen: number };

export async function getStudentCardsByLevel(studentId: string): Promise<CardsByLevel[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("teacher_student_cards_by_level", { p_student: studentId });
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map((r) => ({
    level: (r.level as string) || "?",
    learned: Number(r.learned ?? 0),
    seen: Number(r.seen ?? 0),
  }));
}
