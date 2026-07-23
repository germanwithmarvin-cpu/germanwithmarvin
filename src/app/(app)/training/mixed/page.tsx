"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getUnits, getMyProgress, getMixedExercises, checkAnswer, saveAttempt, type Unit, type UnitProgress, type MixedItem } from "@/lib/training";
import { getAccess } from "@/lib/access";
import { addXp } from "@/lib/progress";
import Paywall from "@/components/Paywall";
import ExerciseView from "@/components/training/ExerciseView";
import Lena from "@/components/training/Lena";
import Theory from "@/components/training/Theory";

// Freies Training: Aufgaben quer über die Themen, die der Schüler schon
// bearbeitet hat. Interleaving statt Blocktraining – näher am echten Sprechen,
// wo nie feststeht, welche Regel gleich gefragt ist.
//
// Kein Notendruck: es wird nichts gemeistert und keine Einheit bewertet. Jede
// Antwort wird trotzdem protokolliert (Grundlage für den Schwächen-Fokus), und
// richtige Antworten geben XP.

const PRAISE = ["Nailed it!", "Exactly.", "Nice — keep going!", "That was clean."];
const CONSOLE_LINES = ["So close — look:", "Almost! Here is why:", "No worries, this is the bit:"];
const LEVELS = ["A1", "A2", "B1", "B2", "C1"];
const COUNT = 15;

type Phase = "loading" | "blocked" | "empty" | "setup" | "practice" | "done";
type Focus = "mix" | "weak";

export default function MixedPracticePage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [units, setUnits] = useState<Unit[]>([]);
  const [progress, setProgress] = useState<Record<string, UnitProgress>>({});
  const [isTeacher, setIsTeacher] = useState(false);

  // Auswahl auf dem Startbildschirm.
  const [level, setLevel] = useState<string>("all");
  const [focus, setFocus] = useState<Focus>("mix");

  // Übungslauf.
  const [queue, setQueue] = useState<MixedItem[]>([]);
  const [pos, setPos] = useState(0);
  const [retry, setRetry] = useState<MixedItem[]>([]);
  const [round, setRound] = useState(1);
  const [given, setGiven] = useState("");
  const [locked, setLocked] = useState(false);
  const [ok, setOk] = useState(false);
  const [showRule, setShowRule] = useState(false);

  const [firstPassRight, setFirstPassRight] = useState(0);
  const [total, setTotal] = useState(0);
  const [missed, setMissed] = useState<MixedItem[]>([]);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const access = await getAccess();
      if (access.tier !== "full") { if (!cancelled) setPhase("blocked"); return; }
      const [u, p] = await Promise.all([getUnits(), getMyProgress()]);
      if (cancelled) return;
      setUnits(u); setProgress(p);

      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      let teacher = false;
      if (user) {
        const { data } = await supabase.from("profiles").select("is_teacher").eq("id", user.id).single();
        teacher = Boolean(data?.is_teacher);
      }
      if (cancelled) return;
      setIsTeacher(teacher);

      // Pool: bearbeitete Themen. Der Lehrer (und ein Konto ganz ohne
      // Fortschritt) darf alles mischen – sonst gäbe es nichts zu üben.
      const hasProgress = u.some((x) => p[x.id]);
      const pool = teacher || !hasProgress ? u : u.filter((x) => p[x.id]);
      setPhase(pool.length === 0 ? "empty" : "setup");
    })();
    return () => { cancelled = true; };
  }, []);

  // Die Einheiten, aus denen aktuell gezogen werden darf.
  const poolUnits = useMemo(() => {
    const hasProgress = units.some((x) => progress[x.id]);
    const base = isTeacher || !hasProgress ? units : units.filter((x) => progress[x.id]);
    return level === "all" ? base : base.filter((u) => u.level === level);
  }, [units, progress, isTeacher, level]);

  // Level, die überhaupt bearbeitete Einheiten enthalten (für die Chips).
  const availableLevels = useMemo(() => {
    const hasProgress = units.some((x) => progress[x.id]);
    const base = isTeacher || !hasProgress ? units : units.filter((x) => progress[x.id]);
    return LEVELS.filter((lv) => base.some((u) => u.level === lv));
  }, [units, progress, isTeacher]);

  const start = useCallback(async () => {
    // Schwächen-Fokus: schwache Themen häufiger. mastery 0 → Gewicht 120,
    // mastery 100 → Gewicht 20, also bis zu sechsmal so oft.
    const weights: Record<string, number> = {};
    if (focus === "weak") {
      for (const u of poolUnits) weights[u.id] = 120 - (progress[u.id]?.mastery ?? 0);
    }
    const items = await getMixedExercises(
      poolUnits.map((u) => ({ id: u.id, title: u.title, slug: u.slug, level: u.level })),
      COUNT,
      focus === "weak" ? weights : undefined,
    );
    setQueue(items); setTotal(items.length); setPos(0); setRetry([]); setRound(1);
    setGiven(""); setLocked(false); setOk(false); setShowRule(false);
    setFirstPassRight(0); setMissed([]); setCombo(0); setBestCombo(0); setSaved(false);
    setPhase(items.length ? "practice" : "empty");
  }, [poolUnits, focus, progress]);

  const item = queue[pos];
  const ex = item?.ex;
  const isFirstRound = round === 1;

  const check = useCallback(() => {
    if (!ex || locked || !given.trim()) return;
    const right = checkAnswer(ex, given);
    setOk(right); setLocked(true);
    void saveAttempt(ex.id, right, given);
    if (isFirstRound) {
      if (right) setFirstPassRight((n) => n + 1);
      else setMissed((m) => (m.some((x) => x.ex.id === ex.id) ? m : [...m, item]));
    }
    if (right) setCombo((c) => { const n = c + 1; setBestCombo((b) => Math.max(b, n)); return n; });
    else { setCombo(0); setRetry((r) => (r.some((x) => x.ex.id === ex.id) ? r : [...r, item])); }
  }, [ex, item, locked, given, isFirstRound]);

  const next = useCallback(() => {
    setGiven(""); setLocked(false); setOk(false); setShowRule(false);
    if (pos + 1 < queue.length) { setPos(pos + 1); return; }
    if (retry.length > 0) { setQueue(retry); setRetry([]); setPos(0); setRound((r) => r + 1); return; }
    setPhase("done");
  }, [pos, queue.length, retry]);

  // Tastatur wie im Themen-Trainer.
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
    if (phase !== "done" || saved) return;
    setSaved(true);
    if (firstPassRight > 0) void addXp(firstPassRight);
  }, [phase, saved, firstPassRight]);

  const pct = total ? Math.round((firstPassRight / total) * 100) : 0;

  if (phase === "loading") return <p className="text-sm text-cream-dim">Loading…</p>;
  if (phase === "blocked") return <Paywall title="Unlock free practice" />;

  if (phase === "empty") {
    return (
      <div className="card p-8 text-center space-y-4 max-w-lg mx-auto">
        <div className="flex justify-center"><Lena mood="explain" size={170} /></div>
        <p className="text-xl font-bold">Nothing to mix yet</p>
        <p className="text-sm text-cream-dim">
          Free practice draws on the topics you have already worked through. Do a couple of units first,
          then come back — I&apos;ll shuffle them for you.
        </p>
        <Link href="/training" className="btn-gold inline-block px-6 py-3 font-bold">Go to the topics →</Link>
      </div>
    );
  }

  // ── Startbildschirm ───────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-start gap-4">
          <div className="shrink-0 hidden sm:block -mt-2"><Lena mood="wave" size={140} /></div>
          <div className="pt-1">
            <h1 className="text-2xl font-bold">Free practice 🎲</h1>
            <p className="text-cream-dim text-sm mt-1">
              {COUNT} questions, drawn at random across your topics. Mixing them is harder than a single
              block — and that is exactly why it sticks.
            </p>
          </div>
        </div>

        <div className="card p-6 space-y-6">
          <div>
            <div className="text-sm font-bold mb-2">Which level?</div>
            <div className="flex flex-wrap gap-2">
              {["all", ...availableLevels].map((lv) => (
                <button key={lv} onClick={() => setLevel(lv)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition"
                  style={{
                    background: level === lv ? "var(--gold)" : "var(--bordeaux-deep)",
                    color: level === lv ? "#3b2116" : "var(--cream)",
                  }}>
                  {lv === "all" ? "Everything" : lv}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-bold mb-2">What should come up?</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {([["mix", "Colourful mix", "Every topic equally likely."],
                 ["weak", "My weak spots first", "More from the topics you scored low on."]] as const).map(([key, title, sub]) => (
                <button key={key} onClick={() => setFocus(key)}
                  className="text-left rounded-xl p-4 transition"
                  style={{
                    background: focus === key ? "color-mix(in srgb, var(--gold) 16%, transparent)" : "var(--bordeaux-deep)",
                    boxShadow: focus === key ? "inset 0 0 0 2px var(--gold)" : "none",
                  }}>
                  <div className="font-bold text-sm">{title}</div>
                  <div className="text-xs text-cream-dim mt-0.5">{sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap pt-1">
            <button onClick={() => void start()} className="btn-gold px-6 py-3 font-bold">Start mixing →</button>
            <Link href="/training" className="btn-outline px-6 py-3">Back to topics</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Übung ────────────────────────────────────────────────────────────────
  if (phase === "practice" && item && ex) {
    return (
      <div className="space-y-5 max-w-2xl">
        <div className="flex items-center justify-between text-sm">
          <Link href="/training" className="text-cream-dim hover:text-cream">← Leave</Link>
          <div className="flex items-center gap-3">
            {combo >= 2 && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--bordeaux)", color: "#fff" }}>🔥 {combo} in a row</span>}
            <span className="text-cream-dim">{round > 1 ? "Fixing · " : ""}{pos + 1} / {queue.length}</span>
          </div>
        </div>
        {round === 1 && (
          <div className="h-1.5 rounded-full bg-bordeaux-deep/60 overflow-hidden">
            <div className="h-1.5 rounded-full transition-all" style={{ width: `${((pos) / total) * 100}%`, background: "var(--gold-bright)" }} />
          </div>
        )}

        <div className="card p-6 sm:p-7 space-y-5">
          {/* Woher kommt die Aufgabe? Bewusst sichtbar – das Erkennen des Themas
              ist beim gemischten Üben der halbe Lerneffekt. */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "var(--bordeaux-deep)", color: "var(--cream-dim)" }}>{item.level}</span>
            <Link href={`/training/${item.unitSlug}`} className="text-xs text-cream-dim hover:text-cream underline underline-offset-2">{item.unitTitle}</Link>
          </div>

          <ExerciseView ex={ex} value={given} onChange={setGiven} locked={locked} correct={ok} />

          {locked && (
            <div className="rounded-2xl p-5 sm:p-6" style={{
              background: ok ? "color-mix(in srgb, var(--green-accent) 14%, transparent)" : "color-mix(in srgb, var(--red-accent) 12%, transparent)",
              borderLeft: `6px solid ${ok ? "var(--green-accent)" : "var(--red-accent)"}`,
            }}>
              <div className="flex gap-3 sm:gap-4 items-start">
                {(!ok || combo === 3 || combo === 5 || (combo >= 8 && combo % 4 === 0)) && (
                  <div className="shrink-0 w-20 sm:w-[150px] -mt-4 sm:-mt-6">
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
          <p className="text-cream-dim text-sm mt-1">{firstPassRight} of {total} right on the first try — across {level === "all" ? "all your topics" : level}</p>
        </div>
        <p className="text-sm max-w-md mx-auto">
          {pct >= 80
            ? "Strong — you can tell the topics apart, not just recite them one block at a time."
            : "That is the point of mixing: it shows which topics still blur together. Worth a second round."}
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {firstPassRight > 0 && <div className="text-sm px-4 py-2 rounded-full" style={{ background: "var(--bordeaux-deep)" }}><b className="text-gold-bright">+{firstPassRight} XP</b></div>}
          {bestCombo >= 2 && <div className="text-sm px-4 py-2 rounded-full" style={{ background: "var(--bordeaux-deep)" }}>🔥 best run: <b className="text-gold-bright">{bestCombo}</b></div>}
        </div>
      </div>

      {missed.length > 0 && (
        <div className="card p-5">
          <div className="text-sm font-bold mb-3">Topics that tripped you up — tap to train the whole block:</div>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Map(missed.map((m) => [m.unitSlug, m])).values()).map((m) => (
              <Link key={m.unitSlug} href={`/training/${m.unitSlug}`}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold transition hover:opacity-80"
                style={{ background: "color-mix(in srgb, var(--gold) 20%, transparent)", color: "var(--cream)" }}>
                {m.unitTitle} <span className="text-cream-dim">{m.level}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => void start()} className="btn-gold px-6 py-3 font-bold">Shuffle again</button>
        <button onClick={() => setPhase("setup")} className="btn-outline px-6 py-3">Change level or focus</button>
        <Link href="/training" className="btn-outline px-6 py-3">Back to topics</Link>
      </div>
    </div>
  );
}
