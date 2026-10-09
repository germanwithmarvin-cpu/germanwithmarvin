"use client";

import { createClient } from "@/lib/supabase/client";

// Datenzugriff für den Prüfungstrainer. Lesen/Hören werden lokal ausgewertet
// (checkExamItem), Schreiben geht an /api/exam-grade (KI). Teacher-Schreibrechte
// laufen über RLS (is_teacher()).

export type ExamModule = "reading" | "listening" | "writing";
export type ExamItemKind = "passage" | "audio" | "choice" | "gap" | "writing";

export type ExamPaper = {
  id: string; level: string; variant: number; title: string; subtitle: string;
  isPublished: boolean; isSample: boolean; sortOrder: number;
};
export type ExamSection = {
  id: string; paperId: string; module: ExamModule; title: string;
  instructions: string; timeMinutes: number; sortOrder: number;
};
export type ExamItem = {
  id: string; sectionId: string; grp: number; kind: ExamItemKind;
  prompt: string; body: string; audioUrl: string | null;
  options: string[]; correct: number; answers: string[];
  points: number; minWords: number | null; maxWords: number | null; sortOrder: number;
};
export type ExamSectionFull = { section: ExamSection; items: ExamItem[] };
export type ExamFull = { paper: ExamPaper; sections: ExamSectionFull[] };

const sb = () => createClient();

function toPaper(r: Record<string, unknown>): ExamPaper {
  return {
    id: r.id as string, level: r.level as string, variant: Number(r.variant),
    title: r.title as string, subtitle: (r.subtitle as string) ?? "",
    isPublished: Boolean(r.is_published), isSample: Boolean(r.is_sample),
    sortOrder: Number(r.sort_order ?? 0),
  };
}
function toSection(r: Record<string, unknown>): ExamSection {
  return {
    id: r.id as string, paperId: r.paper_id as string, module: r.module as ExamModule,
    title: r.title as string, instructions: (r.instructions as string) ?? "",
    timeMinutes: Number(r.time_minutes ?? 0), sortOrder: Number(r.sort_order ?? 0),
  };
}
function toItem(r: Record<string, unknown>): ExamItem {
  const data = (r.data as { options?: string[] }) || {};
  const sol = (r.solution as { correct?: number; answers?: string[] }) || {};
  return {
    id: r.id as string, sectionId: r.section_id as string, grp: Number(r.grp ?? 0),
    kind: r.kind as ExamItemKind, prompt: (r.prompt as string) ?? "",
    body: (r.body as string) ?? "", audioUrl: (r.audio_url as string) ?? null,
    options: data.options ?? [], correct: sol.correct ?? -1, answers: sol.answers ?? [],
    points: Number(r.points ?? 1),
    minWords: r.min_words != null ? Number(r.min_words) : null,
    maxWords: r.max_words != null ? Number(r.max_words) : null,
    sortOrder: Number(r.sort_order ?? 0),
  };
}

export async function getPapers(): Promise<ExamPaper[]> {
  const { data } = await sb().from("exam_papers").select("*")
    .order("level").order("variant");
  return (data ?? []).map(toPaper);
}

export async function getPaperFull(id: string): Promise<ExamFull | null> {
  const { data: p } = await sb().from("exam_papers").select("*").eq("id", id).maybeSingle();
  if (!p) return null;
  const { data: secs } = await sb().from("exam_sections").select("*")
    .eq("paper_id", id).order("sort_order");
  const sections = (secs ?? []).map(toSection);
  const { data: items } = await sb().from("exam_items").select("*")
    .in("section_id", sections.map((s) => s.id)).order("sort_order");
  const bySec = new Map<string, ExamItem[]>();
  (items ?? []).map(toItem).forEach((it) => {
    (bySec.get(it.sectionId) ?? bySec.set(it.sectionId, []).get(it.sectionId)!).push(it);
  });
  return { paper: toPaper(p), sections: sections.map((s) => ({ section: s, items: bySec.get(s.id) ?? [] })) };
}

// ---- Auto-Auswertung (Lesen/Hören) ----------------------------------------
const norm = (s: string) =>
  s.toLowerCase().trim()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[.,!?;:"'„“”()\-]/g, "").replace(/\s+/g, " ");

export function checkExamItem(item: ExamItem, given: string): boolean {
  if (item.kind === "choice") return given !== "" && Number(given) === item.correct;
  if (item.kind === "gap") {
    const g = norm(given);
    return g.length > 0 && item.answers.some((a) => norm(a) === g);
  }
  return false; // writing wird separat per KI bewertet
}

// ---- Versuche --------------------------------------------------------------
export async function startAttempt(paperId: string): Promise<string | null> {
  const { data: { user } } = await sb().auth.getUser();
  if (!user) return null;
  const { data } = await sb().from("exam_attempts")
    .insert({ user_id: user.id, paper_id: paperId }).select("id").single();
  return (data?.id as string) ?? null;
}

export async function saveAnswers(
  attemptId: string, rows: { itemId: string; given: string; correct: boolean; points: number }[],
): Promise<void> {
  if (rows.length === 0) return;
  await sb().from("exam_answers").upsert(
    rows.map((r) => ({ attempt_id: attemptId, item_id: r.itemId, given: r.given, correct: r.correct, points: r.points })),
    { onConflict: "attempt_id,item_id" },
  );
}

export async function finishAttempt(
  attemptId: string,
  scores: { reading?: [number, number]; listening?: [number, number]; writing?: [number, number] },
): Promise<void> {
  const patch: Record<string, unknown> = { status: "submitted", submitted_at: new Date().toISOString() };
  if (scores.reading) { patch.reading_score = scores.reading[0]; patch.reading_max = scores.reading[1]; }
  if (scores.listening) { patch.listening_score = scores.listening[0]; patch.listening_max = scores.listening[1]; }
  if (scores.writing) { patch.writing_score = scores.writing[0]; patch.writing_max = scores.writing[1]; }
  await sb().from("exam_attempts").update(patch).eq("id", attemptId);
}

// ---- Teacher: Audio & Veröffentlichung ------------------------------------
export async function setItemAudio(itemId: string, url: string | null): Promise<{ error?: string }> {
  const { error } = await sb().from("exam_items").update({ audio_url: url }).eq("id", itemId);
  return { error: error?.message };
}
export async function updatePaper(id: string, patch: Partial<{ isPublished: boolean; isSample: boolean; title: string; subtitle: string }>): Promise<{ error?: string }> {
  const row: Record<string, unknown> = {};
  if (patch.isPublished !== undefined) row.is_published = patch.isPublished;
  if (patch.isSample !== undefined) row.is_sample = patch.isSample;
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.subtitle !== undefined) row.subtitle = patch.subtitle;
  row.updated_at = new Date().toISOString();
  const { error } = await sb().from("exam_papers").update(row).eq("id", id);
  return { error: error?.message };
}
export async function updateItemText(itemId: string, patch: Partial<{ prompt: string; body: string }>): Promise<{ error?: string }> {
  const { error } = await sb().from("exam_items").update(patch).eq("id", itemId);
  return { error: error?.message };
}
