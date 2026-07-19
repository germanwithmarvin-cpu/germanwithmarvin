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

  // Abfrage-Modus: umdrehen / tippen / auswählen.
  const [mode, setMode] = useState<"flip" | "type" | "choose">("flip");
  const [typed, setTyped] = useState("");
  const [chosen, setChosen] = useState<string | null>(null);

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

  // Antwort-Text der aktuellen Karte in Abfragerichtung (en-de → Antwort Deutsch).
  const answerOf = useCallback((it: StudyItem | undefined) => (it ? (direction === "en-de" ? it.card.front : it.card.back) : ""), [direction]);
  const correctAnswer = answerOf(current);

  // Vier Optionen für den Auswahl-Modus: richtige Antwort + 3 aus der Runde.
  const options = useMemo(() => {
    if (mode !== "choose" || !current) return [] as string[];
    const pool = Array.from(new Set(queue.slice(1).map((it) => answerOf(it)).filter((t) => t && t !== correctAnswer)));
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const opts = [correctAnswer, ...pool.slice(0, 3)];
    for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
    return opts;
  }, [mode, current, queue, answerOf, correctAnswer]);

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
    setTyped("");
    setChosen(null);
    setSaving(false);
    setTimeout(() => setFeedback(null), 460);
  }, [current, saving, revealed, bestCombo]);

  // Aktive Modi: Antwort einreichen → aufdecken + sofortiges Feedback.
  const submitAnswer = useCallback((value: string) => {
    if (!current || revealed) return;
    const ok = checkTyped(value, correctAnswer);
    setChosen(value);
    setFeedback(ok ? "correct" : "wrong");
    if (ok) setBurstId((b) => b + 1);
    setRevealed(true);
    setTimeout(() => setFeedback(null), 460);
  }, [current, revealed, correctAnswer]);

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
        if (mode === "flip" && (e.code === "Space" || e.key === "Enter" || e.key === "ArrowUp")) { e.preventDefault(); setRevealed(true); }
        if (mode === "choose") {
          const i = ["1", "2", "3", "4"].indexOf(e.key);
          if (i >= 0 && options[i]) { e.preventDefault(); submitAnswer(options[i]); }
        }
        return;
      }
      if (e.code === "Space" || e.key === "Enter") { e.preventDefault(); rate("good"); return; }
      const idx = ["1", "2", "3", "4"].indexOf(e.key);
      if (idx >= 0) { e.preventDefault(); rate(RATINGS[idx].key); return; }
      if (e.key.toLowerCase() === "f") { e.preventDefault(); toggleFlagCurrent(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, revealed, saving, rate, toggleFlagCurrent, mode, options, submitAnswer]);

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

      {/* Abfrage-Modus */}
      <div className="max-w-xl mx-auto mb-3 grid grid-cols-3 gap-1 p-1 rounded-xl bg-bordeaux-deep/40 border border-gold/15">
        {([["flip", "🔁 Flip"], ["type", "⌨️ Type"], ["choose", "🔀 Choose"]] as const).map(([m, label]) => (
          <button
            key={m}
            onClick={() => { setMode(m); setRevealed(false); setTyped(""); setChosen(null); }}
            className={`py-1.5 rounded-lg text-sm font-medium transition ${mode === m ? "btn-gold" : "text-cream-dim hover:text-cream"}`}
          >
            {label}
          </button>
        ))}
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
          mode === "flip" ? (
            <button onClick={() => setRevealed(true)} className="btn-gold w-full py-3">Show answer <span className="opacity-70 text-sm">(Space)</span></button>
          ) : mode === "type" ? (
            <form onSubmit={(e) => { e.preventDefault(); if (typed.trim()) submitAnswer(typed); }} className="flex gap-2">
              <input autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={`Type the ${direction === "en-de" ? "German" : "English"} answer…`} className="flex-1 rounded-xl bg-bordeaux-deep/60 border border-gold/25 px-4 py-3 outline-none focus:border-gold" />
              <button type="submit" disabled={!typed.trim()} className="btn-gold px-6 disabled:opacity-50">Check</button>
            </form>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">
              {options.map((opt, i) => (
                <button key={opt} onClick={() => submitAnswer(opt)} className="btn-outline py-3 px-3 text-left flex items-center gap-2">
                  <span className="opacity-50 text-xs">{i + 1}</span><span>{opt}</span>
                </button>
              ))}
            </div>
          )
        ) : (
          <>
            {(mode === "type" || mode === "choose") && chosen !== null && (
              <div className={`text-center text-sm mb-3 ${checkTyped(chosen, correctAnswer) ? "text-green-700" : "text-red-700"}`}>
                {checkTyped(chosen, correctAnswer) ? "✓ Correct!" : <>✗ You answered “{chosen}” — correct: <b>{correctAnswer}</b></>}
              </div>
            )}
            <div className="grid grid-cols-4 gap-2">
              {RATINGS.map((r) => (
                <button key={r.key} onClick={() => rate(r.key)} disabled={saving} className={`${r.cls} py-3 px-1 flex flex-col items-center disabled:opacity-50`}>
                  <span className="text-sm">{r.label} <span className="opacity-60 text-xs">{r.hot}</span></span>
                  <span className="text-xs opacity-80">{previews[r.key]}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---- Antwort-Prüfung für Tippen/Auswahl -----------------------------------
// Groß/Klein, Leerzeichen, Artikel & End-Satzzeichen egal; Umlaute tolerant
// (ä=ae …); ein kleiner Tippfehler wird bei längeren Wörtern verziehen.
function norm(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ").replace(/[.!?,;:]+$/, "").replace(/^(der|die|das|the|to|a|an)\s+/, "");
}
function deFold(s: string): string {
  return s.replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss");
}
function lev(a: string, b: string): number {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  return d[m][n];
}
function checkTyped(input: string, answer: string): boolean {
  const a = deFold(norm(input));
  if (!a) return false;
  // Mehrere zulässige Formen (durch / oder , getrennt) einzeln prüfen.
  const parts = answer.split(/[/,;]/).map((p) => deFold(norm(p))).filter(Boolean);
  for (const p of parts) {
    if (a === p) return true;
    if (p.length > 4 && lev(a, p) <= 1) return true;
  }
  return false;
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
