"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CHECK_QUESTIONS, summarise, saveCheckResults, getMyLastCheck, type TopicResult } from "@/lib/grammarCheck";
import { getAccess } from "@/lib/access";
import Paywall from "@/components/Paywall";
import Lena from "@/components/training/Lena";

// Der Grammatik-Check. Bewusst OHNE Rueckmeldung waehrend des Tests: hier wird
// nicht geuebt, hier wird gemessen. Wer nach jeder Frage die Loesung sieht,
// beantwortet die naechste anders.

type Phase = "loading" | "blocked" | "intro" | "running" | "done";

export default function CheckPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [pos, setPos] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => CHECK_QUESTIONS.map(() => null));
  const [results, setResults] = useState<TopicResult[]>([]);
  const [previous, setPrevious] = useState<TopicResult[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const access = await getAccess();
      if (cancelled) return;
      if (access.tier !== "full") { setPhase("blocked"); return; }
      const last = await getMyLastCheck().catch(() => []);
      if (cancelled) return;
      setPrevious(last);
      setPhase("intro");
    })();
    return () => { cancelled = true; };
  }, []);

  const q = CHECK_QUESTIONS[pos];
  const total = CHECK_QUESTIONS.length;
  const answered = answers.filter((a) => a !== null).length;

  const pick = (i: number) => {
    setAnswers((prev) => { const next = [...prev]; next[pos] = i; return next; });
    // Kurze Pause, damit man die eigene Wahl noch sieht, dann weiter.
    setTimeout(() => {
      setPos((p) => {
        if (p + 1 < total) return p + 1;
        void finish();
        return p;
      });
    }, 180);
  };

  async function finish() {
    setAnswers((current) => {
      const summary = summarise(current);
      setResults(summary);
      setPhase("done");
      setSaving(true);
      void saveCheckResults(summary).then(({ error }) => {
        setSaving(false);
        setSaveError(error ?? null);
      });
      return current;
    });
  }

  // Tastatur: Ziffern waehlen aus.
  useEffect(() => {
    if (phase !== "running") return;
    const onKey = (e: KeyboardEvent) => {
      const i = ["1", "2", "3", "4"].indexOf(e.key);
      if (i >= 0 && q?.options[i]) { e.preventDefault(); pick(i); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, pos, q]); // eslint-disable-line react-hooks/exhaustive-deps

  const weak = useMemo(() => results.filter((r) => r.correct < r.total), [results]);
  const solid = useMemo(() => results.filter((r) => r.correct === r.total), [results]);

  if (phase === "loading") return <p className="text-sm text-cream-dim">Loading…</p>;
  if (phase === "blocked") return <Paywall title="Unlock the grammar check" />;

  // ── Startseite ──────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-start gap-4">
          <div className="shrink-0 hidden sm:block -mt-2"><Lena mood="explain" size={140} /></div>
          <div className="pt-1">
            <h1 className="text-2xl font-bold">Where do you stand?</h1>
            <p className="text-cream-dim text-sm mt-1">
              {total} questions, about {Math.round(total / 4.5)} minutes. No preparation needed.
            </p>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <p className="text-[17px] leading-8">
            This check does not give you a grade. It finds the <b>topics</b> that are not sitting yet — and
            sends you straight to the training unit for each one.
          </p>
          <ul className="text-sm text-cream-dim space-y-2">
            <li>· Three questions per topic, so one slip does not count as a weakness.</li>
            <li>· No feedback while you answer — that would change how you answer the next one.</li>
            <li>· Do not look anything up. A wrong answer here is worth more than a right one.</li>
          </ul>
          <div className="flex items-center gap-3 flex-wrap pt-1">
            <button onClick={() => { setPos(0); setAnswers(CHECK_QUESTIONS.map(() => null)); setPhase("running"); }}
              className="btn-gold px-6 py-3 font-bold">
              Start the check →
            </button>
            <Link href="/training" className="btn-outline px-6 py-3">Back to training</Link>
          </div>
        </div>

        {previous.length > 0 && (
          <div className="card p-5">
            <div className="text-sm font-bold mb-3">Your last check</div>
            <div className="space-y-2">
              {previous.slice(0, 5).map((r) => (
                <Link key={r.unit} href={`/training/${r.unit}`}
                  className="flex items-center gap-3 text-sm hover:text-cream transition">
                  <span className="text-xs font-bold px-2 py-0.5 rounded shrink-0"
                    style={{ background: "var(--bordeaux-deep)", color: "var(--cream-dim)" }}>{r.level}</span>
                  <span className="flex-1 min-w-0 truncate">{r.topic}</span>
                  <span className="shrink-0 font-semibold"
                    style={{ color: r.correct === r.total ? "var(--green-accent)" : "var(--red-accent)" }}>
                    {r.correct}/{r.total}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Der Test ────────────────────────────────────────────────────────────
  if (phase === "running" && q) {
    return (
      <div className="space-y-5 max-w-2xl">
        <div className="flex items-center justify-between text-sm">
          <Link href="/training" className="text-cream-dim hover:text-cream">← Leave</Link>
          <span className="text-cream-dim">{pos + 1} / {total}</span>
        </div>
        <div className="h-1.5 rounded-full bg-bordeaux-deep/60 overflow-hidden">
          <div className="h-1.5 rounded-full transition-all"
            style={{ width: `${(answered / total) * 100}%`, background: "var(--gold-bright)" }} />
        </div>

        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded"
              style={{ background: "var(--bordeaux-deep)", color: "var(--cream-dim)" }}>{q.level}</span>
            <span className="text-xs text-cream-dim">{q.topic}</span>
          </div>
          <p className="text-xl font-semibold leading-relaxed">{q.prompt}</p>
          <div className="grid gap-2.5">
            {q.options.map((opt, i) => {
              const picked = answers[pos] === i;
              return (
                <button key={i} onClick={() => pick(i)}
                  className="text-left rounded-xl px-4 py-3 font-semibold text-lg transition flex items-center gap-3"
                  style={{ background: picked ? "var(--gold)" : "var(--bordeaux-deep)", color: picked ? "#3b2116" : "var(--cream)" }}>
                  <span className="grid place-items-center w-6 h-6 rounded-md text-xs font-bold shrink-0"
                    style={{ background: "color-mix(in srgb, var(--cream) 14%, transparent)" }}>{i + 1}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-cream-dim">Keys 1–4 to choose · no feedback until the end</p>
        </div>
      </div>
    );
  }

  // ── Ergebnis ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card p-8 text-center space-y-4">
        <div className="flex justify-center">
          <Lena mood={weak.length === 0 ? "cheer" : "explain"} size={190} />
        </div>
        <h1 className="text-2xl font-bold">
          {weak.length === 0 ? "Everything sits 🎯" : `${weak.length} ${weak.length === 1 ? "topic needs" : "topics need"} work`}
        </h1>
        <p className="text-sm text-cream-dim max-w-md mx-auto">
          {weak.length === 0
            ? "Every topic in the check came back clean. Pick any unit you like — or push into the next level."
            : "Start at the top. That is where the most is missing, and the units below build on it."}
        </p>
        {saving && <p className="text-xs text-cream-dim">Saving your result…</p>}
        {saveError && (
          <p className="text-xs" style={{ color: "var(--red-accent)" }}>
            Your result could not be saved ({saveError}) — the list below is still correct.
          </p>
        )}
      </div>

      {weak.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-extrabold uppercase tracking-[0.16em]" style={{ color: "var(--bordeaux)" }}>
            Train these
          </div>
          {weak.map((r) => (
            <Link key={r.unit} href={`/training/${r.unit}`}
              className="card p-4 flex items-center gap-4 transition hover:border-gold/50"
              style={{ borderLeft: `5px solid ${r.correct === 0 ? "var(--red-accent)" : "var(--gold)"}` }}>
              <div className="shrink-0 text-center w-14">
                <div className="text-xl font-extrabold" style={{ color: r.correct === 0 ? "var(--red-accent)" : "var(--bordeaux)" }}>
                  {r.correct}/{r.total}
                </div>
                <div className="text-[10px] text-cream-dim mt-0.5">{r.level}</div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{r.topic}</div>
                <p className="text-xs text-cream-dim mt-0.5">
                  {r.correct === 0 ? "Nothing sat here — this is the place to start." : "Almost there — one round should fix it."}
                </p>
              </div>
              <span className="text-gold-bright shrink-0">→</span>
            </Link>
          ))}
        </div>
      )}

      {solid.length > 0 && (
        <div className="card p-5">
          <div className="text-sm font-bold mb-2">These sit ✓</div>
          <p className="text-sm text-cream-dim">{solid.map((r) => r.topic).join(" · ")}</p>
        </div>
      )}

      <div className="card p-5 flex items-center gap-4">
        <div className="text-2xl shrink-0">📚</div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-sm">Want your vocabulary level too?</div>
          <p className="text-xs text-cream-dim mt-0.5">A separate 40-word test that estimates your level from A1 to B2.</p>
        </div>
        <Link href="/exam" className="btn-outline px-4 py-2 text-sm shrink-0">Take it →</Link>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/training" className="btn-gold px-6 py-3 font-bold">Go to training</Link>
        <button onClick={() => { setPos(0); setAnswers(CHECK_QUESTIONS.map(() => null)); setPhase("intro"); }}
          className="btn-outline px-6 py-3">Run the check again</button>
      </div>
    </div>
  );
}
