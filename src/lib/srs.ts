// ============================================================================
// Lern-Algorithmus: FSRS (Free Spaced Repetition Scheduler, v4.5).
// ----------------------------------------------------------------------------
// FSRS modelliert das Gedächtnis mit zwei Werten pro Karte:
//   • stability  – wie lange die Karte "hält" (in Tagen)
//   • difficulty – wie zäh die Karte ist (1–10)
// Daraus wird die Erinnerungswahrscheinlichkeit vorhergesagt und die nächste
// Wiederholung genau auf die Ziel-Trefferquote (REQUEST_RETENTION) geplant.
// Effizienter als das alte SM-2 (weniger Wiederholungen bei gleicher Merkleistung).
// ============================================================================

import type { CardState, Rating } from "@/lib/types";

// ---- Stellschrauben --------------------------------------------------------
export const SRS = {
  requestRetention: 0.9, // Ziel-Trefferquote (0.9 = 90 %)
  againIntervalMinutes: 10, // "Again": Karte kommt kurzfristig zurück
  fuzzPercent: 0.05, // ±5 % Streuung auf lange Intervalle (verhindert Karten-Stau)
  maximumIntervalDays: 36500, // Deckel (100 Jahre)
};

// FSRS-4.5 Standard-Parameter (17 Gewichte). Später pro Nutzer optimierbar.
const W = [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61];

const DECAY = -0.5;
const FACTOR = 19 / 81; // = 0.9^(1/DECAY) - 1  → Intervall = stability bei R=0.9
const MIN_STABILITY = 0.1;

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const ratingNum = (r: Rating): number => ({ again: 1, hard: 2, good: 3, easy: 4 }[r]);

// Frischer Lernzustand für eine neue Karte (sofort fällig, noch kein FSRS-Modell).
export function newState(cardId: string): CardState {
  return {
    cardId,
    ease: 2.5,
    intervalDays: 0,
    repetitions: 0,
    lapses: 0,
    stability: 0,
    difficulty: 0,
    dueAt: new Date().toISOString(),
    lastReviewedAt: null,
    flagged: false,
  };
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}
function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}
function daysBetween(fromISO: string | null, now: Date): number {
  if (!fromISO) return 0;
  return Math.max(0, (now.getTime() - new Date(fromISO).getTime()) / (24 * 60 * 60 * 1000));
}

// Streut größere Intervalle leicht zufällig (wie in Anki).
function fuzz(days: number): number {
  if (days < 4) return days;
  const spread = days * SRS.fuzzPercent;
  return days + (Math.random() * 2 - 1) * spread;
}

// ---- FSRS-Formeln ----------------------------------------------------------
function retrievability(elapsedDays: number, stability: number): number {
  return Math.pow(1 + (FACTOR * elapsedDays) / stability, DECAY);
}

function initStability(g: number): number {
  return clamp(W[g - 1], MIN_STABILITY, SRS.maximumIntervalDays);
}
function initDifficulty(g: number): number {
  return clamp(W[4] - W[5] * (g - 3), 1, 10);
}
function nextDifficulty(d: number, g: number): number {
  const delta = d - W[6] * (g - 3);
  // Rückführung Richtung "Good"-Startschwierigkeit (Mean Reversion).
  return clamp(W[7] * W[4] + (1 - W[7]) * delta, 1, 10);
}
function recallStability(d: number, s: number, r: number, g: number): number {
  const hard = g === 2 ? W[15] : 1;
  const easy = g === 4 ? W[16] : 1;
  return s * (1 + Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp((1 - r) * W[10]) - 1) * hard * easy);
}
function forgetStability(d: number, s: number, r: number): number {
  return W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp((1 - r) * W[14]);
}

// Nächstes Intervall (Tage) aus der Stabilität für die Ziel-Trefferquote.
function nextInterval(stability: number): number {
  const raw = (stability / FACTOR) * (Math.pow(SRS.requestRetention, 1 / DECAY) - 1);
  return clamp(Math.round(fuzz(raw)), 1, SRS.maximumIntervalDays);
}

// Kern: neuer Lernzustand aus altem + Bewertung. `now` injizierbar (Tests).
export function schedule(state: CardState, rating: Rating, now: Date = new Date()): CardState {
  const g = ratingNum(rating);
  const firstTime = !state.stability || state.stability <= 0;

  let stability: number;
  let difficulty: number;
  if (firstTime) {
    stability = initStability(g);
    difficulty = initDifficulty(g);
  } else {
    const r = retrievability(daysBetween(state.lastReviewedAt, now), state.stability);
    difficulty = nextDifficulty(state.difficulty, g);
    stability = g === 1 ? forgetStability(difficulty, state.stability, r) : recallStability(difficulty, state.stability, r, g);
  }
  stability = Math.max(MIN_STABILITY, stability);

  const lapses = state.lapses + (g === 1 ? 1 : 0);
  const repetitions = g === 1 ? 0 : state.repetitions + 1;
  const interval = nextInterval(stability);

  // "Again" → kurzfristig zurück (Relearning, gilt in der Session als 0 Tage).
  const dueAt = g === 1 ? addMinutes(now, SRS.againIntervalMinutes) : addDays(now, interval);

  return {
    ...state,
    stability,
    difficulty,
    intervalDays: g === 1 ? 0 : interval,
    repetitions,
    lapses,
    dueAt: dueAt.toISOString(),
    lastReviewedAt: now.toISOString(),
  };
}

// Vorschau der vier Knöpfe (z. B. "Good · 6d").
export function intervalPreview(state: CardState, rating: Rating): string {
  if (rating === "again") return `${SRS.againIntervalMinutes}m`;
  const d = schedule(state, rating).intervalDays;
  if (d < 1) return "<1d";
  if (d < 30) return `${d}d`;
  if (d < 365) return `${Math.round(d / 30)}mo`;
  return `${(d / 365).toFixed(1)}y`;
}
