"use client";

import { createClient } from "@/lib/supabase/client";
import type { Deck, Level } from "@/lib/types";

// Wandelt eine Datenbank-Zeile (snake_case) in das Deck-Format (camelCase) um.
function fromRow(r: Record<string, unknown>): Deck {
  return {
    id: r.id as string,
    ownerId: (r.owner_id as string) ?? "",
    title: (r.title as string) ?? "",
    description: (r.description as string) ?? "",
    level: ((r.level as Level) ?? "A1"),
    isPublished: Boolean(r.is_published),
    sortOrder: (r.sort_order as number) ?? 0,
    category: (r.category as string) ?? "path",
    createdAt: r.created_at as string | undefined,
  };
}

function toRow(deck: Partial<Deck>) {
  const row: Record<string, unknown> = {};
  if (deck.id) row.id = deck.id;
  if (deck.ownerId) row.owner_id = deck.ownerId;
  if (deck.title !== undefined) row.title = deck.title;
  if (deck.description !== undefined) row.description = deck.description;
  if (deck.level !== undefined) row.level = deck.level;
  if (deck.isPublished !== undefined) row.is_published = deck.isPublished;
  if (deck.sortOrder !== undefined) row.sort_order = deck.sortOrder;
  if (deck.category !== undefined) row.category = deck.category;
  return row;
}

// Alle für den aktuellen Nutzer sichtbaren Stapel (RLS filtert: Schüler nur
// veröffentlichte, Lehrer alle).
export async function getDecks(): Promise<Deck[]> {
  const supabase = createClient();
  const { data } = await supabase.from("fc_decks").select("*").order("sort_order", { ascending: true });
  return (data ?? []).map(fromRow);
}

export async function getDeck(id: string): Promise<Deck | null> {
  const supabase = createClient();
  const { data } = await supabase.from("fc_decks").select("*").eq("id", id).single();
  return data ? fromRow(data) : null;
}

// Anlegen oder Aktualisieren. Beim Anlegen wird der eingeloggte Lehrer als owner gesetzt.
export async function saveDeck(deck: Partial<Deck>): Promise<{ error?: string; id?: string }> {
  const supabase = createClient();
  if (!deck.id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not signed in." };
    deck.ownerId = user.id;
  }
  const { data, error } = await supabase.from("fc_decks").upsert(toRow(deck)).select("id").single();
  return { error: error?.message, id: data?.id as string | undefined };
}

export async function deleteDeck(id: string): Promise<{ error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from("fc_decks").delete().eq("id", id);
  return { error: error?.message };
}
