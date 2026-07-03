"use client";

import type { Question } from "@/lib/exam";
import type { Level } from "@/lib/types";

// Fester, kuratierter Einstufungstest: 40 Fragen, 10 je Level (A1–B2).
// Jede Frage zeigt ein deutsches Wort; gesucht ist die englische Bedeutung.
type Item = { level: Level; prompt: string; correct: string; distractors: [string, string, string] };

export const PLACEMENT_ITEMS: Item[] = [
  // ---------------- A1 ----------------
  { level: "A1", prompt: "das Haus", correct: "the house", distractors: ["the tree", "the car", "the table"] },
  { level: "A1", prompt: "essen", correct: "to eat", distractors: ["to drink", "to sleep", "to run"] },
  { level: "A1", prompt: "die Katze", correct: "the cat", distractors: ["the dog", "the bird", "the fish"] },
  { level: "A1", prompt: "groß", correct: "big / tall", distractors: ["small", "fast", "cold"] },
  { level: "A1", prompt: "danke", correct: "thank you", distractors: ["please", "hello", "sorry"] },
  { level: "A1", prompt: "das Wasser", correct: "the water", distractors: ["the bread", "the milk", "the wine"] },
  { level: "A1", prompt: "gehen", correct: "to go / to walk", distractors: ["to come", "to stand", "to sit"] },
  { level: "A1", prompt: "die Familie", correct: "the family", distractors: ["the friend", "the school", "the city"] },
  { level: "A1", prompt: "heute", correct: "today", distractors: ["tomorrow", "yesterday", "never"] },
  { level: "A1", prompt: "rot", correct: "red", distractors: ["blue", "green", "yellow"] },

  // ---------------- A2 ----------------
  { level: "A2", prompt: "der Bahnhof", correct: "the train station", distractors: ["the airport", "the harbour", "the bus stop"] },
  { level: "A2", prompt: "einkaufen", correct: "to go shopping", distractors: ["to cook", "to clean", "to pay"] },
  { level: "A2", prompt: "das Wetter", correct: "the weather", distractors: ["the time", "the year", "the season"] },
  { level: "A2", prompt: "müde", correct: "tired", distractors: ["hungry", "happy", "angry"] },
  { level: "A2", prompt: "die Arbeit", correct: "the work / the job", distractors: ["the holiday", "the money", "the office"] },
  { level: "A2", prompt: "erklären", correct: "to explain", distractors: ["to ask", "to answer", "to forget"] },
  { level: "A2", prompt: "gesund", correct: "healthy", distractors: ["sick", "strong", "weak"] },
  { level: "A2", prompt: "die Reise", correct: "the trip / journey", distractors: ["the ticket", "the map", "the hotel"] },
  { level: "A2", prompt: "vielleicht", correct: "maybe / perhaps", distractors: ["always", "never", "often"] },
  { level: "A2", prompt: "sich treffen", correct: "to meet", distractors: ["to leave", "to wait", "to call"] },

  // ---------------- B1 ----------------
  { level: "B1", prompt: "die Umwelt", correct: "the environment", distractors: ["the society", "the economy", "the future"] },
  { level: "B1", prompt: "sich bewerben", correct: "to apply (for a job)", distractors: ["to resign", "to earn", "to hire"] },
  { level: "B1", prompt: "die Erfahrung", correct: "the experience", distractors: ["the education", "the knowledge", "the opinion"] },
  { level: "B1", prompt: "überzeugen", correct: "to convince", distractors: ["to confuse", "to doubt", "to promise"] },
  { level: "B1", prompt: "der Vorteil", correct: "the advantage", distractors: ["the disadvantage", "the reason", "the result"] },
  { level: "B1", prompt: "verbessern", correct: "to improve", distractors: ["to compare", "to repeat", "to reduce"] },
  { level: "B1", prompt: "wahrscheinlich", correct: "probably", distractors: ["certainly", "hardly", "exactly"] },
  { level: "B1", prompt: "die Bedingung", correct: "the condition / requirement", distractors: ["the decision", "the suggestion", "the exception"] },
  { level: "B1", prompt: "sich gewöhnen an", correct: "to get used to", distractors: ["to give up", "to depend on", "to insist on"] },
  { level: "B1", prompt: "die Gesundheit", correct: "the health", distractors: ["the illness", "the treatment", "the insurance"] },

  // ---------------- B2 ----------------
  { level: "B2", prompt: "die Nachhaltigkeit", correct: "sustainability", distractors: ["availability", "responsibility", "reliability"] },
  { level: "B2", prompt: "zunehmen", correct: "to increase", distractors: ["to decrease", "to disappear", "to remain"] },
  { level: "B2", prompt: "der Zusammenhang", correct: "the connection / context", distractors: ["the contradiction", "the conclusion", "the comparison"] },
  { level: "B2", prompt: "berücksichtigen", correct: "to take into account", distractors: ["to neglect", "to assume", "to exaggerate"] },
  { level: "B2", prompt: "die Auswirkung", correct: "the effect / impact", distractors: ["the intention", "the measure", "the source"] },
  { level: "B2", prompt: "voraussetzen", correct: "to presuppose / require", distractors: ["to postpone", "to predict", "to prevent"] },
  { level: "B2", prompt: "die Herausforderung", correct: "the challenge", distractors: ["the agreement", "the achievement", "the opportunity"] },
  { level: "B2", prompt: "nachvollziehbar", correct: "understandable / comprehensible", distractors: ["inevitable", "questionable", "negligible"] },
  { level: "B2", prompt: "die Voraussetzung", correct: "the prerequisite", distractors: ["the consequence", "the assumption", "the restriction"] },
  { level: "B2", prompt: "sich auseinandersetzen mit", correct: "to engage with / examine", distractors: ["to agree with", "to interfere with", "to comply with"] },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Baut die Prüfung: feste Fragen, aber die Antwort-Optionen werden gemischt.
// Reihenfolge der Level bleibt (A1→B2), damit der Fortschritt logisch wirkt.
export function buildPlacementExam(): Question[] {
  return PLACEMENT_ITEMS.map((item, i) => ({
    cardId: `placement-${i}`,
    level: item.level,
    prompt: item.prompt,
    correct: item.correct,
    options: shuffle([item.correct, ...item.distractors]),
  }));
}
