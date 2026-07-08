// Typen für Lektionen & Trophäen.
// Die Lektionen liegen jetzt in der Datenbank (siehe src/lib/lessons.ts) und werden
// über den Lehrer-Bereich verwaltet. Trophäen bleiben vorerst fest.

export type QuizOption = { id: string; text: string };
export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
};

export type Material = { title: string; url: string };

export type Lesson = {
  id: string;
  title: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  topic: string;
  description: string;
  // YouTube-Video-ID (nicht gelistete Videos). Aus dem Link …watch?v=ABC123 → "ABC123".
  videoId: string;
  durationMin: number;
  // Freitext unter dem Video (Skool-Stil): Erklärungen, Links, Aufgaben. Zeilenumbrüche bleiben erhalten.
  body: string;
  // Wenn false, wird das Quiz für diese Lektion ausgeblendet (auch wenn Fragen hinterlegt sind).
  quizEnabled: boolean;
  quiz: QuizQuestion[];
  // PDF-Lernmaterial zum Herunterladen. Lege die PDFs in den Ordner public/materials/.
  materials: Material[];
  xp: number;
};

// Geschichten (Lesetexte) – eigener Bereich neben Videos & Flashcards.
export type Story = {
  id: string;
  title: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  // Optionale kurze Einleitung in der Liste.
  intro: string;
  // Der eigentliche Text der Geschichte (Zeilenumbrüche bleiben erhalten).
  body: string;
};

export type Trophy = {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAtXp: number;
};

export const TROPHIES: Trophy[] = [
  { id: "first-steps", name: "First steps", description: "Completed your first lesson", icon: "🌱", unlockedAtXp: 100 },
  { id: "rising", name: "Rising star", description: "Earned 250 XP", icon: "⭐", unlockedAtXp: 250 },
  { id: "fluent", name: "On your way to fluency", description: "Earned 450 XP", icon: "🏆", unlockedAtXp: 450 },
];
