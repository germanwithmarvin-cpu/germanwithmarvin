"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getDecks, saveDeck, deleteDeck } from "@/lib/decks";
import { getCards, saveCard, deleteCard, getAllCardRefs } from "@/lib/cards";
import { LEVELS, type Deck, type Card, type Level } from "@/lib/types";
import CardForm from "./CardForm";
import CsvImport from "./CsvImport";

export default function DecksAdmin() {
  const [checking, setChecking] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);

  const [decks, setDecks] = useState<Deck[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Lehrer-Check.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data } = await supabase.from("profiles").select("is_teacher").eq("id", user.id).single();
        setIsTeacher(Boolean(data?.is_teacher));
      }
      setChecking(false);
    });
  }, []);

  const reloadDecks = useCallback(async () => {
    const d = await getDecks();
    setDecks(d);
    // Kartenzahl je Deck in EINER Abfrage (statt eine pro Deck).
    const refs = await getAllCardRefs();
    const counts: Record<string, number> = {};
    for (const deck of d) counts[deck.id] = 0;
    for (const r of refs) if (counts[r.deckId] !== undefined) counts[r.deckId] += 1;
    setCounts(counts);
    return d;
  }, []);

  useEffect(() => {
    if (isTeacher) reloadDecks();
  }, [isTeacher, reloadDecks]);

  const reloadCards = useCallback(async (deckId: string) => {
    setCards(await getCards(deckId));
  }, []);

  useEffect(() => {
    if (selectedId) reloadCards(selectedId);
    else setCards([]);
  }, [selectedId, reloadCards]);

  const selectedDeck = decks.find((d) => d.id === selectedId) ?? null;

  async function handleNewDeck() {
    setBusy(true);
    const { id } = await saveDeck({ title: "New deck", level: "A1", isPublished: false, sortOrder: decks.length });
    await reloadDecks();
    if (id) setSelectedId(id);
    setBusy(false);
  }

  async function handleDeckField(field: Partial<Deck>) {
    if (!selectedDeck) return;
    await saveDeck({ id: selectedDeck.id, ...field });
    await reloadDecks();
  }

  async function handleDeleteDeck(deck: Deck) {
    if (!confirm(`Delete deck "${deck.title}" and all its cards? This cannot be undone.`)) return;
    const { error } = await deleteDeck(deck.id);
    if (error) {
      alert(`Could not delete: ${error}`);
      return;
    }
    if (selectedId === deck.id) setSelectedId(null);
    await reloadDecks();
  }

  async function handleAddCard(fields: Partial<Card>) {
    if (!selectedId) return;
    await saveCard({ ...fields, deckId: selectedId, sortOrder: cards.length });
    await reloadCards(selectedId);
  }

  async function handleEditCard(cardId: string, fields: Partial<Card>) {
    await saveCard({ ...fields, id: cardId });
    setEditingCardId(null);
    if (selectedId) await reloadCards(selectedId);
  }

  async function handleDeleteCard(cardId: string) {
    if (!confirm("Delete this card?")) return;
    await deleteCard(cardId);
    if (selectedId) await reloadCards(selectedId);
  }

  if (checking) return <p className="text-cream-dim">Loading…</p>;
  if (!isTeacher) {
    return (
      <div className="card p-6 text-cream-dim">
        This area is for teachers only. If this is your account, mark it as a teacher in the
        database (see <code className="text-gold-bright">supabase/flashcards.sql</code>, last section).
      </div>
    );
  }

  const inputCls = "w-full rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold";

  return (
    <div className="grid md:grid-cols-[16rem_1fr] gap-6">
      {/* Stapel-Liste */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Decks</h2>
          <button onClick={handleNewDeck} disabled={busy} className="btn-gold px-3 py-1.5 text-xs">+ New</button>
        </div>
        <div className="space-y-1">
          {decks.map((d) => {
            const count = counts[d.id];
            const empty = count === 0;
            return (
              <div
                key={d.id}
                className={`flex items-stretch rounded-lg transition ${
                  selectedId === d.id ? "bg-gold/20" : "hover:bg-gold/10"
                }`}
              >
                <button
                  onClick={() => setSelectedId(d.id)}
                  className={`flex-1 text-left px-3 py-2 text-sm min-w-0 ${selectedId === d.id ? "text-cream" : "text-cream-dim"}`}
                  title="Edit this deck"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate">{d.title}</span>
                    <span className="text-xs shrink-0">{d.isPublished ? "🟢" : "⚪️"}</span>
                  </span>
                  <span className="text-xs text-cream-dim">
                    {d.level} · {count === undefined ? "…" : empty ? <span className="text-red-300">empty</span> : `${count} cards`}
                  </span>
                </button>
                <button
                  onClick={() => handleDeleteDeck(d)}
                  className="px-2 text-cream-dim hover:text-red-300 shrink-0"
                  title="Delete this deck"
                  aria-label={`Delete ${d.title}`}
                >
                  🗑
                </button>
              </div>
            );
          })}
          {decks.length === 0 && <p className="text-sm text-cream-dim">No decks yet.</p>}
        </div>
      </div>

      {/* Editor */}
      <div>
        {!selectedDeck && <p className="text-cream-dim">Select a deck on the left, or create a new one.</p>}

        {selectedDeck && (
          <div className="space-y-6">
            {/* Stapel-Einstellungen */}
            <div className="card p-4 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1 text-cream-dim">Title</label>
                  <input
                    defaultValue={selectedDeck.title}
                    onBlur={(e) => handleDeckField({ title: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-cream-dim">Level</label>
                  <select
                    value={selectedDeck.level}
                    onChange={(e) => handleDeckField({ level: e.target.value as Level })}
                    className={inputCls}
                  >
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1 text-cream-dim">Description</label>
                <input
                  defaultValue={selectedDeck.description}
                  onBlur={(e) => handleDeckField({ description: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedDeck.isPublished}
                    onChange={(e) => handleDeckField({ isPublished: e.target.checked })}
                  />
                  Published (visible to students)
                </label>
                <button onClick={() => handleDeleteDeck(selectedDeck)} className="text-xs text-red-300 hover:text-red-200">Delete deck</button>
              </div>
            </div>

            {/* Karte hinzufügen + CSV-Import */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Add a card</h3>
                <CsvImport
                  deckId={selectedDeck.id}
                  startSortOrder={cards.length}
                  onImported={() => reloadCards(selectedDeck.id)}
                />
              </div>
              <CardForm onSave={handleAddCard} />
            </div>

            {/* Karten-Liste */}
            <div>
              <h3 className="font-semibold mb-2">Cards ({cards.length})</h3>
              <div className="space-y-2">
                {cards.map((c) =>
                  editingCardId === c.id ? (
                    <CardForm
                      key={c.id}
                      card={c}
                      onSave={(fields) => handleEditCard(c.id, fields)}
                      onCancel={() => setEditingCardId(null)}
                    />
                  ) : (
                    <div key={c.id} className="card p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="font-medium">{c.front}</span>
                        <span className="text-cream-dim"> → </span>
                        <span className="text-gold-bright">{c.back}</span>
                        <span className="text-xs text-cream-dim ml-2">
                          {c.imageUrl ? "🖼️" : ""}{c.audioUrl ? "🔊" : ""}
                        </span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => setEditingCardId(c.id)} className="text-xs text-cream-dim hover:text-cream">Edit</button>
                        <button onClick={() => handleDeleteCard(c.id)} className="text-xs text-red-300 hover:text-red-200">Delete</button>
                      </div>
                    </div>
                  ),
                )}
                {cards.length === 0 && <p className="text-sm text-cream-dim">No cards in this deck yet.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
