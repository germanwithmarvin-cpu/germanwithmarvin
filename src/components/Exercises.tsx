"use client";

import { useMemo, useState } from "react";
import type { Exercise } from "@/lib/data";

// Antwort-Normalisierung für Lückentext (Groß/Klein, Leerzeichen, End-Satzzeichen egal).
const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.!?,;:]+$/, "");

// Deterministisches Mischen (stabil über Re-Renders) via einfachem Seed-PRNG.
function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed || 1;
  const rand = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const TYPE_LABEL: Record<Exercise["type"], string> = {
  mc: "Choose the correct answer",
  gap: "Fill in the gap",
  order: "Put the words in the right order",
  match: "Match the pairs",
  categorize: "Sort into the right category",
};

export default function Exercises({ items, onDone }: { items: Exercise[]; onDone: (correct: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [checked, setChecked] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);

  // Antwort-Zustände (werden bei jedem Wechsel zurückgesetzt)
  const [mc, setMc] = useState<string | null>(null);
  const [gap, setGap] = useState("");
  const [placed, setPlaced] = useState<number[]>([]); // Anzeige-Indizes (Satzbau)
  const [assign, setAssign] = useState<Record<number, string>>({}); // Zuordnen/Kategorisieren

  const ex = items[idx];

  const orderTokens = useMemo(
    () => (ex.type === "order" ? shuffle(ex.correct.map((word, i) => ({ id: i, word })), idx + 11) : []),
    [ex, idx],
  );
  const matchRights = useMemo(
    () => (ex.type === "match" ? shuffle(ex.pairs.map((p) => p.right), idx + 23) : []),
    [ex, idx],
  );
  const catItems = useMemo(
    () => (ex.type === "categorize" ? shuffle(ex.items.map((it, i) => ({ ...it, i })), idx + 37) : []),
    [ex, idx],
  );

  function resetAnswer() {
    setChecked(false);
    setMc(null);
    setGap("");
    setPlaced([]);
    setAssign({});
  }

  function ready(): boolean {
    switch (ex.type) {
      case "mc": return mc !== null;
      case "gap": return gap.trim().length > 0;
      case "order": return placed.length === ex.correct.length;
      case "match": return ex.pairs.every((_, i) => assign[i]);
      case "categorize": return ex.items.every((_, i) => assign[i]);
    }
  }

  function isCorrect(): boolean {
    switch (ex.type) {
      case "mc": return mc === ex.correctOptionId;
      case "gap": return ex.answers.some((a) => norm(a) === norm(gap));
      case "order": return placed.map((p) => orderTokens[p].word).join(" ") === ex.correct.join(" ");
      case "match": return ex.pairs.every((p, i) => assign[i] === p.right);
      case "categorize": return ex.items.every((it, i) => assign[i] === it.category);
    }
  }

  function check() {
    if (!ready()) return;
    const ok = isCorrect();
    setLastCorrect(ok);
    if (ok) setCorrectCount((c) => c + 1);
    setChecked(true);
  }

  function next() {
    if (idx + 1 < items.length) {
      setIdx(idx + 1);
      resetAnswer();
    } else {
      onDone(correctCount, items.length);
    }
  }

  return (
    <div className="card p-6 space-y-4">
      <div className="flex justify-between gap-3 text-sm text-cream-dim">
        <span>{TYPE_LABEL[ex.type]}</span>
        <span className="shrink-0 whitespace-nowrap">{idx + 1} / {items.length}</span>
      </div>

      {ex.prompt && ex.type !== "gap" && <h3 className="text-lg font-semibold">{ex.prompt}</h3>}

      {/* ---- Multiple Choice ---- */}
      {ex.type === "mc" && (
        <div className="space-y-2">
          {ex.options.map((opt) => {
            const chosen = mc === opt.id;
            const showRight = checked && opt.id === ex.correctOptionId;
            const showWrong = checked && chosen && opt.id !== ex.correctOptionId;
            return (
              <button
                key={opt.id}
                disabled={checked}
                onClick={() => setMc(opt.id)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                  showRight ? "border-green-400 bg-green-400/15" : showWrong ? "border-red-accent bg-red-accent/15" : chosen ? "border-gold bg-gold/15" : "border-gold/25 hover:border-gold/50"
                }`}
              >
                {opt.text}
              </button>
            );
          })}
        </div>
      )}

      {/* ---- Lückentext ---- */}
      {ex.type === "gap" && (
        <div className="text-lg leading-relaxed flex flex-wrap items-center gap-1">
          {ex.prompt.split("___").map((part, i, arr) => (
            <span key={i} className="flex items-center gap-1">
              <span>{part}</span>
              {i < arr.length - 1 && (
                <input
                  value={gap}
                  disabled={checked}
                  onChange={(e) => setGap(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !checked && ready()) check(); }}
                  className={`inline-block w-40 rounded-md bg-bordeaux-deep/60 border px-2 py-1 outline-none ${
                    checked ? (lastCorrect ? "border-green-400" : "border-red-accent") : "border-gold/40 focus:border-gold"
                  }`}
                  placeholder="…"
                />
              )}
            </span>
          ))}
        </div>
      )}

      {/* ---- Satzbau (Wörter ordnen) ---- */}
      {ex.type === "order" && (
        <div className="space-y-3">
          <div className={`min-h-[3rem] rounded-lg border border-dashed border-gold/30 p-2 flex flex-wrap gap-2 ${checked ? (lastCorrect ? "bg-green-400/10" : "bg-red-accent/10") : ""}`}>
            {placed.length === 0 && <span className="text-cream-dim text-sm self-center px-1">Tap the words below…</span>}
            {placed.map((p, pi) => (
              <button key={pi} disabled={checked} onClick={() => setPlaced(placed.filter((_, k) => k !== pi))} className="px-3 py-1.5 rounded-lg bg-gold/20 border border-gold/40 text-sm">
                {orderTokens[p].word}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {orderTokens.map((t, ti) => (
              !placed.includes(ti) && (
                <button key={ti} disabled={checked} onClick={() => setPlaced([...placed, ti])} className="px-3 py-1.5 rounded-lg bg-bordeaux-deep/60 border border-gold/25 text-sm hover:border-gold/50">
                  {t.word}
                </button>
              )
            ))}
          </div>
          {checked && !lastCorrect && <p className="text-sm text-green-300">✓ {ex.correct.join(" ")}</p>}
        </div>
      )}

      {/* ---- Zuordnen (Paare) ---- */}
      {ex.type === "match" && (
        <div className="space-y-2">
          {ex.pairs.map((p, i) => {
            const ok = checked && assign[i] === p.right;
            const wrong = checked && assign[i] !== p.right;
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="w-40 shrink-0">{p.left}</span>
                <span className="text-cream-dim">→</span>
                <select
                  value={assign[i] ?? ""}
                  disabled={checked}
                  onChange={(e) => setAssign({ ...assign, [i]: e.target.value })}
                  className={`flex-1 rounded-lg bg-bordeaux-deep/60 border px-2 py-2 outline-none text-sm ${ok ? "border-green-400" : wrong ? "border-red-accent" : "border-gold/30 focus:border-gold"}`}
                >
                  <option value="" disabled>Choose…</option>
                  {matchRights.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                {checked && wrong && <span className="text-xs text-green-300 shrink-0">✓ {p.right}</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* ---- Kategorisieren ---- */}
      {ex.type === "categorize" && (
        <div className="space-y-2">
          {catItems.map((it) => {
            const ok = checked && assign[it.i] === it.category;
            const wrong = checked && assign[it.i] !== it.category;
            return (
              <div key={it.i} className={`flex items-center justify-between gap-3 rounded-lg border p-2 ${ok ? "border-green-400 bg-green-400/10" : wrong ? "border-red-accent bg-red-accent/10" : "border-gold/20"}`}>
                <span className="font-medium">{it.text}</span>
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {ex.categories.map((cat) => (
                    <button
                      key={cat}
                      disabled={checked}
                      onClick={() => setAssign({ ...assign, [it.i]: cat })}
                      className={`px-3 py-1 rounded-lg text-sm border ${assign[it.i] === cat ? "border-gold bg-gold/20" : "border-gold/25 hover:border-gold/50"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {checked && wrong && <span className="text-xs text-green-300 shrink-0">✓ {it.category}</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* Feedback + Erklärung */}
      {checked && (
        <div className={`rounded-lg p-4 text-sm ${lastCorrect ? "bg-green-400/15" : "bg-red-accent/15"}`}>
          <strong>{lastCorrect ? "Correct! 🎉" : "Not quite."}</strong>
          {ex.explanation && <p className="mt-1 text-cream-dim">{ex.explanation}</p>}
        </div>
      )}

      {/* Steuerung */}
      {!checked ? (
        <button onClick={check} disabled={!ready()} className="btn-gold px-6 py-2.5 w-full disabled:opacity-40">Check answer</button>
      ) : (
        <button onClick={next} className="btn-gold px-6 py-2.5 w-full">
          {idx + 1 < items.length ? "Next" : "Finish exercises"}
        </button>
      )}
    </div>
  );
}
