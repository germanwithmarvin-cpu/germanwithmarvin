"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Flashcard, { type Direction } from "@/components/Flashcard";
import { getAllItems, getFlaggedItems, getDueToday, getLearnedItems, reviewCard, toggleFlag, type StudyItem } from "@/lib/study";
import { getDeck } from "@/lib/decks";
import { getAccess, canAccessVocabLevel } from "@/lib/access";
import { intervalPreview } from "@/lib/srs";
import type { Rating } from "@/lib/types";
import Paywall from "@/components/Paywall";

const RATINGS: { key: Rating; label: string; cls: string }[] = [
  { key: "again", label: "Again", cls: "btn-again" },
  { key: "hard", label: "Hard", cls: "btn-hard" },
  { key: "good", label: "Good", cls: "btn-good" },
  { key: "easy", label: "Easy", cls: "btn-easy" },
];

export default function StudyPage() {
  const params = useParams<{ deckId: string }>();
  const deckId = params.deckId;
  const isMarked = deckId === "marked"; // Sammelmodus für markierte Karten
  const isToday = deckId === "today"; // Tages-Review über alle Decks
  const isLearned = deckId === "learned" || deckId.startsWith("learned-"); // gelernte Karten wiederholen
  const learnedLevel = deckId.startsWith("learned-") ? deckId.slice("learned-".length) : undefined;

  const [queue, setQueue] = useState<StudyItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [saving, setSaving] = useState(false);
  // Standard: Englisch als Frage (Vorderseite), Deutsch als Antwort (Rückseite).
  const [direction, setDirection] = useState<Direction>("en-de");
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Zugangsprüfung: ein bestimmtes Deck (A2–B2) erfordert ein Abo.
      if (!isMarked && !isToday && !isLearned) {
        const [deck, access] = await Promise.all([getDeck(deckId), getAccess()]);
        if (deck && !canAccessVocabLevel(access.tier, deck.level)) {
          if (!cancelled) { setBlocked(true); setLoading(false); }
          return;
        }
      }
      const items = isMarked
        ? await getFlaggedItems()
        : isToday
          ? await getDueToday()
          : isLearned
            ? await getLearnedItems(learnedLevel)
            : await getAllItems(deckId);
      if (cancelled) return;
      setQueue(items);
      setTotal(items.length);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [deckId, isMarked, isToday, isLearned, learnedLevel]);

  // Gemeistert = alle Karten minus die, die noch in der Runde sind.
  const mastered = total - queue.length;

  const current = queue[0];

  const previews = useMemo(() => {
    if (!current) return {} as Record<Rating, string>;
    return Object.fromEntries(
      RATINGS.map((r) => [r.key, intervalPreview(current.state, r.key)]),
    ) as Record<Rating, string>;
  }, [current]);

  async function rate(rating: Rating) {
    if (!current || saving) return;
    setSaving(true);
    await reviewCard(current.state, rating);
    setReviewedCount((n) => n + 1);

    setQueue((prev) => {
      const [item, ...rest] = prev;
      // "Good"/"Easy" = sitzt → Karte verlässt die Runde.
      if (rating === "good" || rating === "easy") return rest;
      // "Again" = bald wieder; "Hard" = etwas später wieder dran.
      const gap = rating === "again" ? 2 : 5;
      const pos = Math.min(gap, rest.length);
      const next = [...rest];
      next.splice(pos, 0, item);
      return next;
    });
    setRevealed(false);
    setSaving(false);
  }

  async function toggleFlagCurrent() {
    if (!current) return;
    const newFlag = !current.state.flagged;
    // Optimistisch aktualisieren.
    setQueue((prev) => prev.map((it, i) => (i === 0 ? { ...it, state: { ...it.state, flagged: newFlag } } : it)));
    await toggleFlag(current.state, newFlag);
  }

  if (blocked) return <Paywall title="This level needs a membership" />;
  if (loading) return <p className="text-cream-dim">Loading…</p>;

  // Session fertig
  if (!current) {
    return (
      <div className="text-center max-w-md mx-auto mt-16">
        <div className="text-5xl">{isMarked ? "🔖" : "🎉"}</div>
        <h1 className="text-2xl font-bold mt-4">
          {isMarked && total === 0
            ? "No marked cards"
            : isLearned && total === 0
              ? "Nothing learned yet"
              : isToday && total === 0
                ? "All caught up!"
                : isToday
                  ? "Daily review done!"
                  : isLearned
                    ? "Review complete!"
                    : "You know them all!"}
        </h1>
        <p className="text-cream-dim mt-2">
          {isMarked && total === 0
            ? "You haven't marked any cards yet. Tap 🔖 while studying to save tricky cards here."
            : isLearned && total === 0
              ? "Study some topics first — cards you know will appear here to review."
              : isToday && total === 0
                ? "Nothing is due right now. New cards unlock each day — come back tomorrow."
                : isToday
                  ? `You finished today's ${total} card${total === 1 ? "" : "s"} (${reviewedCount} reviews). See you tomorrow!`
                  : isLearned
                    ? `You reviewed ${total} learned card${total === 1 ? "" : "s"} (${reviewedCount} reviews). Nicely kept fresh!`
                    : `You worked through ${total} card${total === 1 ? "" : "s"} until every one was solid (${reviewedCount} reviews). Great work!`}
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <Link href="/decks" className="btn-outline px-4 py-2 text-sm">Back to decks</Link>
          <Link href="/dashboard" className="btn-gold px-4 py-2 text-sm">Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between text-sm text-cream-dim mb-4">
        <Link href="/decks" className="hover:text-cream">← Decks</Link>
        <span>{mastered} / {total} mastered · {queue.length} left</span>
      </div>

      {/* Fortschrittsbalken bis "alles sitzt" */}
      <div className="max-w-xl mx-auto h-2 rounded-full bg-bordeaux-deep/60 mb-4">
        <div className="h-2 rounded-full bg-gold-bright transition-all" style={{ width: `${total ? (mastered / total) * 100 : 0}%` }} />
      </div>

      {/* Große, auffällige Steuerung: Richtung umschalten + markieren */}
      <div className="max-w-xl mx-auto flex gap-3 mb-4">
        <button
          onClick={() => setDirection((d) => (d === "de-en" ? "en-de" : "de-en"))}
          className="btn-outline flex-1 py-3 font-medium flex items-center justify-center gap-2"
          title="Switch question direction"
        >
          <span className="text-xl">🔄</span>
          <span>{direction === "de-en" ? "German → English" : "English → German"}</span>
        </button>
        <button
          onClick={toggleFlagCurrent}
          className={`flex-1 py-3 font-medium flex items-center justify-center gap-2 rounded-xl ${current.state.flagged ? "btn-gold" : "btn-outline"}`}
          title={current.state.flagged ? "Remove mark" : "Mark for later"}
        >
          <span className="text-xl">🔖</span>
          <span>{current.state.flagged ? "Marked" : "Mark for later"}</span>
        </button>
      </div>

      {isMarked && <p className="text-sm text-gold-bright mb-3 text-center">🔖 Studying your marked cards</p>}

      <Flashcard card={current.card} revealed={revealed} direction={direction} />

      <div className="max-w-xl mx-auto mt-6">
        {!revealed ? (
          <button onClick={() => setRevealed(true)} className="btn-gold w-full py-3">
            Show answer
          </button>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {RATINGS.map((r) => (
              <button
                key={r.key}
                onClick={() => rate(r.key)}
                disabled={saving}
                className={`${r.cls} py-3 px-1 flex flex-col items-center disabled:opacity-50`}
              >
                <span className="text-sm">{r.label}</span>
                <span className="text-xs opacity-80">{previews[r.key]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
