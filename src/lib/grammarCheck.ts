"use client";

import { createClient } from "@/lib/supabase/client";

// Grammatik-Check: findet Schwachstellen und schickt gezielt in die passende
// Trainings-Einheit.
//
// Bewusst anders als der Vokabeltest unter /exam: der schaetzt das Level,
// dieser findet THEMEN. Beides zusammen ergibt ein Bild.
//
// Aufbau: 11 Themen mal 3 Fragen. Drei, nicht eine - bei einer einzigen Frage
// diagnostiziert ein Fluechtigkeitsfehler eine Schwaeche, die keine ist.
// Alles Auswahlfragen, damit der Check in unter zehn Minuten durch ist.
//
// `unit` ist der Slug der Trainings-Einheit. Aendert sich dort ein Slug, muss
// er hier mitgeaendert werden - sonst zeigt das Ergebnis ins Leere.

export type CheckQuestion = {
  unit: string;
  level: string;
  topic: string;
  prompt: string;
  options: string[];
  correct: number;
};

export const CHECK_QUESTIONS: CheckQuestion[] = [
  // ── A1 · Artikel ─────────────────────────────────────────────────────────
  { unit: "articles", level: "A1", topic: "der, die, das",
    prompt: "___ Mädchen ist meine Schwester.",
    options: ["Der", "Die", "Das", "Den"], correct: 2 },
  { unit: "articles", level: "A1", topic: "der, die, das",
    prompt: "Which article does every noun take in the plural?",
    options: ["der", "die", "das", "the same as in the singular"], correct: 1 },
  { unit: "articles", level: "A1", topic: "der, die, das",
    prompt: "___ Wohnung ist groß.",
    options: ["Der", "Die", "Das", "Dem"], correct: 1 },

  // ── A1 · Verbposition ────────────────────────────────────────────────────
  { unit: "verb-position", level: "A1", topic: "Verb position",
    prompt: "Which sentence is correct?",
    options: ["Heute ich lerne Deutsch.", "Heute lerne ich Deutsch.", "Heute Deutsch ich lerne.", "Ich heute lerne Deutsch."], correct: 1 },
  { unit: "verb-position", level: "A1", topic: "Verb position",
    prompt: "In a German statement, the conjugated verb stands…",
    options: ["in first place", "in second place", "at the end", "anywhere"], correct: 1 },
  { unit: "verb-position", level: "A1", topic: "Verb position",
    prompt: "Which sentence is correct?",
    options: ["Morgen trinke ich Kaffee.", "Morgen ich trinke Kaffee.", "Morgen trinken ich Kaffee.", "Ich morgen trinke Kaffee."], correct: 0 },

  // ── A1 · Verneinung ──────────────────────────────────────────────────────
  { unit: "negation", level: "A1", topic: "nicht and kein",
    prompt: "Das ist ___ Buch.",
    options: ["nicht ein", "kein", "keine", "nicht"], correct: 1 },
  { unit: "negation", level: "A1", topic: "nicht and kein",
    prompt: "Which sentence is correct?",
    options: ["Ich habe nicht Zeit.", "Ich habe keine Zeit.", "Ich habe kein Zeit.", "Ich habe nicht eine Zeit."], correct: 1 },
  { unit: "negation", level: "A1", topic: "nicht and kein",
    prompt: "Ich arbeite heute ___ .",
    options: ["kein", "keine", "nicht", "nichts"], correct: 2 },

  // ── A2 · Fälle ───────────────────────────────────────────────────────────
  { unit: "cases", level: "A2", topic: "The four cases",
    prompt: "Ich sehe ___ Mann.",
    options: ["der", "den", "dem", "des"], correct: 1 },
  { unit: "cases", level: "A2", topic: "The four cases",
    prompt: "Ich helfe ___ Mann.",
    options: ["der", "den", "dem", "des"], correct: 2 },
  { unit: "cases", level: "A2", topic: "The four cases",
    prompt: "Der Mann gibt der Frau das Buch. Which case is der Frau?",
    options: ["Nominativ", "Akkusativ", "Dativ", "Genitiv"], correct: 2 },

  // ── A2 · Perfekt ─────────────────────────────────────────────────────────
  { unit: "perfekt", level: "A2", topic: "The past (Perfekt)",
    prompt: "Wir ___ nach Berlin gefahren.",
    options: ["haben", "sind", "waren", "hatten"], correct: 1 },
  { unit: "perfekt", level: "A2", topic: "The past (Perfekt)",
    prompt: "What is the Partizip II of aufstehen?",
    options: ["gestanden auf", "aufstanden", "aufgestanden", "geaufstanden"], correct: 2 },
  { unit: "perfekt", level: "A2", topic: "The past (Perfekt)",
    prompt: "Which sentence is correct?",
    options: ["Ich habe ein Buch gelesen.", "Ich bin ein Buch gelesen.", "Ich habe ein Buch lesen.", "Ich habe gelesen ein Buch."], correct: 0 },

  // ── A2 · Trennbare Verben ────────────────────────────────────────────────
  { unit: "separable-verbs", level: "A2", topic: "Separable verbs",
    prompt: "Which sentence is correct?",
    options: ["Ich aufstehe um sieben.", "Ich stehe um sieben auf.", "Ich stehe auf um sieben.", "Auf ich stehe um sieben."], correct: 1 },
  { unit: "separable-verbs", level: "A2", topic: "Separable verbs",
    prompt: "Which of these verbs does NOT separate?",
    options: ["ankommen", "einkaufen", "verstehen", "mitkommen"], correct: 2 },
  { unit: "separable-verbs", level: "A2", topic: "Separable verbs",
    prompt: "Which sentence is correct?",
    options: ["Ich muss um sieben aufstehen.", "Ich muss um sieben stehe auf.", "Ich muss auf um sieben stehen.", "Ich aufstehen muss um sieben."], correct: 0 },

  // ── A2 · Nebensätze ──────────────────────────────────────────────────────
  { unit: "subordinate-clauses", level: "A2", topic: "Subordinate clauses",
    prompt: "Which sentence is correct?",
    options: ["Ich bleibe zu Hause, weil ich bin müde.", "Ich bleibe zu Hause, weil ich müde bin.", "Ich bleibe zu Hause, weil bin ich müde.", "Ich bleibe zu Hause, weil müde ich bin."], correct: 1 },
  { unit: "subordinate-clauses", level: "A2", topic: "Subordinate clauses",
    prompt: "___ ich zehn war, wohnte ich in Berlin. (one single time in the past)",
    options: ["Wenn", "Als", "Ob", "Dass"], correct: 1 },
  { unit: "subordinate-clauses", level: "A2", topic: "Subordinate clauses",
    prompt: "Weil ich müde bin, ___ ich zu Hause.",
    options: ["bleibe", "bleiben", "ich bleibe", "bleibt"], correct: 0 },

  // ── A2 · Nebensatz mit Modalverb ─────────────────────────────────────────
  { unit: "subordinate-modals", level: "A2", topic: "Subordinate clauses with modals",
    prompt: "Which sentence is correct?",
    options: ["…, weil ich nicht kommen kann.", "…, weil ich kann nicht kommen.", "…, weil ich nicht kann kommen.", "…, weil kann ich nicht kommen."], correct: 0 },
  { unit: "subordinate-modals", level: "A2", topic: "Subordinate clauses with modals",
    prompt: "In a subordinate clause with a modal verb, which verb comes last?",
    options: ["the infinitive", "the modal verb", "either one", "the subject"], correct: 1 },
  { unit: "subordinate-modals", level: "A2", topic: "Subordinate clauses with modals",
    prompt: "Ich hoffe, dass du morgen kommen ___ .",
    options: ["kann", "kannst", "können", "könnt"], correct: 1 },

  // ── B1 · Adjektivendungen ────────────────────────────────────────────────
  { unit: "adjective-endings", level: "B1", topic: "Adjective endings",
    prompt: "Das ist ein ___ Wagen. (neu)",
    options: ["neue", "neuer", "neues", "neuen"], correct: 1 },
  { unit: "adjective-endings", level: "B1", topic: "Adjective endings",
    prompt: "Ich sehe den ___ Film. (gut)",
    options: ["gute", "guter", "gutes", "guten"], correct: 3 },
  { unit: "adjective-endings", level: "B1", topic: "Adjective endings",
    prompt: "Ich trinke ___ Wasser. (kalt, no article)",
    options: ["kalte", "kaltes", "kalter", "kaltem"], correct: 1 },

  // ── B1 · Relativsätze ────────────────────────────────────────────────────
  { unit: "relative-clauses", level: "B1", topic: "Relative clauses",
    prompt: "Das ist der Mann, ___ ich kenne.",
    options: ["der", "den", "dem", "das"], correct: 1 },
  { unit: "relative-clauses", level: "B1", topic: "Relative clauses",
    prompt: "Where does the case of the relative pronoun come from?",
    options: ["from the noun in front", "from its job inside the relative clause", "it is always Nominativ", "from the main verb"], correct: 1 },
  { unit: "relative-clauses", level: "B1", topic: "Relative clauses",
    prompt: "Which sentence is correct?",
    options: ["Das ist die Frau, die dort steht.", "Das ist die Frau, die steht dort.", "Das ist die Frau, der dort steht.", "Das ist die Frau, dass dort steht."], correct: 0 },

  // ── B2 · Konnektoren ─────────────────────────────────────────────────────
  { unit: "connectors", level: "B2", topic: "Connectors",
    prompt: "Ich bin müde, ___ bleibe ich zu Hause.",
    options: ["weil", "deshalb", "obwohl", "dass"], correct: 1 },
  { unit: "connectors", level: "B2", topic: "Connectors",
    prompt: "Which sentence is correct?",
    options: ["Ich bin müde, trotzdem ich arbeite.", "Ich bin müde, trotzdem arbeite ich.", "Ich bin müde, trotzdem ich arbeite nicht.", "Trotzdem ich müde bin, arbeite."], correct: 1 },
  { unit: "connectors", level: "B2", topic: "Connectors",
    prompt: "Which connector means the same as weil but leaves the word order alone?",
    options: ["obwohl", "denn", "deshalb", "damit"], correct: 1 },
];

export type TopicResult = { unit: string; level: string; topic: string; correct: number; total: number };

// Fasst die Antworten je Thema zusammen, schwaechstes Thema zuerst.
export function summarise(answers: (number | null)[]): TopicResult[] {
  const byUnit = new Map<string, TopicResult>();
  CHECK_QUESTIONS.forEach((q, i) => {
    const r = byUnit.get(q.unit) ?? { unit: q.unit, level: q.level, topic: q.topic, correct: 0, total: 0 };
    r.total += 1;
    if (answers[i] === q.correct) r.correct += 1;
    byUnit.set(q.unit, r);
  });
  return [...byUnit.values()].sort((a, b) => a.correct / a.total - b.correct / b.total);
}

export async function saveCheckResults(results: TopicResult[]): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "not signed in" };
  const rows = results.map((r) => ({ user_id: user.id, unit_slug: r.unit, correct: r.correct, total: r.total }));
  const { error } = await supabase.from("tr_check_results").insert(rows);
  return { error: error?.message };
}

// Letzter Durchlauf eines Schuelers, Thema fuer Thema.
export async function getMyLastCheck(): Promise<TopicResult[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("tr_check_results")
    .select("unit_slug, correct, total, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(40);
  if (!data || data.length === 0) return [];

  // Nur den juengsten Durchlauf: alles innerhalb einer Minute nach der
  // neuesten Zeile gehoert zusammen.
  const newest = new Date(data[0].created_at as string).getTime();
  const meta = new Map(CHECK_QUESTIONS.map((q) => [q.unit, q]));
  return data
    .filter((r) => newest - new Date(r.created_at as string).getTime() < 60_000)
    .map((r) => ({
      unit: r.unit_slug as string,
      level: meta.get(r.unit_slug as string)?.level ?? "",
      topic: meta.get(r.unit_slug as string)?.topic ?? (r.unit_slug as string),
      correct: r.correct as number,
      total: r.total as number,
    }))
    .sort((a, b) => a.correct / a.total - b.correct / b.total);
}
