"use client";

import { useEffect, useState } from "react";
import { getDecks } from "@/lib/decks";
import { getCards } from "@/lib/cards";
import { getAccess } from "@/lib/access";
import type { Card, Deck } from "@/lib/types";
import Paywall from "@/components/Paywall";
import WordList from "@/components/WordList";

const LEVELS = ["A1", "A2", "B1", "B2", "C1"];

// Vokabel-Gesamtliste für Schüler, sortiert nach Themen (Level -> Deck). Karten
// eines Decks werden erst beim Aufklappen geladen (schont die Ladezeit bei
// tausenden Karten). Aussprache nur per Play-Button.
export default function WordsPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [cardsByDeck, setCardsByDeck] = useState<Record<string, Card[]>>({});
  const [loadingDeck, setLoadingDeck] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const access = await getAccess();
      if (access.tier !== "full") { if (!cancelled) { setBlocked(true); setLoading(false); } return; }
      const d = await getDecks();
      if (cancelled) return;
      setDecks(d.filter((x) => x.isPublished));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  async function toggle(deckId: string) {
    if (openId === deckId) { setOpenId(null); return; }
    setOpenId(deckId);
    if (!cardsByDeck[deckId]) {
      setLoadingDeck(deckId);
      const cs = await getCards(deckId);
      setCardsByDeck((prev) => ({ ...prev, [deckId]: cs }));
      setLoadingDeck(null);
    }
  }

  if (blocked) return <Paywall title="Unlock the vocabulary list" />;
  if (loading) return <p className="text-sm text-cream-dim">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vocabulary 🔊</h1>
        <p className="text-cream-dim text-sm mt-1">
          All words by topic. Tap a word — or its example sentence — to hear the pronunciation.
        </p>
      </div>

      {decks.length === 0 && <p className="text-sm text-cream-dim">No topics yet.</p>}

      {LEVELS.map((lv) => {
        const group = decks.filter((d) => d.level === lv);
        if (group.length === 0) return null;
        return (
          <section key={lv} className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="rounded-lg px-2.5 py-1 text-sm font-extrabold" style={{ background: "linear-gradient(160deg, var(--gold-bright), var(--gold))", color: "#3b2116" }}>{lv}</span>
              <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--gold) 40%, transparent), transparent)" }} />
            </div>
            {group.map((d) => {
              const open = openId === d.id;
              return (
                <div key={d.id} className="card overflow-hidden">
                  <button
                    onClick={() => toggle(d.id)}
                    className="w-full flex items-center justify-between gap-3 p-4 text-left transition hover:bg-gold/5"
                  >
                    <span className="font-semibold text-cream">{d.title}</span>
                    <span className="text-cream-dim text-sm shrink-0">{open ? "▲ hide" : "▼ show"}</span>
                  </button>
                  {open && (
                    <div className="px-4 pb-4">
                      {loadingDeck === d.id
                        ? <p className="text-sm text-cream-dim">Loading…</p>
                        : <WordList cards={cardsByDeck[d.id] ?? []} />}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
