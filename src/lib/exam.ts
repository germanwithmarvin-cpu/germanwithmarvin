"use client";

import { createClient } from "@/lib/supabase/client";
import { getDecks } from "@/lib/decks";
import { getCards } from "@/lib/cards";
import { LEVELS, type Level } from "@/lib/types";

export type Question = {
  cardId: string;
  level: Level;
  prompt: string; // Vorderseite (z. B. Englisch)
  correct: string; // richtige Rückseite (Deutsch)
  options: string[]; // 4 Antwortmöglichkeiten, gemischt
};

export type ExamResult = {
  score: number;
  total: number;
  level: Level;
  perLevel: { level: Level; correct: number; total: number }[];
};

const MAX_QUESTIONS = 15;
const OPTIONS_PER_QUESTION = 4;
const PASS_THRESHOLD = 0.6; // ab 60 % richtig gilt ein Level als bestanden

type PoolCard = { id: string; front: string; back: string; level: Level };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Sammelt alle (für den Nutzer sichtbaren) Karten mit ihrem Level.
async function buildPool(): Promise<PoolCard[]> {
  const decks = await getDecks();
  const pool: PoolCard[] = [];
  await Promise.all(
    decks.map(async (deck) => {
      const cards = await getCards(deck.id);
      for (const c of cards) {
        if (c.front.trim() && c.back.trim()) {
          pool.push({ id: c.id, front: c.front, back: c.back, level: deck.level });
        }
      }
    }),
  );
  return pool;
}

// Baut die Prüfung: Fragen gleichmäßig über die vorhandenen Level verteilt,
// jede mit einer richtigen Antwort + Ablenkern (möglichst vom selben Level).
export async function buildExam(): Promise<{ questions: Question[]; error?: string }> {
  const pool = await buildPool();
  if (pool.length < OPTIONS_PER_QUESTION) {
    return { questions: [], error: "Not enough vocabulary yet to run a test. Ask your teacher to add more cards." };
  }

  // Karten nach Level gruppieren (in fester Reihenfolge A1→C1).
  const byLevel = new Map<Level, PoolCard[]>();
  for (const c of pool) {
    if (!byLevel.has(c.level)) byLevel.set(c.level, []);
    byLevel.get(c.level)!.push(c);
  }
  const levelsPresent = LEVELS.filter((l) => byLevel.has(l));

  // Fragen-Budget gleichmäßig auf die Level verteilen.
  const perLevelCount = Math.max(1, Math.floor(MAX_QUESTIONS / levelsPresent.length));

  const chosen: PoolCard[] = [];
  for (const level of levelsPresent) {
    const cards = shuffle(byLevel.get(level)!);
    chosen.push(...cards.slice(0, perLevelCount));
  }

  const questions: Question[] = shuffle(chosen)
    .slice(0, MAX_QUESTIONS)
    .map((card) => {
      // Ablenker: andere Rückseiten, bevorzugt vom selben Level.
      const sameLevel = (byLevel.get(card.level) ?? []).filter((c) => c.id !== card.id && c.back !== card.back);
      const others = pool.filter((c) => c.id !== card.id && c.back !== card.back);
      const distractorPool = sameLevel.length >= OPTIONS_PER_QUESTION - 1 ? sameLevel : others;

      const distractors: string[] = [];
      for (const c of shuffle(distractorPool)) {
        if (distractors.length >= OPTIONS_PER_QUESTION - 1) break;
        if (!distractors.includes(c.back)) distractors.push(c.back);
      }

      return {
        cardId: card.id,
        level: card.level,
        prompt: card.front,
        correct: card.back,
        options: shuffle([card.back, ...distractors]),
      };
    });

  return { questions };
}

// Wertet die Antworten aus und schätzt das Level.
export function estimateLevel(
  questions: Question[],
  answers: (string | null)[],
): ExamResult {
  let score = 0;
  const tally = new Map<Level, { correct: number; total: number }>();

  questions.forEach((q, i) => {
    const t = tally.get(q.level) ?? { correct: 0, total: 0 };
    t.total += 1;
    if (answers[i] === q.correct) { t.correct += 1; score += 1; }
    tally.set(q.level, t);
  });

  const perLevel = LEVELS.filter((l) => tally.has(l)).map((level) => ({
    level,
    correct: tally.get(level)!.correct,
    total: tally.get(level)!.total,
  }));

  // Höchstes Level, bei dem (und bei allen darunter) ≥ 60 % erreicht wurden.
  let estimate: Level = perLevel[0]?.level ?? "A1";
  for (const row of perLevel) {
    if (row.correct / row.total >= PASS_THRESHOLD) estimate = row.level;
    else break;
  }

  return { score, total: questions.length, level: estimate, perLevel };
}

// Speichert das Ergebnis (für den Verlauf).
export async function saveExamResult(result: ExamResult): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("fc_exam_results").insert({
    user_id: user.id,
    score: result.score,
    total: result.total,
    level_estimate: result.level,
  });
}
