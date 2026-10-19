"use client";

import { createClient } from "@/lib/supabase/client";

// Mehrteiliger Einstufungstest (öffentlich, ohne Login lesbar). Vokabeln /
// Grammatik / Lesen / Hören. Scoring lokal; Ergebnis = grobe CEFR-Einstufung.

export type PSection = "vocab" | "grammar" | "reading" | "listening";
export type PKind = "passage" | "audio" | "choice";
export type Lv = "A1" | "A2" | "B1" | "B2";

export type PItem = {
  id: string; section: PSection; level: Lv; grp: number; kind: PKind;
  prompt: string; body: string; audioUrl: string | null;
  options: string[]; correct: number; sortOrder: number;
};

const sb = () => createClient();

function toItem(r: Record<string, unknown>): PItem {
  return {
    id: r.id as string, section: r.section as PSection, level: (r.level as Lv) ?? "A1",
    grp: Number(r.grp ?? 0), kind: r.kind as PKind, prompt: (r.prompt as string) ?? "",
    body: (r.body as string) ?? "", audioUrl: (r.audio_url as string) ?? null,
    options: (r.options as string[]) ?? [], correct: r.correct != null ? Number(r.correct) : -1,
    sortOrder: Number(r.sort_order ?? 0),
  };
}

export async function getPlacement(teacher = false): Promise<PItem[]> {
  let q = sb().from("placement_questions").select("*").order("sort_order");
  if (!teacher) q = q.eq("is_published", true);
  const { data } = await q;
  return (data ?? []).map(toItem);
}

export async function setPlacementAudio(id: string, url: string | null): Promise<{ error?: string }> {
  const { error } = await sb().from("placement_questions").update({ audio_url: url }).eq("id", id);
  return { error: error?.message };
}

const LEVELS: Lv[] = ["A1", "A2", "B1", "B2"];

// Grobe Einstufung: höchstes Niveau, bei dem noch >= 50% richtig sind
// (und die darunter liegenden auch). Fragen ohne Audio (unaufgenommen) zählen nicht.
export function estimatePlacement(
  items: PItem[], answers: Record<string, number>,
): { level: Lv; correct: number; total: number; byLevel: Record<Lv, { c: number; n: number }> } {
  const byLevel: Record<Lv, { c: number; n: number }> = { A1: { c: 0, n: 0 }, A2: { c: 0, n: 0 }, B1: { c: 0, n: 0 }, B2: { c: 0, n: 0 } };
  let correct = 0, total = 0;
  for (const it of items) {
    if (it.kind !== "choice") continue;
    byLevel[it.level].n++; total++;
    if (answers[it.id] === it.correct) { byLevel[it.level].c++; correct++; }
  }
  let level: Lv = "A1";
  for (const lv of LEVELS) {
    const b = byLevel[lv];
    if (b.n > 0 && b.c / b.n >= 0.5) level = lv; else if (b.n > 0) break;
  }
  return { level, correct, total, byLevel };
}
