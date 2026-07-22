"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Exercise } from "@/lib/training";
import SentenceSlots from "./SentenceSlots";

// Darstellung einer Aufgabe. Der Elternteil hält den Antwort-Zustand:
//   value  = aktuelle Antwort (bei "order": Bausteine mit \n getrennt)
//   locked = bereits geprüft -> Lösung einfärben, keine Eingabe mehr
export default function ExerciseView({
  ex, value, onChange, locked, correct,
}: {
  ex: Exercise;
  value: string;
  onChange: (v: string) => void;
  locked: boolean;
  correct: boolean;
}) {
  if (ex.kind === "choice") return <Choice ex={ex} value={value} onChange={onChange} locked={locked} />;
  if (ex.kind === "order") return <Order ex={ex} value={value} onChange={onChange} locked={locked} correct={correct} />;
  return <Typed ex={ex} value={value} onChange={onChange} locked={locked} correct={correct} />;
}

function Choice({ ex, value, onChange, locked }: { ex: Exercise; value: string; onChange: (v: string) => void; locked: boolean }) {
  return (
    <div className="space-y-4">
      <p className="text-xl font-semibold">{ex.prompt}</p>
      <div className="grid gap-2.5">
        {ex.options.map((opt, i) => {
          const picked = value === String(i);
          const isRight = i === ex.correct;
          let bg = "var(--bordeaux-deep)", color = "var(--cream)";
          if (locked && isRight) { bg = "var(--green-accent)"; color = "#fff"; }
          else if (locked && picked && !isRight) { bg = "var(--red-accent)"; color = "#fff"; }
          else if (picked) { bg = "var(--gold)"; color = "#3b2116"; }
          return (
            <button
              key={i}
              onClick={() => !locked && onChange(String(i))}
              // Kein `disabled`: der Browser graut den Text sonst aus, und genau
              // dann soll der Schüler richtig/falsch am besten erkennen können.
              aria-disabled={locked}
              className="text-left rounded-xl px-4 py-3 font-semibold text-lg transition flex items-center gap-3"
              style={{ background: bg, color, opacity: 1, pointerEvents: locked ? "none" : undefined }}
            >
              <span className="grid place-items-center w-6 h-6 rounded-md text-xs font-bold shrink-0"
                style={{ background: "color-mix(in srgb, var(--cream) 14%, transparent)" }}>{i + 1}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Lückentext & Fehlersuche: freie Eingabe.
function Typed({ ex, value, onChange, locked, correct }: { ex: Exercise; value: string; onChange: (v: string) => void; locked: boolean; correct: boolean }) {
  // React verwendet dasselbe Eingabefeld für die naechste Aufgabe weiter, also
  // greift autoFocus nur beim allerersten Mal. Ohne diesen Griff steht der
  // Cursor ab Aufgabe zwei nicht mehr im Feld und das Getippte geht ins Leere.
  const box = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!locked) box.current?.focus(); }, [ex.id, locked]);

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-widest text-cream-dim">
        {ex.kind === "error" ? "Find the mistake and write the correct sentence" : "Fill in the gap"}
      </p>
      <p className="text-xl font-semibold leading-relaxed">{ex.prompt}</p>
      <input
        ref={box}
        disabled={locked}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={ex.kind === "error" ? "Write the whole sentence…" : "Your answer…"}
        className="w-full rounded-xl px-4 py-3 text-lg outline-none"
        style={{
          background: "var(--bordeaux-deep)",
          border: `2px solid ${locked ? (correct ? "var(--green-accent)" : "var(--red-accent)") : "color-mix(in srgb, var(--gold) 35%, transparent)"}`,
        }}
      />
      {locked && !correct && ex.answers[0] && (
        <p className="text-sm">
          <span className="text-cream-dim">Correct: </span>
          <b style={{ color: "var(--green-accent)" }}>{ex.answers[0]}</b>
        </p>
      )}
    </div>
  );
}

// Satzbau: Bausteine antippen (statt ziehen – auf dem Handy zuverlässiger).
function Order({ ex, value, onChange, locked, correct }: { ex: Exercise; value: string; onChange: (v: string) => void; locked: boolean; correct: boolean }) {
  const chosen = value ? value.split("\n").filter(Boolean) : [];
  // Angebot einmal je Aufgabe mischen.
  const pool = useMemo(() => {
    const t = [...ex.tokens];
    for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; }
    return t;
  }, [ex.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Jeder Baustein darf nur so oft genutzt werden, wie er im Angebot vorkommt.
  const used = new Map<string, number>();
  chosen.forEach((c) => used.set(c, (used.get(c) ?? 0) + 1));
  const remaining = new Map<string, number>();
  pool.forEach((p) => remaining.set(p, (remaining.get(p) ?? 0) + 1));

  const add = (t: string) => onChange([...chosen, t].join("\n"));
  const removeAt = (i: number) => onChange(chosen.filter((_, k) => k !== i).join("\n"));

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-widest text-cream-dim">Tap the words in the right order</p>
      <p className="text-xl font-semibold">{ex.prompt}</p>

      {/* Antwortzeile */}
      <div
        className="min-h-[62px] rounded-xl p-3 flex flex-wrap gap-2 items-start"
        style={{
          background: "var(--bordeaux-deep)",
          border: `2px solid ${locked ? (correct ? "var(--green-accent)" : "var(--red-accent)") : "color-mix(in srgb, var(--gold) 30%, transparent)"}`,
        }}
      >
        {chosen.length === 0 && <span className="text-cream-dim text-sm py-1.5">…</span>}
        {chosen.map((t, i) => (
          <button key={`${t}-${i}`} aria-disabled={locked} onClick={() => !locked && removeAt(i)}
            className="rounded-lg px-3 py-2 font-semibold text-lg transition"
            style={{ background: "var(--gold)", color: "#3b2116", opacity: 1, pointerEvents: locked ? "none" : undefined }}>
            {t}
          </button>
        ))}
      </div>

      {/* Angebot */}
      {!locked && (
        <div className="flex flex-wrap gap-2">
          {pool.map((t, i) => {
            const left = (remaining.get(t) ?? 0) - (used.get(t) ?? 0);
            const spent = left <= 0;
            return (
              <button key={`${t}-${i}`} disabled={spent} onClick={() => add(t)}
                className="rounded-lg px-3 py-2 font-semibold text-lg transition"
                style={{ background: spent ? "transparent" : "var(--bordeaux-soft)", color: spent ? "transparent" : "var(--cream)", boxShadow: spent ? "inset 0 0 0 1px color-mix(in srgb, var(--cream) 12%, transparent)" : "none" }}>
                {t}
              </button>
            );
          })}
        </div>
      )}

      {locked && !correct && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <p className="text-sm text-cream-dim">Your answer — the marked positions are in the wrong place:</p>
            <SentenceSlots
              tokens={chosen}
              wrong={chosen.map((t, i) => (t === ex.order[i] ? -1 : i)).filter((i) => i >= 0)}
              size="small"
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm text-cream-dim">Correct:</p>
            <SentenceSlots tokens={ex.order} verb={ex.verb >= 0 ? ex.verb : undefined} size="small" />
          </div>
        </div>
      )}
    </div>
  );
}
