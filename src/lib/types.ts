// Zentrale Typen der Karteikarten-App.

export type Level = "A1" | "A2" | "B1" | "B2" | "C1";
export const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1"];

// Ein Kartenstapel (z. B. "Verben A1").
export type Deck = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  level: Level;
  isPublished: boolean;
  sortOrder: number;
  category: string; // 'path' = normaler Lernpfad, 'grammar' = Grammatik-Extra-Deck
  createdAt?: string;
};

// Eine Karteikarte. In den Vokabel-Seeds gilt: front = Deutsch (mit Artikel),
// back = Englisch (Übersetzung). example = deutscher Satz, exampleEn = englisch.
export type Card = {
  id: string;
  deckId: string;
  front: string; // Deutsch (wird vorgesprochen)
  back: string; // Englische Übersetzung
  imageUrl: string | null;
  audioUrl: string | null; // Aussprache des Wortes
  exampleAudioUrl: string | null; // Aussprache des Beispielsatzes
  tags: string[];
  notes: string;
  example: string; // Beispielsatz auf Deutsch
  exampleEn: string; // englische Übersetzung des Beispielsatzes
  sortOrder: number;
  createdAt?: string;
};

// Bewertung in der Lern-Session (wie Anki).
export type Rating = "again" | "hard" | "good" | "easy";

// Lernzustand einer Karte pro Schüler (Kern des Algorithmus).
export type CardState = {
  cardId: string;
  ease: number; // (Alt-SM2, nur noch informativ) "Leichtigkeit"
  intervalDays: number; // aktueller Abstand bis zur nächsten Wiederholung (abgeleitet)
  repetitions: number; // wie oft hintereinander korrekt
  lapses: number; // wie oft "Again" gedrückt
  // FSRS-Gedächtnismodell:
  stability: number; // wie lange die Karte "hält" (Tage); 0 = neu/kein Modell
  difficulty: number; // wie zäh die Karte ist (1–10); 0 = neu
  dueAt: string; // ISO-Zeit, wann die Karte wieder fällig ist
  lastReviewedAt: string | null;
  flagged: boolean; // vom Schüler für später markiert
};
