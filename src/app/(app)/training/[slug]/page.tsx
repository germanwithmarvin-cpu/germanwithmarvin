"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getUnitBySlug, getExercises, checkAnswer, saveAttempt, saveUnitResult, type Exercise, type Unit } from "@/lib/training";
import { getAccess } from "@/lib/access";
import { addXp } from "@/lib/progress";
import Paywall from "@/components/Paywall";
import ExerciseView from "@/components/training/ExerciseView";

type Phase = "loading" | "blocked" | "missing" | "theory" | "practice" | "done";

// Sehr einfache Auszeichnung: **fett**, *kursiv*, Leerzeile = neuer Absatz.
function RichText({ text }: { text: string }) {
  return (
    <div className="space-y-3">
      {text.split(/\n\s*\n/).map((para, i) => (
        <p key={i} className="leading-relaxed">
          {para.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, k) => {
            if (part.startsWith("**") && part.endsWith("**")) return <b key={k} style={{ color: "var(--bordeaux)" }}>{part.slice(2, -2)}</b>;
            if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <i key={k} className="text-gold-bright font-semibold not-italic">{part.slice(1, -1)}</i>;
            return <span key={k}>{part}</span>;
          })}
        </p>
      ))}
    </div>
  );
}

export default function TrainingUnitPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [phase, setPhase] = useState<Phase>("loading");
  const [unit, setUnit] = useState<Unit | null>(null);
  const [list, setList] = useState<Exercise[]>([]);

  const [idx, setIdx] = useState(0);
  const [given, setGiven] = useState("");
  const [locked, setLocked] = useState(false);
  const [ok, setOk] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const access = await getAccess();
      if (access.tier !== "full") { if (!cancelled) setPhase("blocked"); return; }
      const u = await getUnitBySlug(slug);
      if (cancelled) return;
      if (!u) { setPhase("missing"); return; }
      const ex = await getExercises(u.id);
      if (cancelled) return;
      setUnit(u); setList(ex); setPhase("theory");
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const ex = list[idx];

  const check = useCallback(() => {
    if (!ex || locked || !given.trim()) return;
    const right = checkAnswer(ex, given);
    setOk(right);
    setLocked(true);
    if (right) setCorrectCount((c) => c + 1);
    else setWrongIds((w) => [...w, ex.id]);
    void saveAttempt(ex.id, right, given);
  }, [ex, locked, given]);

  const next = useCallback(() => {
    if (idx + 1 < list.length) {
      setIdx(idx + 1); setGiven(""); setLocked(false); setOk(false);
    } else {
      setPhase("done");
    }
  }, [idx, list.length]);

  // Ergebnis einmalig speichern
  useEffect(() => {
    if (phase !== "done" || saved || !unit || list.length === 0) return;
    setSaved(true);
    const mastery = Math.round((correctCount / list.length) * 100);
    void saveUnitResult(unit.id, mastery);
    if (correctCount > 0) void addXp(correctCount);
  }, [phase, saved, unit, list.length, correctCount]);

  const restart = () => {
    setIdx(0); setGiven(""); setLocked(false); setOk(false);
    setCorrectCount(0); setWrongIds([]); setSaved(false); setPhase("practice");
  };

  if (phase === "loading") return <p className="text-sm text-cream-dim">Loading…</p>;
  if (phase === "blocked") return <Paywall title="Unlock the training course" />;
  if (phase === "missing") return (
    <div className="card p-6 text-center space-y-3">
      <p className="font-semibold">This unit is not available yet.</p>
      <Link href="/training" className="btn-outline inline-block px-5 py-2.5">Back to training</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/training" className="text-sm text-cream-dim hover:text-cream">← Training</Link>
        {phase === "practice" && <span className="text-sm text-cream-dim">{idx + 1} / {list.length}</span>}
      </div>

      {/* Theorie */}
      {phase === "theory" && unit && (
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-lg px-2.5 py-1 text-sm font-extrabold" style={{ background: "linear-gradient(160deg, var(--gold-bright), var(--gold))", color: "#3b2116" }}>{unit.level}</span>
              <h1 className="text-2xl font-bold">{unit.title}</h1>
            </div>
            <p className="text-cream-dim text-sm mt-1">{unit.subtitle}</p>
          </div>
          <div className="card p-6"><RichText text={unit.theory} /></div>
          <div className="flex items-center gap-3">
            <button onClick={() => setPhase("practice")} className="btn-gold px-6 py-3 font-bold">Start practice →</button>
            <span className="text-xs text-cream-dim">{list.length} exercises</span>
          </div>
        </div>
      )}

      {/* Aufgaben */}
      {phase === "practice" && ex && (
        <div className="space-y-5">
          <div className="h-2 rounded-full" style={{ background: "var(--bordeaux-deep)" }}>
            <div className="h-2 rounded-full transition-all" style={{ width: `${(idx / list.length) * 100}%`, background: "var(--gold-bright)" }} />
          </div>

          <div className="card p-6">
            <ExerciseView ex={ex} value={given} onChange={setGiven} locked={locked} correct={ok} />
          </div>

          {/* Rückmeldung mit Begründung */}
          {locked && (
            <div className="rounded-xl p-4" style={{ background: ok ? "color-mix(in srgb, var(--green-accent) 16%, transparent)" : "color-mix(in srgb, var(--red-accent) 14%, transparent)" }}>
              <div className="font-bold mb-1" style={{ color: ok ? "var(--green-accent)" : "var(--red-accent)" }}>
                {ok ? "✓ Correct" : "✗ Not quite"}
              </div>
              {ex.explain && <p className="text-sm leading-relaxed">{ex.explain}</p>}
            </div>
          )}
          {!locked && ex.hint && <p className="text-xs text-cream-dim">💡 {ex.hint}</p>}

          <div className="flex justify-end">
            {!locked
              ? <button onClick={check} disabled={!given.trim()} className="btn-gold px-6 py-3 font-bold disabled:opacity-40">Check</button>
              : <button onClick={next} className="btn-gold px-6 py-3 font-bold">{idx + 1 < list.length ? "Continue →" : "See result →"}</button>}
          </div>
        </div>
      )}

      {/* Ergebnis */}
      {phase === "done" && unit && (
        <div className="card p-8 text-center space-y-5">
          {(() => {
            const pct = Math.round((correctCount / Math.max(1, list.length)) * 100);
            const passed = pct >= 80;
            return (
              <>
                <div className="text-5xl">{passed ? "🎓" : "💪"}</div>
                <div>
                  <div className="text-5xl font-extrabold" style={{ color: "var(--bordeaux)" }}>{pct}%</div>
                  <p className="text-cream-dim text-sm mt-1">{correctCount} of {list.length} correct</p>
                </div>
                <p className="text-sm max-w-md mx-auto">
                  {passed
                    ? "Unit mastered — the verb position is sitting where it belongs."
                    : `Almost there. You need 80% to master this unit${wrongIds.length ? ` — ${wrongIds.length} exercise${wrongIds.length === 1 ? "" : "s"} still tripped you up.` : "."}`}
                </p>
                {correctCount > 0 && (
                  <div className="text-sm inline-block px-4 py-2 rounded-full" style={{ background: "var(--bordeaux-deep)" }}>
                    <b className="text-gold-bright">+{correctCount} XP</b>
                  </div>
                )}
                <div className="flex items-center justify-center gap-3 pt-1">
                  <button onClick={restart} className="btn-gold px-6 py-3 font-bold">Practice again</button>
                  <Link href="/training" className="btn-outline px-6 py-3">Back to course</Link>
                </div>
                {unit.lessonId && (
                  <Link href={`/lessons/${unit.lessonId}`} className="block text-sm text-cream-dim hover:text-cream pt-1">
                    🎬 Watch the video lesson on this topic
                  </Link>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
