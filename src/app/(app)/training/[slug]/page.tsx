"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getUnitBySlug, getUnits, getMyProgress, getExercises, checkAnswer, saveAttempt, saveUnitResult, type Exercise, type Unit } from "@/lib/training";
import { getAccess } from "@/lib/access";
import { createClient } from "@/lib/supabase/client";
import { addXp } from "@/lib/progress";
import Paywall from "@/components/Paywall";
import ExerciseView from "@/components/training/ExerciseView";
import Lena from "@/components/training/Lena";
import SentenceSlots from "@/components/training/SentenceSlots";

// Lenas Sprüche – mitlernend, auf Augenhöhe, nie belehrend.
const PRAISE = ["Nailed it!", "Exactly.", "Nice — keep going!", "That was clean."];
const CONSOLE_LINES = ["So close — look:", "Almost! Here is why:", "No worries, this is the bit:"];

type Phase = "loading" | "blocked" | "locked" | "missing" | "theory" | "practice" | "done";

// Auszeichnung: **wichtig** (Marker), *Verb* (Bordeaux-Chip), @-Zeile = Satzpositionen.
function RichText({ text, size = "base" }: { text: string; size?: "base" | "large" }) {
  const cls = size === "large" ? "text-[17px] leading-8" : "text-[15.5px] leading-7";
  return (
    <div className={`space-y-4 ${cls}`}>
      {text.split(/\n\s*\n/).map((para, i) => {
        if (para.trimStart().startsWith("@")) {
          return (
            <div key={i} className="space-y-3 my-2">
              {para.split("\n").filter((l) => l.trim().startsWith("@")).map((line, k) => {
                const raw = line.trim().slice(1).split("|").map((t) => t.trim());
                const verb = raw.findIndex((t) => t.endsWith("*"));
                return <SentenceSlots key={k} tokens={raw.map((t) => t.replace(/\*$/, ""))} verb={verb >= 0 ? verb : undefined} />;
              })}
            </div>
          );
        }
        return (
          <p key={i}>
            {para.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, k) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <mark key={k} className="font-extrabold rounded px-1.5 py-0.5"
                    style={{ background: "color-mix(in srgb, var(--gold) 42%, transparent)", color: "var(--cream)" }}>
                    {part.slice(2, -2)}
                  </mark>
                );
              }
              if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
                return (
                  <span key={k} className="font-bold rounded px-1.5 py-0.5 whitespace-nowrap"
                    style={{ background: "var(--bordeaux)", color: "#fff" }}>
                    {part.slice(1, -1)}
                  </span>
                );
              }
              return <span key={k}>{part.split("\n").map((line, n) => <span key={n}>{n > 0 && <br />}{line}</span>)}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

export default function TrainingUnitPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [phase, setPhase] = useState<Phase>("loading");
  const [unit, setUnit] = useState<Unit | null>(null);
  const [all, setAll] = useState<Exercise[]>([]);
  const [blockedBy, setBlockedBy] = useState<Unit | null>(null);

  // Warteschlange statt festem Index: falsch beantwortete Aufgaben kommen am
  // Ende der Runde erneut dran, bis sie sitzen.
  const [queue, setQueue] = useState<Exercise[]>([]);
  const [pos, setPos] = useState(0);
  const [retry, setRetry] = useState<Exercise[]>([]);
  const [round, setRound] = useState(1);

  const [given, setGiven] = useState("");
  const [locked, setLocked] = useState(false);
  const [ok, setOk] = useState(false);
  const [showRule, setShowRule] = useState(false);

  // Bewertet wird nur der erste Durchgang – sonst hätte jede Einheit 100 %.
  const [firstPassRight, setFirstPassRight] = useState(0);
  const [missed, setMissed] = useState<Exercise[]>([]);
  // Ein Nachlauf mit nur den Fehlern zählt nicht noch einmal für Note und XP.
  const [scoreRun, setScoreRun] = useState(true);

  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const access = await getAccess();
      if (access.tier !== "full") { if (!cancelled) setPhase("blocked"); return; }
      const u = await getUnitBySlug(slug);
      if (cancelled) return;
      if (!u) { setPhase("missing"); return; }

      // Schritt für Schritt: alle Einheiten davor müssen sitzen.
      const [list, prog] = await Promise.all([getUnits(), getMyProgress()]);
      if (cancelled) return;
      const idx = list.findIndex((x) => x.id === u.id);
      const gap = list.slice(0, Math.max(idx, 0)).find((x) => (prog[x.id]?.mastery ?? 0) < 80);
      if (gap) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = user
          ? await supabase.from("profiles").select("is_teacher").eq("id", user.id).single()
          : { data: null };
        if (cancelled) return;
        if (!profile?.is_teacher) { setUnit(u); setBlockedBy(gap); setPhase("locked"); return; }
      }

      const ex = await getExercises(u.id);
      if (cancelled) return;
      setUnit(u); setAll(ex); setQueue(ex); setPhase("theory");
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const ex = queue[pos];
  const isFirstRound = round === 1;

  const check = useCallback(() => {
    if (!ex || locked || !given.trim()) return;
    const right = checkAnswer(ex, given);
    setOk(right); setLocked(true);
    void saveAttempt(ex.id, right, given);

    if (isFirstRound) {
      if (right) setFirstPassRight((n) => n + 1);
      else setMissed((m) => (m.some((x) => x.id === ex.id) ? m : [...m, ex]));
    }
    if (right) {
      setCombo((c) => { const n = c + 1; setBestCombo((b) => Math.max(b, n)); return n; });
    } else {
      setCombo(0);
      setRetry((r) => (r.some((x) => x.id === ex.id) ? r : [...r, ex]));
    }
  }, [ex, locked, given, isFirstRound]);

  const next = useCallback(() => {
    setGiven(""); setLocked(false); setOk(false); setShowRule(false);
    if (pos + 1 < queue.length) { setPos(pos + 1); return; }
    if (retry.length > 0) {              // Fehler-Schleife
      setQueue(retry); setRetry([]); setPos(0); setRound((r) => r + 1); return;
    }
    setPhase("done");
  }, [pos, queue.length, retry]);

  // Tastatur: Ziffern wählen aus, Enter prüft bzw. geht weiter.
  useEffect(() => {
    if (phase !== "practice") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") { e.preventDefault(); if (locked) next(); else check(); return; }
      if (!locked && ex?.kind === "choice") {
        const i = ["1", "2", "3", "4"].indexOf(e.key);
        if (i >= 0 && ex.options[i]) { e.preventDefault(); setGiven(String(i)); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, locked, ex, check, next]);

  useEffect(() => {
    if (phase !== "done" || saved || !unit || all.length === 0) return;
    setSaved(true);
    if (!scoreRun) return; // Nachlauf: Note und XP gab es schon
    void saveUnitResult(unit.id, Math.round((firstPassRight / all.length) * 100));
    if (firstPassRight > 0) void addXp(firstPassRight);
  }, [phase, saved, unit, all.length, firstPassRight, scoreRun]);

  const start = (only?: Exercise[]) => {
    const subset = !!(only && only.length);
    setQueue(subset ? only! : all); setPos(0); setRetry([]); setRound(subset ? 2 : 1);
    setGiven(""); setLocked(false); setOk(false); setShowRule(false);
    setScoreRun(!subset);
    if (!subset) { setFirstPassRight(0); setMissed([]); }
    setCombo(0); setBestCombo(0); setSaved(false); setPhase("practice");
  };

  const total = all.length;
  const pct = useMemo(() => (total ? Math.round((firstPassRight / total) * 100) : 0), [firstPassRight, total]);

  if (phase === "loading") return <p className="text-sm text-cream-dim">Loading…</p>;
  if (phase === "blocked") return <Paywall title="Unlock the training course" />;
  if (phase === "locked" && blockedBy) return (
    <div className="card p-8 text-center space-y-4 max-w-lg mx-auto">
      <div className="flex justify-center"><Lena mood="explain" size={170} /></div>
      <p className="text-xl font-bold">One step at a time 🔒</p>
      <p className="text-sm text-cream-dim">
        {unit?.title} builds on things you have not practised yet. Finish{" "}
        <b className="text-cream">{blockedBy.title}</b> first — then this one opens up.
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap pt-1">
        <Link href={`/training/${blockedBy.slug}`} className="btn-gold px-6 py-3 font-bold">Go to {blockedBy.title} →</Link>
        <Link href="/training" className="btn-outline px-6 py-3">Back to course</Link>
      </div>
    </div>
  );
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
        <div className="flex items-center gap-3">
          {phase === "practice" && combo >= 2 && (
            <span key={combo} className="combo-pulse text-sm font-bold px-3 py-1 rounded-full"
              style={{ background: "var(--bordeaux)", color: "#fff" }}>🔥 {combo} in a row</span>
          )}
          {phase === "practice" && (
            <span className="text-sm text-cream-dim">
              {isFirstRound ? `${pos + 1} / ${queue.length}` : `Fixing · ${pos + 1} / ${queue.length}`}
            </span>
          )}
        </div>
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
          <div className="card p-6 sm:p-7 flex gap-5 items-start">
            <div className="shrink-0 hidden md:block -mt-2"><Lena mood="explain" size={172} /></div>
            <div className="min-w-0 flex-1"><RichText text={unit.theory} size="large" /></div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => start()} className="btn-gold px-6 py-3 font-bold">Start practice →</button>
            <span className="text-xs text-cream-dim">{all.length} exercises</span>
          </div>
        </div>
      )}

      {/* Aufgaben */}
      {phase === "practice" && ex && (
        <div className="space-y-5">
          {!isFirstRound && (
            <div className="rounded-xl px-4 py-2.5 text-sm" style={{ background: "color-mix(in srgb, var(--gold) 16%, transparent)" }}>
              🔁 <b>Round {round}</b> — the ones that tripped you up. They keep coming back until they sit.
            </div>
          )}

          <div className="h-2 rounded-full" style={{ background: "var(--bordeaux-deep)" }}>
            <div className="h-2 rounded-full transition-all"
              style={{ width: `${((pos + (locked ? 1 : 0)) / queue.length) * 100}%`, background: "var(--gold-bright)" }} />
          </div>

          <div className={`card p-6 relative ${locked ? (ok ? "fb-correct" : "fb-wrong") : ""}`}>
            <ExerciseView ex={ex} value={given} onChange={setGiven} locked={locked} correct={ok} />
            {locked && ok && (
              <div className="pointer-events-none absolute inset-0 overflow-visible">
                {Array.from({ length: 10 }, (_, i) => {
                  const ang = (i / 10) * Math.PI * 2, dist = 70 + (i % 3) * 26;
                  return (
                    <span key={i} className="spark absolute text-lg"
                      style={{ left: "50%", top: "42%", ["--sx" as string]: `${Math.cos(ang) * dist}px`, ["--sy" as string]: `${Math.sin(ang) * dist - 18}px`, animationDelay: `${(i % 4) * 0.04}s` }}>
                      {["✨", "⭐", "🎉"][i % 3]}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Regel nachschlagen, ohne die Einheit zu verlassen */}
          {unit && (
            <div>
              <button onClick={() => setShowRule((s) => !s)} className="text-sm text-cream-dim hover:text-cream underline underline-offset-4">
                {showRule ? "Hide the rule" : "Show me the rule again"}
              </button>
              {showRule && <div className="card p-5 mt-2"><RichText text={unit.theory} /></div>}
            </div>
          )}

          {locked && (
            <div className="rounded-2xl p-5 sm:p-6" style={{
              background: ok ? "color-mix(in srgb, var(--green-accent) 14%, transparent)" : "color-mix(in srgb, var(--red-accent) 12%, transparent)",
              borderLeft: `6px solid ${ok ? "var(--green-accent)" : "var(--red-accent)"}`,
            }}>
              <div className="flex gap-3 sm:gap-4 items-start">
                {/* Auch auf dem Handy sichtbar, dort nur kleiner */}
                {(!ok || combo === 3 || combo === 5 || (combo >= 8 && combo % 4 === 0)) && (
                  <div className="shrink-0 w-20 sm:w-[150px] -mt-4 sm:-mt-6">
                    <Lena mood={ok ? (combo >= 5 ? "cheer" : "encourage") : "oops"} className="w-full" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-lg mb-2" style={{ color: ok ? "var(--green-accent)" : "var(--red-accent)" }}>
                    {ok ? `✓ ${PRAISE[pos % PRAISE.length]}` : `✗ ${CONSOLE_LINES[pos % CONSOLE_LINES.length]}`}
                  </div>
                  {ex.explain && <RichText text={ex.explain} size="large" />}
                </div>
              </div>
            </div>
          )}
          {!locked && ex.hint && <p className="text-xs text-cream-dim">💡 {ex.hint}</p>}

          <div className="flex justify-between items-center gap-3">
            <span className="text-xs text-cream-dim hidden sm:block">
              {locked ? "Press Enter to continue" : ex.kind === "choice" ? "Keys 1–4 to choose · Enter to check" : "Press Enter to check"}
            </span>
            {!locked
              ? <button onClick={check} disabled={!given.trim()} className="btn-gold px-6 py-3 font-bold disabled:opacity-40">Check</button>
              : <button onClick={next} className="btn-gold px-6 py-3 font-bold">
                  {pos + 1 < queue.length || retry.length > 0 ? "Continue →" : "See result →"}
                </button>}
          </div>
        </div>
      )}

      {/* Ergebnis eines vollen Durchgangs */}
      {phase === "done" && unit && scoreRun && (
        <div className="card p-8 text-center space-y-5">
          <div className="flex justify-center">
            <Lena mood={pct >= 80 ? "cheer" : "encourage"} size={215} />
          </div>
          <div>
            <div className="text-5xl font-extrabold" style={{ color: "var(--bordeaux)" }}>{pct}%</div>
            <p className="text-cream-dim text-sm mt-1">{firstPassRight} of {total} right on the first try</p>
          </div>
          <p className="text-sm max-w-md mx-auto">
            {pct >= 80
              ? "Unit mastered — and you worked through every mistake before finishing."
              : "You fixed every mistake. Run it once more to push past 80%."}
          </p>

          {missed.length > 0 && (
            <div className="text-left max-w-lg mx-auto rounded-xl p-4" style={{ background: "var(--bordeaux-deep)" }}>
              <div className="text-sm font-bold mb-2">These needed a second look:</div>
              <ul className="space-y-1.5">
                {missed.map((m) => <li key={m.id} className="text-sm text-cream-dim">• {m.prompt}</li>)}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {firstPassRight > 0 && (
              <div className="text-sm px-4 py-2 rounded-full" style={{ background: "var(--bordeaux-deep)" }}>
                <b className="text-gold-bright">+{firstPassRight} XP</b>
              </div>
            )}
            {bestCombo >= 2 && (
              <div className="text-sm px-4 py-2 rounded-full" style={{ background: "var(--bordeaux-deep)" }}>
                🔥 best run: <b className="text-gold-bright">{bestCombo}</b>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
            {missed.length > 0 && (
              <button onClick={() => start(missed)} className="btn-gold px-6 py-3 font-bold">
                Practise the {missed.length} you missed
              </button>
            )}
            <button onClick={() => start()} className="btn-outline px-6 py-3">Practice all again</button>
            <Link href="/training" className="btn-outline px-6 py-3">Back to course</Link>
          </div>
          {unit.lessonId && (
            <Link href={`/lessons/${unit.lessonId}`} className="block text-sm text-cream-dim hover:text-cream pt-1">
              🎬 Watch the video lesson on this topic
            </Link>
          )}
        </div>
      )}

      {/* Ergebnis eines Nachlaufs mit nur den Fehlern */}
      {phase === "done" && unit && !scoreRun && (
        <div className="card p-8 text-center space-y-5">
          <div className="flex justify-center"><Lena mood="cheer" size={200} /></div>
          <div>
            <div className="text-3xl font-extrabold" style={{ color: "var(--bordeaux)" }}>Mistakes cleared 🎯</div>
            <p className="text-cream-dim text-sm mt-2">
              You got {missed.length === 1 ? "it" : `all ${missed.length}`} right this time. Your unit score stays at {pct}%.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={() => start()} className="btn-gold px-6 py-3 font-bold">Run the whole unit again</button>
            <Link href="/training" className="btn-outline px-6 py-3">Back to course</Link>
          </div>
        </div>
      )}
    </div>
  );
}
