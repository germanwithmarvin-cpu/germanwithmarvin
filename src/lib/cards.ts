"use client";

import { createClient } from "@/lib/supabase/client";
import type { Card } from "@/lib/types";

function fromRow(r: Record<string, unknown>): Card {
  return {
    id: r.id as string,
    deckId: (r.deck_id as string) ?? "",
    front: (r.front as string) ?? "",
    back: (r.back as string) ?? "",
    imageUrl: (r.image_url as string) ?? null,
    audioUrl: (r.audio_url as string) ?? null,
    tags: (r.tags as string[]) ?? [],
    notes: (r.notes as string) ?? "",
    example: (r.example as string) ?? "",
    exampleEn: (r.example_en as string) ?? "",
    sortOrder: (r.sort_order as number) ?? 0,
    createdAt: r.created_at as string | undefined,
  };
}

function toRow(card: Partial<Card>) {
  const row: Record<string, unknown> = {};
  if (card.id) row.id = card.id;
  if (card.deckId !== undefined) row.deck_id = card.deckId;
  if (card.front !== undefined) row.front = card.front;
  if (card.back !== undefined) row.back = card.back;
  if (card.imageUrl !== undefined) row.image_url = card.imageUrl;
  if (card.audioUrl !== undefined) row.audio_url = card.audioUrl;
  if (card.tags !== undefined) row.tags = card.tags;
  if (card.notes !== undefined) row.notes = card.notes;
  if (card.example !== undefined) row.example = card.example;
  if (card.exampleEn !== undefined) row.example_en = card.exampleEn;
  if (card.sortOrder !== undefined) row.sort_order = card.sortOrder;
  return row;
}

// Alle Karten eines Stapels (Reihenfolge wie angelegt).
export async function getCards(deckId: string): Promise<Card[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("fc_cards")
    .select("*")
    .eq("deck_id", deckId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  return (data ?? []).map(fromRow);
}

export async function saveCard(card: Partial<Card>): Promise<{ error?: string; id?: string }> {
  const supabase = createClient();
  const { data, error } = await supabase.from("fc_cards").upsert(toRow(card)).select("id").single();
  return { error: error?.message, id: data?.id as string | undefined };
}

// Viele Karten auf einmal anlegen (z. B. CSV-Import).
export async function insertCards(cards: Partial<Card>[]): Promise<{ error?: string; count: number }> {
  const supabase = createClient();
  const rows = cards.map(toRow);
  const { data, error } = await supabase.from("fc_cards").insert(rows).select("id");
  return { error: error?.message, count: data?.length ?? 0 };
}

export async function deleteCard(id: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from("fc_cards").delete().eq("id", id);
  return { error: error?.message };
}

// Karten anhand einer Liste von IDs laden (z. B. für markierte Karten).
export async function getCardsByIds(ids: string[]): Promise<Card[]> {
  if (ids.length === 0) return [];
  const supabase = createClient();
  const { data } = await supabase.from("fc_cards").select("*").in("id", ids);
  return (data ?? []).map(fromRow);
}

// Supabase/PostgREST liefert pro Abfrage max. 1000 Zeilen. Bei > 1000 Karten
// müssen wir seitenweise (paginiert) laden, sonst fehlen Karten.
const PAGE_SIZE = 1000;

// ALLE sichtbaren Karten (paginiert, damit auch > 1000 Karten vollständig geladen werden).
export async function getAllCards(): Promise<Card[]> {
  const supabase = createClient();
  const all: Card[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("fc_cards")
      .select("*")
      .order("deck_id", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error || !data || data.length === 0) break;
    all.push(...data.map(fromRow));
    if (data.length < PAGE_SIZE) break;
  }
  return all;
}

// Nur Karten-Referenzen (id + deck_id) – leichtgewichtig zum Zählen, ebenfalls paginiert.
export async function getAllCardRefs(): Promise<{ id: string; deckId: string }[]> {
  const supabase = createClient();
  const all: { id: string; deckId: string }[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("fc_cards")
      .select("id, deck_id")
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error || !data || data.length === 0) break;
    all.push(...data.map((r) => ({ id: r.id as string, deckId: r.deck_id as string })));
    if (data.length < PAGE_SIZE) break;
  }
  return all;
}

// Anzahl Karten pro Stapel (für Fortschrittsanzeige).
export async function countCards(deckId: string): Promise<number> {
  const supabase = createClient();
  const { count } = await supabase
    .from("fc_cards")
    .select("*", { count: "exact", head: true })
    .eq("deck_id", deckId);
  return count ?? 0;
}
