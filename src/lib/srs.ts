// ============================================================================
// Lern-Algorithmus (Spaced Repetition) — Anki-Stil, basierend auf SM-2.
// ----------------------------------------------------------------------------
// Idee: Karten, die du gut kannst, kommen in immer größeren Abständen wieder.
// Karten, die du falsch hast, kommen schnell zurück. So lernst du effizient.
//
// Du kannst den "persönlichen Algorithmus" hier oben über die Konstanten
// feinjustieren — keine andere Stelle im Code muss geändert werden.
// ============================================================================

import type { CardState, Rating } from "@/lib/types";

// ---- Stellschrauben (hier anpassen, um das Verhalten zu ändern) -----------
export const SRS = {
  startEase: 2.5, // Start-"Leichtigkeit" einer neuen Karte
  minEase: 1.3, // Leichtigkeit fällt nie darunter
  againEase: -0.2, // Änderung der Leichtigkeit bei "Again"
  hardEase: -0.15, // bei "Hard"
  easyEase: 0.15, // bei "Easy"
  hardMultiplier: 1.2, // Intervall × ... bei "Hard"
  easyBonus: 1.3, // zusätzlicher Faktor bei "Easy"
  firstIntervalDays: 1, // erstes Intervall nach erstem "Good"
  secondIntervalDays: 6, // zweites Intervall
  againIntervalMinutes: 10, // "Again": Karte kommt in ~10 Minuten zurück
};

// Frischer Lernzustand für eine neue Karte (sofort fällig).
export function newState(cardId: string): CardState {
  return {
    cardId,
    ease: SRS.startEase,
    intervalDays: 0,
    repetitions: 0,
    lapses: 0,
    dueAt: new Date().toISOString(),
    lastReviewedAt: null,
    flagged: false,
  };
}

function clampEase(ease: number): number {
  return Math.max(SRS.minEase, ease);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  return d;
}

function addMinutes(date: Date, minutes: number): Date {
  const d = new Date(date);
  d.setTime(d.getTime() + minutes * 60 * 1000);
  return d;
}

// Kern: berechnet den neuen Lernzustand aus dem alten + der Bewertung.
// `now` ist injizierbar (für Tests); Standard = jetzt.
export function schedule(state: CardState, rating: Rating, now: Date = new Date()): CardState {
  let { ease, intervalDays, repetitions, lapses } = state;

  if (rating === "again") {
    repetitions = 0;
    lapses += 1;
    ease = clampEase(ease + SRS.againEase);
    intervalDays = 0; // kurzfristig zurück (Minuten)
    return {
      ...state,
      ease,
      intervalDays,
      repetitions,
      lapses,
      dueAt: addMinutes(now, SRS.againIntervalMinutes).toISOString(),
      lastReviewedAt: now.toISOString(),
    };
  }

  // Richtig beantwortet (hard / good / easy)
  repetitions += 1;

  let nextInterval: number;
  if (repetitions === 1) {
    nextInterval = SRS.firstIntervalDays;
  } else if (repetitions === 2) {
    nextInterval = SRS.secondIntervalDays;
  } else {
    nextInterval = intervalDays * ease;
  }

  if (rating === "hard") {
    ease = clampEase(ease + SRS.hardEase);
    // "Hard" wächst nur sanft – mindestens etwas mehr als das alte Intervall.
    nextInterval = Math.max(intervalDays * SRS.hardMultiplier, SRS.firstIntervalDays);
  } else if (rating === "easy") {
    ease = clampEase(ease + SRS.easyEase);
    nextInterval = nextInterval * SRS.easyBonus;
  }
  // "good": ease unverändert.

  nextInterval = Math.max(SRS.firstIntervalDays, Math.round(nextInterval));

  return {
    ...state,
    ease,
    intervalDays: nextInterval,
    repetitions,
    lapses,
    dueAt: addDays(now, nextInterval).toISOString(),
    lastReviewedAt: now.toISOString(),
  };
}

// Hübsche Vorschau, wie weit jede Antwort die Karte nach hinten schiebt
// (für die Beschriftung der vier Knöpfe, z. B. "Good · 6d").
export function intervalPreview(state: CardState, rating: Rating): string {
  const next = schedule(state, rating);
  if (rating === "again") return `${SRS.againIntervalMinutes}m`;
  const d = next.intervalDays;
  if (d < 1) return "<1d";
  if (d < 30) return `${d}d`;
  if (d < 365) return `${Math.round(d / 30)}mo`;
  return `${(d / 365).toFixed(1)}y`;
}
