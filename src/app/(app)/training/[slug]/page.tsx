"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getUnitBySlug, getExercises, checkAnswer, saveAttempt, saveUnitResult, type Exercise, type Unit } from "@/lib/training";
import { getAccess } from "@/lib/access";
import { addXp } from "@/lib/progress";
import Paywall from "@/components/Paywall";
import ExerciseView from "@/components/training/ExerciseView";
import Lena from "@/components/training/Lena";
import SentenceSlots from "@/components/training/SentenceSlots";

// Lenas Sprüche – mitlernend, auf Augenhöhe, nie belehrend.
const PRAISE = ["Nailed it!", "Exactly.", "Nice — keep going!", "That was clean."];
const CONSOLE_LINES = ["So close — look:", "Almost! Here is why:", "No worries, this is the bit:"];

type Phase = "loading" | "blocked" | "missing" | "theory" | "practice" | "done";

// Auszeichnung: **wichtig** (Marker), *Verb* (Bordeaux-Chip), Leerzeile = Absatz.
// Bewusst deutlich abgesetzt – nur ein Farbunterschied ist zu schwach.
function RichText({ text, size = "base" }: { text: string; size?: "base" | "large" }) {
  const cls = size === "large" ? "text-[17px] leading-8" : "text-[15.5px] leading-7";
  return (
    <div className={`space-y-4 ${cls}`}>
      {text.split(/\n\s*\n/).map((para, i) => {
        // Zeilen mit "@" werden als Satz-Positionen gezeichnet:
        //   @Heute|lerne*|ich Deutsch   ("*" markiert das konjugierte Verb)
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
  const [list, setList] = useState<Exercise[]>([]);

  const [idx, setIdx] = useState(0);
  const [given, setGiven] = useState("");
  const [locked, setLocked] = useState(false);
  const [ok, setOk] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [combo, setCombo] = useState(0);   // Serie richtiger Antworten
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
    if (right) {
      setCorrectCount((c) => c + 1);
      setCombo((c) => { const n = c + 1; setBestCombo((b) => Math.max(b, n)); return n; });
    } else {
      setWrongIds((w) => [...w, ex.id]);
      setCombo(0);
    }
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
    setCorrectCount(0); setWrongIds([]); setCombo(0); setBestCombo(0); setSaved(false); setPhase("practice");
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
        <div className="flex items-center gap-3">
          {phase === "practice" && combo >= 2 && (
            <span key={combo} className="combo-pulse text-sm font-bold px-3 py-1 rounded-full"
              style={{ background: "var(--bordeaux)", color: "#fff" }}>
              🔥 {combo} in a row
            </span>
          )}
          {phase === "practice" && <span className="text-sm text-cream-dim">{idx + 1} / {list.length}</span>}
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

          <div className={`card p-6 relative ${locked ? (ok ? "fb-correct" : "fb-wrong") : ""}`}>
            <ExerciseView ex={ex} value={given} onChange={setGiven} locked={locked} correct={ok} />
            {locked && ok && (
              <div className="pointer-events-none absolute inset-0 overflow-visible">
                {Array.from({ length: 10 }, (_, i) => {
                  const ang = (i / 10) * Math.PI * 2;
                  const dist = 70 + (i % 3) * 26;
                  return (
                    <span key={i} className="spark absolute text-lg"
                      style={{
                        left: "50%", top: "42%",
                        ["--sx" as string]: `${Math.cos(ang) * dist}px`,
                        ["--sy" as string]: `${Math.sin(ang) * dist - 18}px`,
                        animationDelay: `${(i % 4) * 0.04}s`,
                      }}>
                      {["✨", "⭐", "🎉"][i % 3]}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rückmeldung mit Begründung */}
          {locked && (
            <div className="rounded-2xl p-5 sm:p-6" style={{
              background: ok ? "color-mix(in srgb, var(--green-accent) 14%, transparent)" : "color-mix(in srgb, var(--red-accent) 12%, transparent)",
              borderLeft: `6px solid ${ok ? "var(--green-accent)" : "var(--red-accent)"}`,
            }}>
              <div className="flex gap-4 items-start">
                {/* Nicht bei jeder Antwort – sonst nutzt sich ihre Wirkung ab.
                    Bei Fehlern immer (da hilft sie), bei Treffern nur an Combo-Marken. */}
                {(!ok || combo === 3 || combo === 5 || (combo >= 8 && combo % 4 === 0)) && (
                  <div className="shrink-0 hidden sm:block -mt-6">
                    <Lena mood={ok ? (combo >= 5 ? "cheer" : "encourage") : "oops"} size={158} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-lg mb-2" style={{ color: ok ? "var(--green-accent)" : "var(--red-accent)" }}>
                    {ok ? `✓ ${PRAISE[idx % PRAISE.length]}` : `✗ ${CONSOLE_LINES[idx % CONSOLE_LINES.length]}`}
                  </div>
                  {ex.explain && <RichText text={ex.explain} size="large" />}
                </div>
              </div>
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
                <div className="flex justify-center"><Lena mood={passed ? "cheer" : "encourage"} size={215} /></div>
                <div>
                  <div className="text-5xl font-extrabold" style={{ color: "var(--bordeaux)" }}>{pct}%</div>
                  <p className="text-cream-dim text-sm mt-1">{correctCount} of {list.length} correct</p>
                </div>
                <p className="text-sm max-w-md mx-auto">
                  {passed
                    ? "Unit mastered — the verb position is sitting where it belongs."
                    : `Almost there. You need 80% to master this unit${wrongIds.length ? ` — ${wrongIds.length} exercise${wrongIds.length === 1 ? "" : "s"} still tripped you up.` : "."}`}
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {correctCount > 0 && (
                    <div className="text-sm px-4 py-2 rounded-full" style={{ background: "var(--bordeaux-deep)" }}>
                      <b className="text-gold-bright">+{correctCount} XP</b>
                    </div>
                  )}
                  {bestCombo >= 2 && (
                    <div className="text-sm px-4 py-2 rounded-full" style={{ background: "var(--bordeaux-deep)" }}>
                      🔥 best run: <b className="text-gold-bright">{bestCombo}</b>
                    </div>
                  )}
                </div>
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
