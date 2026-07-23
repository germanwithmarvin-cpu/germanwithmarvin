"use client";

import { createClient } from "@/lib/supabase/client";

// Aufgaben-Trakt: Einheiten, Aufgaben, Fortschritt und die Antwortprüfung.

export type ExerciseKind = "choice" | "gap" | "order" | "error";

export type Exercise = {
  id: string;
  kind: ExerciseKind;
  prompt: string;
  options: string[]; // choice
  tokens: string[]; // order (gemischt angeboten)
  correct: number; // choice: Index der richtigen Option
  answers: string[]; // gap/error: akzeptierte Lösungen
  order: string[]; // order: richtige Reihenfolge
  verb: number; // Index des konjugierten Verbs (fuer die Positions-Darstellung)
  explain: string;
  hint: string;
};

export type Unit = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  level: string;
  theory: string;
  lessonId: string | null;
  sortOrder: number;
};

export type UnitProgress = { mastery: number; attempts: number; completedAt: string | null };

function toUnit(r: Record<string, unknown>): Unit {
  return {
    id: r.id as string,
    slug: r.slug as string,
    title: (r.title as string) ?? "",
    subtitle: (r.subtitle as string) ?? "",
    level: (r.level as string) ?? "A1",
    theory: (r.theory as string) ?? "",
    lessonId: (r.lesson_id as string) ?? null,
    sortOrder: (r.sort_order as number) ?? 0,
  };
}

function toExercise(r: Record<string, unknown>): Exercise {
  const data = (r.data ?? {}) as { options?: string[]; tokens?: string[] };
  const sol = (r.solution ?? {}) as { correct?: number; answers?: string[]; order?: string[]; verb?: number };
  return {
    id: r.id as string,
    kind: r.kind as ExerciseKind,
    prompt: (r.prompt as string) ?? "",
    options: data.options ?? [],
    tokens: data.tokens ?? [],
    correct: sol.correct ?? -1,
    answers: sol.answers ?? [],
    order: sol.order ?? [],
    verb: sol.verb ?? -1,
    explain: (r.explanation as string) ?? "",
    hint: (r.hint as string) ?? "",
  };
}

export async function getUnits(): Promise<Unit[]> {
  const supabase = createClient();
  const { data } = await supabase.from("tr_units").select("*").order("sort_order", { ascending: true });
  return (data ?? []).map(toUnit);
}

export async function getUnitBySlug(slug: string): Promise<Unit | null> {
  const supabase = createClient();
  const { data } = await supabase.from("tr_units").select("*").eq("slug", slug).maybeSingle();
  return data ? toUnit(data) : null;
}

// Passende Übungs-Einheit zu einer Video-Lektion (für den "Jetzt üben"-Button).
export async function getUnitForLesson(lessonId: string): Promise<Unit | null> {
  const supabase = createClient();
  const { data } = await supabase.from("tr_units").select("*").eq("lesson_id", lessonId).maybeSingle();
  return data ? toUnit(data) : null;
}

export async function getExercises(unitId: string): Promise<Exercise[]> {
  const supabase = createClient();
  const { data } = await supabase.from("tr_exercises").select("*").eq("unit_id", unitId).order("sort_order", { ascending: true });
  return (data ?? []).map(toExercise);
}

// Freies Training: eine Aufgabe zusammen mit dem Thema, aus dem sie stammt –
// damit der Schüler beim gemischten Üben sieht, worum es gerade geht.
export type MixedItem = { ex: Exercise; unitTitle: string; unitSlug: string; level: string };

// Zieht `count` Aufgaben quer über die übergebenen Einheiten. `weightByUnit`
// (optional) verschiebt die Auswahl zu schwachen Themen: höheres Gewicht =
// häufiger gezogen. Ohne Gewichte ist alles gleich wahrscheinlich.
export async function getMixedExercises(
  units: { id: string; title: string; slug: string; level: string }[],
  count: number,
  weightByUnit?: Record<string, number>,
): Promise<MixedItem[]> {
  if (units.length === 0) return [];
  const supabase = createClient();
  const byId = new Map(units.map((u) => [u.id, u]));
  const { data } = await supabase.from("tr_exercises").select("*").in("unit_id", units.map((u) => u.id));

  const pool = (data ?? []).map((r) => {
    const u = byId.get(r.unit_id as string)!;
    return { ex: toExercise(r), unitTitle: u.title, unitSlug: u.slug, level: u.level, unitId: u.id };
  });

  // Gewichtete Ziehung ohne Zurücklegen.
  const weight = (unitId: string) => Math.max(0.0001, weightByUnit?.[unitId] ?? 1);
  const picked: typeof pool = [];
  while (picked.length < count && pool.length > 0) {
    const total = pool.reduce((s, it) => s + weight(it.unitId), 0);
    let r = Math.random() * total;
    let i = 0;
    for (; i < pool.length - 1; i++) { r -= weight(pool[i].unitId); if (r <= 0) break; }
    picked.push(pool[i]);
    pool.splice(i, 1);
  }
  return picked.map(({ ex, unitTitle, unitSlug, level }) => ({ ex, unitTitle, unitSlug, level }));
}

export async function getMyProgress(): Promise<Record<string, UnitProgress>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};
  const { data } = await supabase.from("tr_progress").select("*").eq("user_id", user.id);
  const out: Record<string, UnitProgress> = {};
  for (const r of data ?? []) {
    out[r.unit_id as string] = {
      mastery: (r.mastery as number) ?? 0,
      attempts: (r.attempts as number) ?? 0,
      completedAt: (r.completed_at as string) ?? null,
    };
  }
  return out;
}

// Einzelne Antwort protokollieren (Grundlage für Fehler-Pool und Auswertung).
export async function saveAttempt(exerciseId: string, correct: boolean, given: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("tr_attempts").insert({ user_id: user.id, exercise_id: exerciseId, correct, given: given.slice(0, 300) });
}

// Ergebnis einer Runde speichern – der beste Wert bleibt erhalten.
export async function saveUnitResult(unitId: string, mastery: number): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: prev } = await supabase
    .from("tr_progress").select("mastery, attempts").eq("user_id", user.id).eq("unit_id", unitId).maybeSingle();
  const best = Math.max(mastery, (prev?.mastery as number) ?? 0);
  await supabase.from("tr_progress").upsert(
    {
      user_id: user.id,
      unit_id: unitId,
      mastery: best,
      attempts: ((prev?.attempts as number) ?? 0) + 1,
      completed_at: best >= 80 ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,unit_id" },
  );
}

// ---------- Antwortprüfung ----------

// Vergleichsform: Kleinschreibung, Umlaute aufgelöst, Satzzeichen egal.
function norm(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[.,!?;:"„“”'()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Levenshtein-Distanz – erlaubt einen kleinen Tippfehler.
function dist(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 1) return 9;
  const m = a.length, n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

// Prüft eine Antwort. `given` ist bei "order" die Reihenfolge als \n-Liste.
export function checkAnswer(ex: Exercise, given: string): boolean {
  if (ex.kind === "choice") return String(ex.correct) === given.trim();
  if (ex.kind === "order") {
    const got = given.split("\n").map((t) => t.trim()).filter(Boolean);
    return got.length === ex.order.length && got.every((t, i) => norm(t) === norm(ex.order[i]));
  }
  // gap / error: gegen alle akzeptierten Lösungen prüfen.
  //
  // Ein Tippfehler wird nur bei MEHRWORT-Antworten verziehen, also bei ganzen
  // Sätzen. Dort geht es um den Satzbau, und an "Deutch" statt "Deutsch" soll
  // niemand scheitern.
  //
  // Bei Einwort-Antworten wird exakt geprüft, denn dort IST der eine Buchstabe
  // die Aufgabe: lerne/lernt, kann/kannst, der/den, weil/wenn. Mit Toleranz
  // hätte die Konjugations-Einheit "lernt" als "lerne" durchgewinkt.
  // Umlaute sind davon nicht betroffen - die werden vorher vereinheitlicht
  // (ä->ae), und wo es nötig ist, steht die ae-Schreibweise zusätzlich in der
  // Lösungsliste.
  const g = norm(given);
  if (!g) return false;
  return ex.answers.some((a) => {
    const t = norm(a);
    if (g === t) return true;
    return t.includes(" ") && dist(g, t) <= 1;
  });
}
