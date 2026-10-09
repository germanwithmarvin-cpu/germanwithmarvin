"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  getPaperFull, startAttempt, saveAnswers, finishAttempt, checkExamItem,
  type ExamFull, type ExamItem, type ExamModule,
} from "@/lib/exams";
import { getAccess } from "@/lib/access";
import { isTrialAccess } from "@/lib/trialLimits";
import Paywall from "@/components/Paywall";

type Phase = "loading" | "blocked" | "upgrade" | "intro" | "running" | "result";
type WFeedback = {
  score: number; max: number; band: string; summary: string;
  criteria: { name: string; score: number; max: number; note: string }[];
  corrections: { original: string; better: string; why: string }[];
};
const MOD: Record<ExamModule, string> = { reading: "📖 Lesen (Reading)", listening: "🎧 Hören (Listening)", writing: "✍️ Schreiben (Writing)" };
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function ExamRunner({ paperId }: { paperId: string }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [full, setFull] = useState<ExamFull | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [writing, setWriting] = useState<Record<string, WFeedback>>({});
  const [grading, setGrading] = useState<string | null>(null);
  const [gradeMsg, setGradeMsg] = useState<Record<string, string>>({});
  const [left, setLeft] = useState(0);
  const [result, setResult] = useState<Record<ExamModule, [number, number]> | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Promise.all([getPaperFull(paperId), getAccess()]).then(([f, a]) => {
      if (!a || a.tier !== "full") { setPhase("blocked"); return; }
      if (!f || !f.paper.isPublished) { setPhase("blocked"); return; }
      if (isTrialAccess(a) && !f.paper.isSample) { setFull(f); setPhase("upgrade"); return; }
      setFull(f); setPhase("intro");
    });
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [paperId]);

  const totalMin = useMemo(() => full ? full.sections.reduce((s, x) => s + x.section.timeMinutes, 0) : 0, [full]);

  async function begin() {
    const id = await startAttempt(paperId);
    setAttemptId(id);
    setLeft(totalMin * 60);
    setPhase("running");
    timer.current = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000);
  }

  async function gradeWriting(item: ExamItem, level: string) {
    const text = (answers[item.id] ?? "").trim();
    if (text.length < 5) { setGradeMsg((m) => ({ ...m, [item.id]: "Bitte schreib zuerst deinen Text." })); return; }
    setGrading(item.id); setGradeMsg((m) => ({ ...m, [item.id]: "" }));
    try {
      const res = await fetch("/api/exam-grade", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, itemId: item.id, level, prompt: item.prompt, text, maxPoints: item.points }),
      });
      const data = await res.json();
      if (!res.ok) { setGradeMsg((m) => ({ ...m, [item.id]: data.message || "Fehler bei der Korrektur." })); }
      else {
        setWriting((w) => ({ ...w, [item.id]: data.feedback }));
        if (data.remaining != null) setGradeMsg((m) => ({ ...m, [item.id]: `✓ Korrigiert · noch ${data.remaining} heute` }));
      }
    } catch { setGradeMsg((m) => ({ ...m, [item.id]: "Netzwerkfehler. Bitte erneut." })); }
    setGrading(null);
  }

  async function finish() {
    if (timer.current) clearInterval(timer.current);
    const rows: { itemId: string; given: string; correct: boolean; points: number }[] = [];
    const score: Record<ExamModule, [number, number]> = { reading: [0, 0], listening: [0, 0], writing: [0, 0] };
    for (const { section, items } of full!.sections) {
      for (const it of items) {
        if (it.kind === "choice" || it.kind === "gap") {
          const given = answers[it.id] ?? "";
          const ok = checkExamItem(it, given);
          score[section.module][0] += ok ? it.points : 0;
          score[section.module][1] += it.points;
          rows.push({ itemId: it.id, given, correct: ok, points: ok ? it.points : 0 });
        } else if (it.kind === "writing") {
          score.writing[0] += writing[it.id]?.score ?? 0;
          score.writing[1] += it.points;
        }
      }
    }
    if (attemptId) {
      await saveAnswers(attemptId, rows);
      await finishAttempt(attemptId, {
        reading: score.reading[1] ? score.reading : undefined,
        listening: score.listening[1] ? score.listening : undefined,
        writing: score.writing[1] ? score.writing : undefined,
      });
    }
    setResult(score);
    setPhase("result");
  }

  if (phase === "loading") return <p className="text-sm text-cream-dim">Loading…</p>;
  if (phase === "blocked" || !full) return <Paywall title="Unlock the exam trainer" />;
  if (phase === "upgrade") return (
    <div className="card p-6 max-w-lg space-y-3">
      <div className="text-xl font-bold">This exam is part of the full plan 🔒</div>
      <p className="text-sm text-cream-dim">On the free trial you can take the sample exam. Unlock every level with a plan.</p>
      <div className="flex gap-2">
        <Link href="/pricing" className="btn-gold px-5 py-2.5">See plans →</Link>
        <Link href="/exams" className="btn-outline px-5 py-2.5">Back to exams</Link>
      </div>
    </div>
  );

  const p = full.paper;

  if (phase === "intro") return (
    <div className="card p-6 max-w-2xl space-y-4">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-gold-bright">Level {p.level} · exam</div>
        <h1 className="text-2xl font-bold mt-1">{p.title}</h1>
        <p className="text-cream-dim text-sm mt-1">{p.subtitle}</p>
      </div>
      <div className="space-y-2">
        {full.sections.map(({ section, items }) => (
          <div key={section.id} className="flex items-center justify-between rounded-lg bg-bordeaux-deep/30 px-4 py-2.5 text-sm">
            <span className="font-semibold">{MOD[section.module]}</span>
            <span className="text-cream-dim">{section.timeMinutes} min · {items.filter((i) => i.kind === "choice" || i.kind === "gap" || i.kind === "writing").length} Aufgaben</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-cream-dim">
        ⏱️ Suggested time: about {totalMin} minutes. The timer is a guide — it won’t cut you off.
        Reading &amp; Listening are graded instantly; Writing gets AI feedback.
      </p>
      <button onClick={begin} className="btn-gold w-full py-3 font-bold">Start the exam →</button>
    </div>
  );

  if (phase === "result" && result) {
    const tot: [number, number] = [result.reading[0] + result.listening[0] + result.writing[0], result.reading[1] + result.listening[1] + result.writing[1]];
    const pct = tot[1] ? Math.round((tot[0] / tot[1]) * 100) : 0;
    const passed = pct >= 60;
    const rowFor = (m: ExamModule) => result[m][1] > 0 && (
      <div className="flex items-center justify-between rounded-lg bg-bordeaux-deep/30 px-4 py-2.5">
        <span className="font-semibold">{MOD[m]}</span>
        <span className="text-cream-dim">{result[m][0]} / {result[m][1]} ({Math.round((result[m][0] / result[m][1]) * 100)}%)</span>
      </div>
    );
    return (
      <div className="space-y-5 max-w-2xl">
        <div className="card p-6 text-center space-y-2">
          <div className="text-4xl">{passed ? "🎉" : "💪"}</div>
          <div className="text-2xl font-bold">{tot[0]} / {tot[1]} points · {pct}%</div>
          <div className={`text-sm font-semibold ${passed ? "text-green-accent" : "text-cream-dim"}`}>
            {passed ? "Pass mark reached (≥ 60%). Strong work!" : "Below the 60% pass mark — keep training, you’ll get there."}
          </div>
        </div>
        <div className="space-y-2">{(["reading", "listening", "writing"] as ExamModule[]).map((m) => <div key={m}>{rowFor(m)}</div>)}</div>

        {/* Writing-Feedback zusammengefasst */}
        {full.sections.filter((s) => s.section.module === "writing").flatMap((s) => s.items).filter((it) => writing[it.id]).map((it) => {
          const fb = writing[it.id];
          return (
            <div key={it.id} className="card p-5 space-y-3">
              <div className="font-semibold">✍️ {it.prompt}</div>
              <div className="text-sm"><b className="text-gold-bright">{fb.band}</b> — {fb.score}/{fb.max} P.</div>
              <p className="text-sm text-cream-dim">{fb.summary}</p>
            </div>
          );
        })}

        <div className="card p-4 text-sm" style={{ borderLeft: "4px solid var(--bordeaux)" }}>
          <b className="text-cream">Ready for the Speaking part?</b> Practise it live in a{" "}
          <Link href="/booking" className="text-gold-bright underline underline-offset-2">1-on-1 lesson</Link>.
        </div>
        <div className="flex gap-2">
          <Link href="/exams" className="btn-gold px-5 py-2.5">Back to exams</Link>
        </div>
      </div>
    );
  }

  // --- running ---
  let qNum = 0;
  return (
    <div className="space-y-6 max-w-3xl pb-24">
      <div className="sticky top-0 z-20 -mx-4 px-4 py-2.5 bg-[color:var(--background)]/95 backdrop-blur border-b border-gold/15 flex items-center justify-between">
        <div className="font-semibold text-sm">{p.title}</div>
        <div className={`text-sm font-bold tabular-nums ${left <= 60 && left > 0 ? "text-red-700" : left === 0 ? "text-red-700" : "text-cream-dim"}`}>
          {left === 0 ? "⏱️ Time’s up" : `⏱️ ${fmt(left)}`}
        </div>
      </div>

      {full.sections.map(({ section, items }) => (
        <section key={section.id} className="space-y-4">
          <div>
            <h2 className="text-lg font-bold">{MOD[section.module]}</h2>
            {section.instructions && <p className="text-sm text-cream-dim mt-0.5">{section.instructions}</p>}
          </div>
          {items.map((it) => {
            if (it.kind === "passage") return (
              <div key={it.id} className="card p-4 text-[15px] leading-relaxed whitespace-pre-wrap">{it.body}</div>
            );
            if (it.kind === "audio") return (
              <div key={it.id} className="card p-4 space-y-2">
                {it.prompt && <div className="text-sm font-semibold">{it.prompt}</div>}
                {it.audioUrl ? (
                  <audio controls preload="none" src={it.audioUrl} className="w-full" />
                ) : (
                  <p className="text-sm text-cream-dim">🎧 Audio is being recorded — check back soon.</p>
                )}
              </div>
            );
            if (it.kind === "writing") {
              const fb = writing[it.id];
              const words = (answers[it.id] ?? "").trim().split(/\s+/).filter(Boolean).length;
              return (
                <div key={it.id} className="card p-4 space-y-3">
                  <div className="font-semibold">✍️ {it.prompt}</div>
                  {(it.minWords || it.maxWords) && <div className="text-xs text-cream-dim">Richtwert: {it.minWords ?? "?"}–{it.maxWords ?? "?"} Wörter · {it.points} Punkte</div>}
                  <textarea
                    value={answers[it.id] ?? ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, [it.id]: e.target.value }))}
                    rows={7} placeholder="Schreib deinen Text hier…"
                    className="w-full rounded-xl p-3 text-[15px] outline-none"
                    style={{ background: "var(--bordeaux-deep)", border: "2px solid color-mix(in srgb, var(--gold) 30%, transparent)" }}
                  />
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs text-cream-dim">{words} Wörter</span>
                    <button onClick={() => gradeWriting(it, p.level)} disabled={grading === it.id}
                      className="btn-gold px-4 py-2 text-sm disabled:opacity-50">
                      {grading === it.id ? "KI prüft…" : fb ? "Erneut prüfen" : "KI-Feedback holen"}
                    </button>
                  </div>
                  {gradeMsg[it.id] && <p className="text-xs text-cream-dim">{gradeMsg[it.id]}</p>}
                  {fb && (
                    <div className="rounded-xl bg-bordeaux-deep/40 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <b className="text-gold-bright">{fb.band}</b>
                        <span className="font-bold">{fb.score}/{fb.max} P.</span>
                      </div>
                      <p className="text-sm">{fb.summary}</p>
                      {fb.criteria?.length > 0 && (
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          {fb.criteria.map((c, i) => (
                            <div key={i} className="rounded-lg bg-black/10 px-2.5 py-1.5">
                              <span className="font-semibold">{c.name}</span> <span className="text-cream-dim">{c.score}/{c.max}</span>
                              <div className="text-cream-dim">{c.note}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {fb.corrections?.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-xs font-semibold uppercase tracking-wide text-cream-dim">Korrekturen</div>
                          {fb.corrections.map((c, i) => (
                            <div key={i} className="text-sm">
                              <span className="line-through text-red-700">{c.original}</span>{" → "}
                              <span className="text-green-accent font-semibold">{c.better}</span>
                              {c.why && <span className="text-cream-dim"> · {c.why}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }
            // choice / gap
            qNum += 1;
            const n = qNum;
            if (it.kind === "choice") return (
              <div key={it.id} className="space-y-2">
                <div className="font-semibold"><span className="text-cream-dim">{n}.</span> {it.prompt}</div>
                <div className="grid gap-2">
                  {it.options.map((opt, i) => {
                    const picked = answers[it.id] === String(i);
                    return (
                      <button key={i} onClick={() => setAnswers((a) => ({ ...a, [it.id]: String(i) }))}
                        className="text-left rounded-xl px-4 py-2.5 font-medium transition flex items-center gap-3"
                        style={{ background: picked ? "var(--gold)" : "var(--bordeaux-deep)", color: picked ? "#3b2116" : "var(--cream)" }}>
                        <span className="grid place-items-center w-6 h-6 rounded-md text-xs font-bold shrink-0" style={{ background: "color-mix(in srgb, var(--cream) 14%, transparent)" }}>{String.fromCharCode(97 + i)}</span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
            return (
              <div key={it.id} className="space-y-2">
                <div className="font-semibold"><span className="text-cream-dim">{n}.</span> {it.prompt}</div>
                <input value={answers[it.id] ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [it.id]: e.target.value }))}
                  placeholder="Deine Antwort…" className="w-full rounded-xl px-4 py-2.5 outline-none"
                  style={{ background: "var(--bordeaux-deep)", border: "2px solid color-mix(in srgb, var(--gold) 30%, transparent)" }} />
              </div>
            );
          })}
        </section>
      ))}

      <div className="sticky bottom-4">
        <button onClick={finish} className="btn-gold w-full py-3 font-bold shadow-lg">Finish &amp; see results →</button>
      </div>
    </div>
  );
}
