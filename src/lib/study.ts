"use client";

import { createClient } from "@/lib/supabase/client";
import { getCards, getCardsByIds, getAllCards, getAllCardRefs } from "@/lib/cards";
import { getDecks } from "@/lib/decks";
import { getAccess, canAccessVocabLevel } from "@/lib/access";
import { newState, schedule } from "@/lib/srs";
import type { Card, CardState, Rating } from "@/lib/types";

export type StudyItem = { card: Card; state: CardState };

// Wie viele NEUE Karten pro Tag eingeführt werden (fällige Wiederholungen
// kommen zusätzlich dazu und werden nicht gedeckelt).
export const DAILY_NEW_LIMIT = 15;

function startOfTodayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function stateFromRow(cardId: string, r: Record<string, unknown> | undefined): CardState {
  if (!r) return newState(cardId);
  return {
    cardId,
    ease: Number(r.ease ?? 2.5),
    intervalDays: Number(r.interval_days ?? 0),
    repetitions: Number(r.repetitions ?? 0),
    lapses: Number(r.lapses ?? 0),
    dueAt: (r.due_at as string) ?? new Date().toISOString(),
    lastReviewedAt: (r.last_reviewed_at as string) ?? null,
    flagged: Boolean(r.flagged),
  };
}

// Lädt die heute fälligen (und neuen) Karten eines Stapels, fällig zuerst.
export async function getDueItems(deckId: string): Promise<StudyItem[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const cards = await getCards(deckId);
  if (cards.length === 0) return [];

  const { data: states } = await supabase
    .from("fc_card_states")
    .select("*")
    .eq("user_id", user.id)
    .in("card_id", cards.map((c) => c.id));

  const byCard = new Map<string, Record<string, unknown>>();
  for (const s of states ?? []) byCard.set(s.card_id as string, s);

  const now = Date.now();
  const items: StudyItem[] = cards.map((card) => ({
    card,
    state: stateFromRow(card.id, byCard.get(card.id)),
  }));

  // Nur fällige Karten (neue Karten sind sofort fällig), fällig zuerst.
  return items
    .filter((it) => new Date(it.state.dueAt).getTime() <= now)
    .sort((a, b) => new Date(a.state.dueAt).getTime() - new Date(b.state.dueAt).getTime());
}

// Lädt ALLE Karten eines Stapels (für den Übungsmodus "bis alles sitzt"),
// jeweils mit dem aktuellen Lernzustand (oder einem frischen).
export async function getAllItems(deckId: string): Promise<StudyItem[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const cards = await getCards(deckId);
  if (cards.length === 0) return [];

  const { data: states } = await supabase
    .from("fc_card_states")
    .select("*")
    .eq("user_id", user.id)
    .in("card_id", cards.map((c) => c.id));

  const byCard = new Map<string, Record<string, unknown>>();
  for (const s of states ?? []) byCard.set(s.card_id as string, s);

  return cards.map((card) => ({ card, state: stateFromRow(card.id, byCard.get(card.id)) }));
}

// Speichert eine Bewertung: berechnet den neuen Zustand, schreibt ihn + Verlauf.
export async function reviewCard(state: CardState, rating: Rating): Promise<CardState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return state;

  const next = schedule(state, rating);

  await supabase.from("fc_card_states").upsert(
    {
      user_id: user.id,
      card_id: state.cardId,
      ease: next.ease,
      interval_days: next.intervalDays,
      repetitions: next.repetitions,
      lapses: next.lapses,
      due_at: next.dueAt,
      last_reviewed_at: next.lastReviewedAt,
    },
    { onConflict: "user_id,card_id" },
  );

  await supabase.from("fc_review_log").insert({
    user_id: user.id,
    card_id: state.cardId,
    rating,
    prev_interval: state.intervalDays,
    new_interval: next.intervalDays,
  });

  return next;
}

// Anzahl heute fälliger Karten (für Dashboard / Stapel-Liste).
export async function countDue(deckId: string): Promise<number> {
  const items = await getDueItems(deckId);
  return items.length;
}

// Alle Lernstände eines Nutzers – paginiert, damit auch > 1000 Zustände
// vollständig geladen werden (Supabase liefert sonst max. 1000 Zeilen).
async function getAllUserStates(userId: string): Promise<Record<string, unknown>[]> {
  const supabase = createClient();
  const PAGE = 1000;
  const all: Record<string, unknown>[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("fc_card_states")
      .select("*")
      .eq("user_id", userId)
      .order("card_id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error || !data || data.length === 0) break;
    all.push(...(data as Record<string, unknown>[]));
    if (data.length < PAGE) break;
  }
  return all;
}

// "Heute fällig" über ALLE Decks: fällige Wiederholungen + bis zu
// DAILY_NEW_LIMIT neue Karten (abzüglich der heute schon begonnenen neuen).
export async function getDueToday(): Promise<StudyItem[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Wenige Abfragen statt eine pro Deck: alle Decks, alle Karten, eigene Zustände.
  const [decks, cards, access] = await Promise.all([getDecks(), getAllCards(), getAccess()]);
  if (cards.length === 0) return [];
  const deckLevel = new Map(decks.map((d) => [d.id, d.level]));

  // Alle Lernzustände des Nutzers laden (paginiert, damit nichts abgeschnitten wird).
  const states = await getAllUserStates(user.id);

  const byCard = new Map<string, Record<string, unknown>>();
  for (const s of states) byCard.set(s.card_id as string, s);

  // Wie viele neue Karten wurden heute schon eingeführt?
  const today = startOfTodayISO();
  const newDoneToday = states.filter((s) => ((s.created_at as string) ?? "") >= today).length;
  const remainingNew = Math.max(0, DAILY_NEW_LIMIT - newDoneToday);

  const now = Date.now();
  const dueReviews: StudyItem[] = [];
  const newItems: StudyItem[] = [];

  for (const card of cards) {
    // Gesperrte Level (A2–B2 ohne Abo) tauchen im Tages-Review nicht auf.
    const level = deckLevel.get(card.deckId);
    if (level && !canAccessVocabLevel(access.tier, level)) continue;
    const row = byCard.get(card.id);
    if (row) {
      const state = stateFromRow(card.id, row);
      if (new Date(state.dueAt).getTime() <= now) dueReviews.push({ card, state });
    } else {
      newItems.push({ card, state: newState(card.id) });
    }
  }

  dueReviews.sort((a, b) => new Date(a.state.dueAt).getTime() - new Date(b.state.dueAt).getTime());
  return [...dueReviews, ...newItems.slice(0, remainingNew)];
}

// Anzahl heute fälliger Karten (für das Dashboard).
export async function countDueToday(): Promise<number> {
  return (await getDueToday()).length;
}

// Fortschritt je Deck: wie viele Karten schon "gekonnt" sind (repetitions >= 1).
// Wird für den Lernpfad und die Fortschrittsanzeige genutzt.
export type DeckProgress = { total: number; known: number };

export async function getDeckProgress(): Promise<Record<string, DeckProgress>> {
  const supabase = createClient();
  // Eine Abfrage für alle Karten-Referenzen statt eine pro Deck.
  const refs = await getAllCardRefs();

  const result: Record<string, DeckProgress> = {};
  const cardToDeck = new Map<string, string>();
  for (const r of refs) {
    if (!result[r.deckId]) result[r.deckId] = { total: 0, known: 0 };
    result[r.deckId].total += 1;
    cardToDeck.set(r.id, r.deckId);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return result;

  const states = await getAllUserStates(user.id);

  for (const s of states) {
    if (Number(s.repetitions) >= 1) {
      const deckId = cardToDeck.get(s.card_id as string);
      if (deckId && result[deckId]) result[deckId].known += 1;
    }
  }
  return result;
}

// Markiert eine Karte für später (oder hebt die Markierung auf).
export async function toggleFlag(state: CardState, flagged: boolean): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("fc_card_states").upsert(
    { user_id: user.id, card_id: state.cardId, flagged },
    { onConflict: "user_id,card_id" },
  );
}

// Lädt alle für später markierten Karten (über alle Stapel, unabhängig vom Fälligkeitsdatum).
export async function getFlaggedItems(): Promise<StudyItem[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: states } = await supabase
    .from("fc_card_states")
    .select("*")
    .eq("user_id", user.id)
    .eq("flagged", true);

  const rows = states ?? [];
  if (rows.length === 0) return [];

  const cards = await getCardsByIds(rows.map((s) => s.card_id as string));
  const byId = new Map(cards.map((c) => [c.id, c]));

  return rows
    .map((s) => {
      const card = byId.get(s.card_id as string);
      return card ? { card, state: stateFromRow(card.id, s) } : null;
    })
    .filter((x): x is StudyItem => x !== null);
}

export async function countFlagged(): Promise<number> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count } = await supabase
    .from("fc_card_states")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("flagged", true);
  return count ?? 0;
}

// Bereits GELERNTE Karten (repetitions >= 1) zum Wiederholen – optional nach Level.
// Läuft über ALLE Decks, unabhängig vom Fälligkeitsdatum.
export async function getLearnedItems(level?: string): Promise<StudyItem[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const [decks, cards, access] = await Promise.all([getDecks(), getAllCards(), getAccess()]);
  const deckLevel = new Map(decks.map((d) => [d.id, d.level]));

  const states = await getAllUserStates(user.id);
  const byCard = new Map<string, Record<string, unknown>>();
  for (const s of states) byCard.set(s.card_id as string, s);

  const items: StudyItem[] = [];
  for (const card of cards) {
    const lvl = deckLevel.get(card.deckId);
    if (!lvl) continue;
    if (level && lvl !== level) continue;
    if (!canAccessVocabLevel(access.tier, lvl)) continue;
    const row = byCard.get(card.id);
    if (!row || Number(row.repetitions) < 1) continue; // nur gelernte Karten
    items.push({ card, state: stateFromRow(card.id, row) });
  }
  return items;
}

// Zusammenfassung gelernter Karten (gesamt + je Level) für die Wiederhol-Übersicht.
export async function getLearnedSummary(): Promise<{ total: number; byLevel: Record<string, number> }> {
  const items = await getLearnedItemsWithLevel();
  const byLevel: Record<string, number> = {};
  for (const it of items) byLevel[it.level] = (byLevel[it.level] ?? 0) + 1;
  return { total: items.length, byLevel };
}

// interne Variante mit Level-Info
async function getLearnedItemsWithLevel(): Promise<(StudyItem & { level: string })[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const [decks, cards, access] = await Promise.all([getDecks(), getAllCards(), getAccess()]);
  const deckLevel = new Map(decks.map((d) => [d.id, d.level]));
  const states = await getAllUserStates(user.id);
  const byCard = new Map<string, Record<string, unknown>>();
  for (const s of states) byCard.set(s.card_id as string, s);
  const out: (StudyItem & { level: string })[] = [];
  for (const card of cards) {
    const lvl = deckLevel.get(card.deckId);
    if (!lvl || !canAccessVocabLevel(access.tier, lvl)) continue;
    const row = byCard.get(card.id);
    if (!row || Number(row.repetitions) < 1) continue;
    out.push({ card, state: stateFromRow(card.id, row), level: lvl });
  }
  return out;
}
