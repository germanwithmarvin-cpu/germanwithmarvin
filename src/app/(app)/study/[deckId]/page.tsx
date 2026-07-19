"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Flashcard, { type Direction } from "@/components/Flashcard";
import { getAllItems, getFlaggedItems, getDueToday, getLearnedItems, reviewCard, toggleFlag, type StudyItem } from "@/lib/study";
import { getAccess } from "@/lib/access";
import { intervalPreview } from "@/lib/srs";
import type { Rating } from "@/lib/types";
import Paywall from "@/components/Paywall";

const RATINGS: { key: Rating; label: string; cls: string; hot: string }[] = [
  { key: "again", label: "Again", cls: "btn-again", hot: "1" },
  { key: "hard", label: "Hard", cls: "btn-hard", hot: "2" },
  { key: "good", label: "Good", cls: "btn-good", hot: "3" },
  { key: "easy", label: "Easy", cls: "btn-easy", hot: "4" },
];

export default function StudyPage() {
  const params = useParams<{ deckId: string }>();
  const deckId = params.deckId;
  const isMarked = deckId === "marked";
  const isToday = deckId === "today";
  const isLearned = deckId === "learned" || deckId.startsWith("learned-");
  const learnedLevel = deckId.startsWith("learned-") ? deckId.slice("learned-".length) : undefined;

  const [queue, setQueue] = useState<StudyItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [direction, setDirection] = useState<Direction>("en-de");
  const [blocked, setBlocked] = useState(false);

  // Lebendigkeit: Combo-Streak + Feedback-Animation + Funken-Burst.
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [burstId, setBurstId] = useState(0);
  const [comboKick, setComboKick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const access = await getAccess();
      if (access.tier !== "full") {
        if (!cancelled) { setBlocked(true); setLoading(false); }
        return;
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

  const mastered = total - queue.length;
  const current = queue[0];

  const previews = useMemo(() => {
    if (!current) return {} as Record<Rating, string>;
    return Object.fromEntries(RATINGS.map((r) => [r.key, intervalPreview(current.state, r.key)])) as Record<Rating, string>;
  }, [current]);

  const rate = useCallback(async (rating: Rating) => {
    if (!current || saving || !revealed) return;
    setSaving(true);
    const wasNew = current.state.repetitions === 0; // brand-new Karte → Lernschritt
    const next = await reviewCard(current.state, rating);
    setReviewedCount((n) => n + 1);

    const correct = rating === "good" || rating === "easy";
    setFeedback(correct ? "correct" : rating === "again" ? "wrong" : null);
    if (correct) setBurstId((b) => b + 1);
    setCombo((c) => {
      const nc = rating === "again" ? 0 : rating === "hard" ? c : c + 1;
      if (nc > bestCombo) setBestCombo(nc);
      if (nc >= 2 && nc !== c) setComboKick((k) => k + 1);
      return nc;
    });

    setQueue((prev) => {
      const [item, ...rest] = prev;
      const updated = { ...item, state: next };
      if (rating === "good" || rating === "easy") {
        // Neue Karte auf "Good": einmal zur Vertiefung erneut zeigen (Lernschritt).
        if (wasNew && rating === "good") {
          const pos = Math.min(4, rest.length);
          const q = [...rest]; q.splice(pos, 0, updated); return q;
        }
        return rest; // sitzt → verlässt die Runde
      }
      // "Again" bald wieder, "Hard" etwas später.
      const gap = rating === "again" ? 2 : 5;
      const pos = Math.min(gap, rest.length);
      const q = [...rest]; q.splice(pos, 0, updated); return q;
    });
    setRevealed(false);
    setSaving(false);
    setTimeout(() => setFeedback(null), 460);
  }, [current, saving, revealed, bestCombo]);

  const toggleFlagCurrent = useCallback(async () => {
    if (!current) return;
    const newFlag = !current.state.flagged;
    setQueue((prev) => prev.map((it, i) => (i === 0 ? { ...it, state: { ...it.state, flagged: newFlag } } : it)));
    await toggleFlag(current.state, newFlag);
  }, [current]);

  // Tastatur-Shortcuts: Space/Enter = aufdecken bzw. Good, 1–4 = bewerten, F = markieren.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!current || saving) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (!revealed) {
        if (e.code === "Space" || e.key === "Enter" || e.key === "ArrowUp") { e.preventDefault(); setRevealed(true); }
        return;
      }
      if (e.code === "Space" || e.key === "Enter") { e.preventDefault(); rate("good"); return; }
      const idx = ["1", "2", "3", "4"].indexOf(e.key);
      if (idx >= 0) { e.preventDefault(); rate(RATINGS[idx].key); return; }
      if (e.key.toLowerCase() === "f") { e.preventDefault(); toggleFlagCurrent(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, revealed, saving, rate, toggleFlagCurrent]);

  if (blocked) return <Paywall title="This level needs a membership" />;
  if (loading) return <p className="text-cream-dim">Loading…</p>;

  if (!current) {
    return (
      <div className="text-center max-w-md mx-auto mt-16">
        <div className="text-5xl">{isMarked ? "🔖" : "🎉"}</div>
        <h1 className="text-2xl font-bold mt-4">
          {isMarked && total === 0 ? "No marked cards"
            : isLearned && total === 0 ? "Nothing learned yet"
            : isToday && total === 0 ? "All caught up!"
            : isToday ? "Daily review done!"
            : isLearned ? "Review complete!"
            : "You know them all!"}
        </h1>
        <p className="text-cream-dim mt-2">
          {isMarked && total === 0 ? "You haven't marked any cards yet. Tap 🔖 while studying to save tricky cards here."
            : isLearned && total === 0 ? "Study some topics first — cards you know will appear here to review."
            : isToday && total === 0 ? "Nothing is due right now. New cards unlock each day — come back tomorrow."
            : isToday ? `You finished today's ${total} card${total === 1 ? "" : "s"} (${reviewedCount} reviews). See you tomorrow!`
            : isLearned ? `You reviewed ${total} learned card${total === 1 ? "" : "s"} (${reviewedCount} reviews). Nicely kept fresh!`
            : `You worked through ${total} card${total === 1 ? "" : "s"} until every one was solid (${reviewedCount} reviews). Great work!`}
        </p>
        {bestCombo >= 3 && total > 0 && <p className="text-gold-bright mt-3 font-semibold">🔥 Best streak this session: {bestCombo} in a row</p>}
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

      <div className="max-w-xl mx-auto h-2 rounded-full bg-bordeaux-deep/60 mb-4">
        <div className="h-2 rounded-full bg-gold-bright transition-all" style={{ width: `${total ? (mastered / total) * 100 : 0}%` }} />
      </div>

      {/* Richtung + markieren */}
      <div className="max-w-xl mx-auto flex gap-3 mb-3">
        <button onClick={() => setDirection((d) => (d === "de-en" ? "en-de" : "de-en"))} className="btn-outline flex-1 py-3 font-medium flex items-center justify-center gap-2" title="Switch question direction">
          <span className="text-xl">🔄</span>
          <span>{direction === "de-en" ? "German → English" : "English → German"}</span>
        </button>
        <button onClick={toggleFlagCurrent} className={`flex-1 py-3 font-medium flex items-center justify-center gap-2 rounded-xl ${current.state.flagged ? "btn-gold" : "btn-outline"}`} title={current.state.flagged ? "Remove mark (F)" : "Mark for later (F)"}>
          <span className="text-xl">🔖</span>
          <span>{current.state.flagged ? "Marked" : "Mark for later"}</span>
        </button>
      </div>

      {/* Combo-Streak */}
      <div className="max-w-xl mx-auto h-7 mb-1 flex items-center justify-center">
        {combo >= 2 && (
          <span key={comboKick} className="combo-pulse inline-flex items-center gap-1.5 text-sm font-bold text-gold-bright">
            🔥 {combo} in a row{combo >= 5 && " · on fire!"}
          </span>
        )}
        {isMarked && combo < 2 && <span className="text-sm text-gold-bright">🔖 Studying your marked cards</span>}
      </div>

      {/* Karte (klick zum Umdrehen) + Funken-Burst */}
      <div className="relative">
        <div onClick={() => !revealed && setRevealed(true)} className={revealed ? "" : "cursor-pointer"}>
          <Flashcard card={current.card} revealed={revealed} direction={direction} feedback={feedback} />
        </div>
        {feedback === "correct" && <SparkBurst key={burstId} />}
      </div>

      <div className="max-w-xl mx-auto mt-6">
        {!revealed ? (
          <button onClick={() => setRevealed(true)} className="btn-gold w-full py-3">Show answer <span className="opacity-70 text-sm">(Space)</span></button>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {RATINGS.map((r) => (
              <button key={r.key} onClick={() => rate(r.key)} disabled={saving} className={`${r.cls} py-3 px-1 flex flex-col items-center disabled:opacity-50`}>
                <span className="text-sm">{r.label} <span className="opacity-60 text-xs">{r.hot}</span></span>
                <span className="text-xs opacity-80">{previews[r.key]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Kleiner Funken-Burst über der Karte beim Richtig-Feedback.
function SparkBurst() {
  const sparks = Array.from({ length: 10 }, (_, i) => {
    const ang = (Math.PI * 2 * i) / 10 + Math.random() * 0.5;
    const dist = 60 + Math.random() * 50;
    return { sx: `${Math.cos(ang) * dist}px`, sy: `${Math.sin(ang) * dist - 20}px`, e: ["✨", "⭐", "🎉"][i % 3] };
  });
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible z-10">
      {sparks.map((s, i) => (
        <span key={i} className="spark absolute text-lg" style={{ ["--sx" as string]: s.sx, ["--sy" as string]: s.sy }}>{s.e}</span>
      ))}
    </div>
  );
}
