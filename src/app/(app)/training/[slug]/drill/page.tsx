"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { checkAnswer, getUnitBySlug, getExercises, type Exercise } from "@/lib/training";
import { getDrillForUnit, generateDrill, buildFallbackDrill } from "@/lib/drills";
import { getAccess } from "@/lib/access";
import { addXp } from "@/lib/progress";
import Paywall from "@/components/Paywall";
import ExerciseView from "@/components/training/ExerciseView";
import Lena from "@/components/training/Lena";
import Theory from "@/components/training/Theory";

// Intensiv-Modus: ein langer Drill aus generierten Aufgaben. Nutzt dieselbe
// Übungsmechanik wie der Themen-Trainer (Fehler-Schleife, Tastatur, Lena), aber
// die Aufgaben werden aus einer Wortliste gezogen – nie zweimal exakt dieselbe.
//
// Kein Fortschritt, keine Bewertung: es geht ums Wiederholen, bis es sitzt.
// Deshalb auch kein saveAttempt – die generierten Aufgaben haben keine
// Datenbank-Kennung.

const PRAISE = ["Nailed it!", "Exactly.", "Nice — keep going!", "That was clean."];
const CONSOLE_LINES = ["So close — look:", "Almost! Here is why:", "No worries, this is the bit:"];
const COUNT = 20;

type Phase = "loading" | "blocked" | "missing" | "practice" | "done";

export default function DrillPage() {
  const slug = useParams<{ slug: string }>().slug;
  const [phase, setPhase] = useState<Phase>("loading");
  const [title, setTitle] = useState("");
  // Quelle einer Runde: entweder aus der Wortliste generiert oder als Fallback
  // aus den vorhandenen Aufgaben der Einheit gemischt.
  const [makeRound, setMakeRound] = useState<(() => Exercise[]) | null>(null);
  const [fresh, setFresh] = useState(true); // true = generiert, false = Einheiten-Aufgaben

  const [queue, setQueue] = useState<Exercise[]>([]);
  const [pos, setPos] = useState(0);
  const [retry, setRetry] = useState<Exercise[]>([]);
  const [round, setRound] = useState(1);
  const [given, setGiven] = useState("");
  const [locked, setLocked] = useState(false);
  const [ok, setOk] = useState(false);

  const [firstPassRight, setFirstPassRight] = useState(0);
  const [total, setTotal] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const access = await getAccess();
      if (access.tier !== "full") { if (!cancelled) setPhase("blocked"); return; }

      const s = getDrillForUnit(slug);
      if (s) {
        // Wortliste vorhanden: endlos frisch generieren.
        if (cancelled) return;
        setTitle(s.title); setFresh(true);
        const gen = () => generateDrill(s, COUNT);
        setMakeRound(() => gen);
        beginRound(gen);
        return;
      }

      // Kein Set: die vorhandenen Aufgaben der Einheit endlos durchmischen.
      const unit = await getUnitBySlug(slug);
      if (cancelled) return;
      if (!unit) { setPhase("missing"); return; }
      const ex = await getExercises(unit.id);
      if (cancelled) return;
      if (ex.length === 0) { setPhase("missing"); return; }
      setTitle(unit.title); setFresh(false);
      const gen = () => buildFallbackDrill(ex, COUNT);
      setMakeRound(() => gen);
      beginRound(gen);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const beginRound = (gen: () => Exercise[]) => {
    const items = gen();
    setQueue(items); setTotal(items.length); setPos(0); setRetry([]); setRound(1);
    setGiven(""); setLocked(false); setOk(false);
    setFirstPassRight(0); setCombo(0); setBestCombo(0); setSaved(false);
    setPhase("practice");
  };

  const ex = queue[pos];
  const isFirstRound = round === 1;

  const check = useCallback(() => {
    if (!ex || locked || !given.trim()) return;
    const right = checkAnswer(ex, given);
    setOk(right); setLocked(true);
    if (isFirstRound && right) setFirstPassRight((n) => n + 1);
    if (right) setCombo((c) => { const n = c + 1; setBestCombo((b) => Math.max(b, n)); return n; });
    else { setCombo(0); setRetry((r) => (r.some((x) => x.id === ex.id) ? r : [...r, ex])); }
  }, [ex, locked, given, isFirstRound]);

  const next = useCallback(() => {
    setGiven(""); setLocked(false); setOk(false);
    if (pos + 1 < queue.length) { setPos(pos + 1); return; }
    if (retry.length > 0) { setQueue(retry); setRetry([]); setPos(0); setRound((r) => r + 1); return; }
    setPhase("done");
  }, [pos, queue.length, retry]);

  useEffect(() => {
    if (phase !== "practice") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") { e.preventDefault(); if (locked) next(); else check(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, locked, check, next]);

  useEffect(() => {
    if (phase !== "done" || saved) return;
    setSaved(true);
    if (firstPassRight > 0) void addXp(firstPassRight);
  }, [phase, saved, firstPassRight]);

  const pct = total ? Math.round((firstPassRight / total) * 100) : 0;

  if (phase === "loading") return <p className="text-sm text-cream-dim">Loading…</p>;
  if (phase === "blocked") return <Paywall title="Unlock the intensive drill" />;
  if (phase === "missing") return (
    <div className="card p-6 text-center space-y-3 max-w-lg mx-auto">
      <p className="font-semibold">There is no intensive drill for this topic (yet).</p>
      <Link href={`/training/${slug}`} className="btn-outline inline-block px-5 py-2.5">Back to the topic</Link>
    </div>
  );

  // ── Übung ────────────────────────────────────────────────────────────────
  if (phase === "practice" && ex) {
    return (
      <div className="space-y-5 max-w-2xl">
        <div className="flex items-center justify-between text-sm">
          <Link href={`/training/${slug}`} className="text-cream-dim hover:text-cream">← Leave</Link>
          <div className="flex items-center gap-3">
            {combo >= 3 && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--bordeaux)", color: "#fff" }}>🔥 {combo} in a row</span>}
            <span className="text-cream-dim">{round > 1 ? "Fixing · " : ""}{pos + 1} / {queue.length}</span>
          </div>
        </div>
        {round === 1 && (
          <div className="h-1.5 rounded-full bg-bordeaux-deep/60 overflow-hidden">
            <div className="h-1.5 rounded-full transition-all" style={{ width: `${(pos / total) * 100}%`, background: "var(--gold-bright)" }} />
          </div>
        )}

        <div className="card p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "var(--bordeaux)", color: "#fff" }}>🔥 Intensive</span>
            <span className="text-xs text-cream-dim">{title}</span>
          </div>

          <ExerciseView ex={ex} value={given} onChange={setGiven} locked={locked} correct={ok} />

          {locked && (
            <div className="rounded-2xl p-5 sm:p-6" style={{
              background: ok ? "color-mix(in srgb, var(--green-accent) 14%, transparent)" : "color-mix(in srgb, var(--red-accent) 12%, transparent)",
              borderLeft: `6px solid ${ok ? "var(--green-accent)" : "var(--red-accent)"}`,
            }}>
              <div className="flex gap-3 sm:gap-4 items-start">
                {(!ok || combo === 5 || (combo >= 10 && combo % 5 === 0)) && (
                  <div className="shrink-0 w-20 sm:w-[140px] -mt-4 sm:-mt-6">
                    <Lena mood={ok ? (combo >= 5 ? "cheer" : "encourage") : "oops"} className="w-full" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-lg mb-2" style={{ color: ok ? "var(--green-accent)" : "var(--red-accent)" }}>
                    {ok ? `✓ ${PRAISE[pos % PRAISE.length]}` : `✗ ${CONSOLE_LINES[pos % CONSOLE_LINES.length]}`}
                  </div>
                  {ex.explain && <Theory text={ex.explain} />}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center gap-3">
            <span className="text-xs text-cream-dim hidden sm:block">{locked ? "Press Enter to continue" : "Press Enter to check"}</span>
            {!locked
              ? <button onClick={check} disabled={!given.trim()} className="btn-gold px-6 py-3 font-bold disabled:opacity-40">Check</button>
              : <button onClick={next} className="btn-gold px-6 py-3 font-bold">
                  {pos + 1 < queue.length || retry.length > 0 ? "Continue →" : "See result →"}
                </button>}
          </div>
        </div>
      </div>
    );
  }

  // ── Ergebnis ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card p-8 text-center space-y-5">
        <div className="flex justify-center"><Lena mood={pct >= 80 ? "cheer" : "encourage"} size={200} /></div>
        <div>
          <div className="text-5xl font-extrabold" style={{ color: "var(--bordeaux)" }}>{pct}%</div>
          <p className="text-cream-dim text-sm mt-1">{firstPassRight} of {total} right on the first try</p>
        </div>
        <p className="text-sm max-w-md mx-auto">
          {pct >= 80
            ? "That is starting to sit. The more rounds you do, the less you have to think about it."
            : fresh
              ? "This is exactly the topic that rewards repetition. Run another round — the questions will be different."
              : "Run another round — the questions come back reshuffled, and the ones you missed keep returning until they sit."}
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {firstPassRight > 0 && <div className="text-sm px-4 py-2 rounded-full" style={{ background: "var(--bordeaux-deep)" }}><b className="text-gold-bright">+{firstPassRight} XP</b></div>}
          {bestCombo >= 3 && <div className="text-sm px-4 py-2 rounded-full" style={{ background: "var(--bordeaux-deep)" }}>🔥 best run: <b className="text-gold-bright">{bestCombo}</b></div>}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => makeRound && beginRound(makeRound)} className="btn-gold px-6 py-3 font-bold">Another {COUNT} →</button>
        <Link href={`/training/${slug}`} className="btn-outline px-6 py-3">Back to the topic</Link>
      </div>
    </div>
  );
}
