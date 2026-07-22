"use client";

// Wort-Rakete 🚀 – ein Blitz-Wiederholungsspiel mit den bereits GELERNTEN Karten.
// 60 Sekunden, Multiple-Choice, Combo-Multiplikator. Jede beantwortete Karte
// zählt als echte FSRS-Wiederholung (feeds Streak, Statistik, Fälligkeit) und
// bringt XP – also "mehr als ein Spiel".

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getLearnedItems, reviewCard, type StudyItem } from "@/lib/study";
import { getAccess } from "@/lib/access";
import { addXp } from "@/lib/progress";
import { submitScore, getWeeklyLeaderboard, type LeaderRow } from "@/lib/game";
import Paywall from "@/components/Paywall";

const ROUND_MS = 60_000;
const WRONG_PENALTY_MS = 2_000;
const BEST_KEY = "wortrakete_best_v1";

type Phase = "loading" | "blocked" | "tooFew" | "intro" | "playing" | "over";

type Question = {
  item: StudyItem;
  prompt: string;
  promptLang: "de" | "en";
  answer: string;
  options: string[];
};

const strip = (s: string) => (s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const norm = (s: string) => strip(s).toLowerCase();
const shuffle = <T,>(a: T[]) => {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; }
  return x;
};

export default function GamePage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [items, setItems] = useState<StudyItem[]>([]);

  // Laufende Runde
  const [q, setQ] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_MS);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [gained, setGained] = useState<number | null>(null);

  const [best, setBest] = useState(0);
  const [xpAwarded, setXpAwarded] = useState(false);
  const [board, setBoard] = useState<LeaderRow[]>([]);

  const queueRef = useRef<StudyItem[]>([]);
  const reviewedRef = useRef<Set<string>>(new Set());
  const frontsRef = useRef<string[]>([]);
  const backsRef = useRef<string[]>([]);
  const penaltyRef = useRef(0); // aufsummierte Zeitstrafe (ms) für falsche Antworten

  // Laden
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const access = await getAccess();
      if (access.tier !== "full") { if (!cancelled) setPhase("blocked"); return; }
      const learned = await getLearnedItems();
      if (cancelled) return;
      // nur Karten mit brauchbarem Vorder- UND Rückseitentext
      const usable = learned.filter((it) => strip(it.card.front) && strip(it.card.back));
      setItems(usable);
      frontsRef.current = usable.map((it) => strip(it.card.front));
      backsRef.current = usable.map((it) => strip(it.card.back));
      setPhase(usable.length < 6 ? "tooFew" : "intro");
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const b = Number(localStorage.getItem(BEST_KEY) || 0);
    if (!Number.isNaN(b)) setBest(b);
    getWeeklyLeaderboard().then(setBoard);
  }, []);

  const buildQuestion = useCallback((): Question => {
    if (queueRef.current.length === 0) queueRef.current = shuffle(items);
    const item = queueRef.current.pop()!;
    const showDe = Math.random() < 0.5;
    const prompt = strip(showDe ? item.card.back : item.card.front);
    const answer = strip(showDe ? item.card.front : item.card.back);
    const pool = showDe ? frontsRef.current : backsRef.current;
    const distractors: string[] = [];
    const seen = new Set([norm(answer)]);
    let guard = 0;
    while (distractors.length < 3 && guard < 200) {
      guard++;
      const cand = pool[Math.floor(Math.random() * pool.length)];
      if (cand && !seen.has(norm(cand))) { seen.add(norm(cand)); distractors.push(cand); }
    }
    return { item, prompt, promptLang: showDe ? "de" : "en", answer, options: shuffle([answer, ...distractors]) };
  }, [items]);

  const start = useCallback(() => {
    queueRef.current = shuffle(items);
    reviewedRef.current = new Set();
    setScore(0); setCombo(0); setBestCombo(0); setCorrect(0); setAnswered(0);
    setPicked(null); setLocked(false); setFlash(null); setGained(null);
    setXpAwarded(false); setTimeLeft(ROUND_MS);
    setQ(buildQuestion());
    setPhase("playing");
  }, [items, buildQuestion]);

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;
    const started = Date.now();
    penaltyRef.current = 0;
    const t = setInterval(() => {
      const left = ROUND_MS - (Date.now() - started) - penaltyRef.current;
      if (left <= 0) { setTimeLeft(0); clearInterval(t); setPhase("over"); }
      else setTimeLeft(left);
    }, 100);
    return () => clearInterval(t);
  }, [phase]);

  const answer = useCallback((opt: string) => {
    if (locked || !q) return;
    setLocked(true);
    setPicked(opt);
    const isRight = norm(opt) === norm(q.answer);
    setAnswered((a) => a + 1);

    // Echte Wiederholung nur einmal pro Karte je Runde protokollieren.
    if (!reviewedRef.current.has(q.item.card.id)) {
      reviewedRef.current.add(q.item.card.id);
      void reviewCard(q.item.state, isRight ? "good" : "again");
    }

    if (isRight) {
      const mult = Math.min(1 + Math.floor(combo / 3), 5);
      const pts = 10 * mult;
      setScore((s) => s + pts);
      setGained(pts);
      setCombo((c) => { const n = c + 1; setBestCombo((b) => Math.max(b, n)); return n; });
      setCorrect((c) => c + 1);
      setFlash("correct");
    } else {
      setCombo(0);
      setFlash("wrong");
      penaltyRef.current += WRONG_PENALTY_MS;
    }

    setTimeout(() => {
      setFlash(null); setGained(null); setPicked(null); setLocked(false);
      setQ(buildQuestion());
    }, isRight ? 320 : 620);
  }, [locked, q, combo, buildQuestion]);

  // XP + Bestwert bei Rundenende
  useEffect(() => {
    if (phase !== "over" || xpAwarded) return;
    setXpAwarded(true);
    if (correct > 0) void addXp(correct);
    if (score > best) { setBest(score); localStorage.setItem(BEST_KEY, String(score)); }
    if (score > 0) void (async () => { await submitScore(score); setBoard(await getWeeklyLeaderboard()); })();
  }, [phase, xpAwarded, correct, score, best]);

  // Tastatur 1–4 + Enter
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === "playing" && q && !locked) {
        const i = ["1", "2", "3", "4"].indexOf(e.key);
        if (i >= 0 && q.options[i]) { e.preventDefault(); answer(q.options[i]); }
      }
      if ((phase === "intro" || phase === "over") && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); start(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, q, locked, answer, start]);

  if (phase === "loading") return <p className="text-sm text-cream-dim">Loading…</p>;
  if (phase === "blocked") return <Paywall title="Unlock Word Rocket" />;

  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
  const mult = Math.min(1 + Math.floor(combo / 3), 5);
  const secs = (timeLeft / 1000).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Kopf */}
      <div className="flex items-center gap-3">
        <div className="text-3xl">🚀</div>
        <div>
          <h1 className="text-2xl font-bold leading-none">Word Rocket</h1>
          <p className="text-cream-dim text-sm mt-1">Blitz-review your learned words against the clock.</p>
        </div>
      </div>

      {phase === "tooFew" && (
        <div className="card p-6 text-center space-y-3">
          <div className="text-4xl">🌱</div>
          <p className="font-semibold">Learn a few words first!</p>
          <p className="text-cream-dim text-sm">Word Rocket uses the cards you&apos;ve already learned. Study at least 6 cards, then come back and launch.</p>
          <Link href="/decks" className="btn-gold inline-block px-5 py-2.5 mt-1">Go to flashcards</Link>
        </div>
      )}

      {phase === "intro" && (
        <div className="card p-6 sm:p-8 text-center space-y-5">
          <div className="text-5xl">🚀</div>
          <div>
            <h2 className="text-xl font-bold">Ready for launch?</h2>
            <p className="text-cream-dim text-sm mt-2 max-w-md mx-auto">
              You have <b className="text-gold-bright">{items.length}</b> learned words. Pick the right meaning as fast as you can.
              Build a <b>combo</b> for up to <b>5×</b> points — a wrong answer costs 2 seconds!
            </p>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div><div className="text-2xl font-bold text-gold-bright">60s</div><div className="text-cream-dim text-xs">per round</div></div>
            <div><div className="text-2xl font-bold text-gold-bright">{best}</div><div className="text-cream-dim text-xs">your best</div></div>
          </div>
          <button onClick={start} className="btn-gold px-8 py-3 text-lg font-bold">Launch 🚀</button>
          <p className="text-[11px] text-cream-dim">Tip: use keys 1–4 to answer.</p>
        </div>
      )}

      {phase === "playing" && q && (
        <div className="space-y-4">
          {/* Statusleiste */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--bordeaux-soft)" }}>
                <div className="h-3 rounded-full transition-[width] duration-100 ease-linear"
                  style={{ width: `${(timeLeft / ROUND_MS) * 100}%`, background: timeLeft < 10000 ? "var(--red-accent)" : "var(--gold)" }} />
              </div>
            </div>
            <div className="tabular-nums font-bold w-14 text-right" style={{ color: timeLeft < 10000 ? "var(--red-accent)" : "var(--cream)" }}>{secs}s</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-cream-dim">Score <span className="text-lg font-bold text-cream ml-1 tabular-nums">{score}</span></div>
            {combo >= 2 && (
              <div className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: "var(--bordeaux)", color: "#fff" }}>
                🔥 {combo} combo · {mult}×
              </div>
            )}
          </div>

          {/* Frage */}
          <div className="card p-8 text-center relative overflow-hidden"
            style={{ boxShadow: flash === "correct" ? "0 0 0 3px var(--green-accent)" : flash === "wrong" ? "0 0 0 3px var(--red-accent)" : undefined }}>
            <div className="text-[11px] uppercase tracking-widest text-cream-dim mb-2">{q.promptLang === "de" ? "German → pick the meaning" : "English → pick the German"}</div>
            <div className="text-3xl font-extrabold" style={{ color: "var(--bordeaux)" }}>{q.prompt}</div>
            {gained != null && <div className="absolute right-4 top-3 text-lg font-bold" style={{ color: "var(--green-accent)" }}>+{gained}</div>}
          </div>

          {/* Optionen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.options.map((opt, i) => {
              const isAnswer = norm(opt) === norm(q.answer);
              const isPicked = picked !== null && norm(opt) === norm(picked);
              let bg = "var(--bordeaux-deep)", color = "var(--cream)", ring = "transparent";
              if (locked && isAnswer) { bg = "var(--green-accent)"; color = "#fff"; }
              else if (locked && isPicked && !isAnswer) { bg = "var(--red-accent)"; color = "#fff"; }
              return (
                <button key={i} onClick={() => answer(opt)} disabled={locked}
                  className="rounded-xl px-4 py-4 text-left font-semibold text-lg flex items-center gap-3 transition disabled:cursor-default"
                  style={{ background: bg, color, boxShadow: `inset 0 0 0 2px ${ring}` }}>
                  <span className="grid place-items-center w-7 h-7 rounded-md text-sm font-bold shrink-0"
                    style={{ background: "color-mix(in srgb, var(--cream) 12%, transparent)" }}>{i + 1}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
          <button onClick={() => setPhase("over")} className="text-xs text-cream-dim hover:text-cream mx-auto block">End round</button>
        </div>
      )}

      {phase === "over" && (
        <div className="card p-6 sm:p-8 text-center space-y-5">
          <div className="text-5xl">{score >= best && score > 0 ? "🏆" : "🎉"}</div>
          <div>
            {score >= best && score > 0 && <div className="text-sm font-bold text-gold-bright mb-1">NEW PERSONAL BEST!</div>}
            <div className="text-5xl font-extrabold tabular-nums" style={{ color: "var(--bordeaux)" }}>{score}</div>
            <div className="text-cream-dim text-sm mt-1">points</div>
          </div>
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
            <Stat value={`${correct}/${answered}`} label="Correct" />
            <Stat value={`${accuracy}%`} label="Accuracy" />
            <Stat value={`🔥 ${bestCombo}`} label="Best combo" />
          </div>
          {correct > 0 && (
            <div className="text-sm inline-block px-4 py-2 rounded-full" style={{ background: "var(--bordeaux-deep)" }}>
              <b className="text-gold-bright">+{correct} XP</b> earned · {answered} cards reviewed ✓
            </div>
          )}
          <div className="flex items-center justify-center gap-3 pt-1">
            <button onClick={start} className="btn-gold px-6 py-3 font-bold">Play again 🚀</button>
            <Link href="/dashboard" className="btn-outline px-6 py-3">Done</Link>
          </div>
        </div>
      )}

      {(phase === "intro" || phase === "over") && board.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2">🏆 This week&apos;s leaderboard</h3>
            <span className="text-[11px] text-cream-dim">resets Monday</span>
          </div>
          <div className="space-y-1.5">
            {board.map((r) => (
              <div key={`${r.rank}-${r.name}`} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                style={{ background: r.isMe ? "var(--bordeaux)" : "var(--bordeaux-deep)", color: r.isMe ? "#fff" : "var(--cream)" }}>
                <span className="w-7 text-center font-bold shrink-0">{r.rank <= 3 ? ["🥇", "🥈", "🥉"][r.rank - 1] : r.rank}</span>
                <span className="flex-1 font-semibold truncate">{r.name}{r.isMe && <span className="opacity-80 font-normal"> (you)</span>}</span>
                <span className="tabular-nums font-bold">{r.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl py-3" style={{ background: "var(--bordeaux-deep)" }}>
      <div className="text-lg font-bold tabular-nums">{value}</div>
      <div className="text-[11px] text-cream-dim mt-0.5">{label}</div>
    </div>
  );
}
