"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { getFreePaperByLevel, checkExamItem, type ExamFull, type ExamModule } from "@/lib/exams";
import { getAttribution } from "@/lib/attribution";

// Öffentlicher Prüfungs-Runner OHNE Login (/free-exam/[level]). Lesen + Hören
// werden sofort lokal ausgewertet; der Schreibteil wird NICHT anonym per KI
// korrigiert, sondern ist der Umwandlungspunkt: „Gratis-Account anlegen →
// Schreibkorrektur + Lernplan". Helles Marketing-Theme (wie /level-test).

type Phase = "loading" | "coming" | "intro" | "running" | "result";
const MOD: Record<ExamModule, string> = { reading: "📖 Lesen (Reading)", listening: "🎧 Hören (Listening)", writing: "✍️ Schreiben (Writing)" };
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const REG = (level: string) => `/register?src=free-exam&level=${encodeURIComponent(level)}`;

function fbq(event: string) {
  try { (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq?.("track", event); } catch { /* kein Pixel */ }
}

export default function FreeExamRunner({ level }: { level: string }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [full, setFull] = useState<ExamFull | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [left, setLeft] = useState(0);
  const [result, setResult] = useState<Record<ExamModule, [number, number]> | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const wKey = `free-exam-writing-${level}`;

  useEffect(() => {
    getFreePaperByLevel(level).then((f) => {
      if (!f) { setPhase("coming"); return; }
      setFull(f); setPhase("intro");
    });
    // zuvor getippten Schreibtext wiederherstellen (localStorage, best effort)
    try {
      const saved = JSON.parse(localStorage.getItem(wKey) || "{}");
      if (saved && typeof saved === "object") setAnswers((a) => ({ ...saved, ...a }));
    } catch { /* egal */ }
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [level]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalMin = useMemo(() => full ? full.sections.reduce((s, x) => s + x.section.timeMinutes, 0) : 0, [full]);
  const writingItems = useMemo(
    () => full ? full.sections.filter((s) => s.section.module === "writing").flatMap((s) => s.items).filter((i) => i.kind === "writing") : [],
    [full],
  );

  function begin() {
    setLeft(totalMin * 60);
    setPhase("running");
    timer.current = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000);
    window.scrollTo({ top: 0 });
  }

  function saveWriting(itemId: string, text: string) {
    setAnswers((a) => {
      const next = { ...a, [itemId]: text };
      try {
        const w: Record<string, string> = {};
        for (const it of writingItems) if (next[it.id]) w[it.id] = next[it.id];
        localStorage.setItem(wKey, JSON.stringify(w));
      } catch { /* egal */ }
      return next;
    });
  }

  function finish() {
    if (timer.current) clearInterval(timer.current);
    const score: Record<ExamModule, [number, number]> = { reading: [0, 0], listening: [0, 0], writing: [0, 0] };
    for (const { section, items } of full!.sections) {
      for (const it of items) {
        if (it.kind === "choice" || it.kind === "gap") {
          const ok = checkExamItem(it, answers[it.id] ?? "");
          score[section.module][0] += ok ? it.points : 0;
          score[section.module][1] += it.points;
        } else if (it.kind === "writing") {
          score.writing[1] += it.points; // Schreiben wird erst im Account bewertet
        }
      }
    }
    setResult(score);
    setPhase("result");
    fbq("Lead");
    try {
      const a = getAttribution();
      fetch("/api/level-test-done", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, utm_source: a.utm_source, utm_medium: a.utm_medium, referrer: a.referrer }),
        keepalive: true,
      }).catch(() => {});
    } catch { /* Metrik best effort */ }
    window.scrollTo({ top: 0 });
  }

  // ---- Chrome ----
  const shell = (inner: ReactNode) => <div className="max-w-3xl mx-auto px-6 py-10">{inner}</div>;

  if (phase === "loading") return shell(<p className="text-[#8A3030]/70">Loading…</p>);

  if (phase === "coming") return shell(
    <div className="rounded-2xl bg-white/70 border border-[#E3A12F]/30 p-8 text-center space-y-3">
      <div className="text-4xl">🎧</div>
      <h1 className="text-2xl font-bold text-[#8A3030]">This {level} exam is coming very soon</h1>
      <p className="text-[#3B2922]/80">We&apos;re recording the listening parts right now. In the meantime, find your level in 5 minutes:</p>
      <Link href="/level-test" className="inline-block px-6 py-3 rounded-xl bg-[#8A3030] text-white font-semibold hover:brightness-110">Take the free level test →</Link>
    </div>,
  );

  const p = full!.paper;

  if (phase === "intro") return shell(
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <span className="inline-block text-xs tracking-[0.3em] text-[#E3A12F] uppercase font-semibold">Free {p.level} practice exam</span>
        <h1 className="text-3xl font-bold text-[#8A3030]">{p.title}</h1>
        {p.subtitle && <p className="text-[#3B2922]/80">{p.subtitle}</p>}
      </div>
      <div className="rounded-2xl bg-white/70 border border-[#E3A12F]/30 p-6 space-y-2">
        {full!.sections.map(({ section, items }) => (
          <div key={section.id} className="flex items-center justify-between rounded-xl bg-[#FFF8E6] px-4 py-2.5 text-sm">
            <span className="font-semibold text-[#8A3030]">{MOD[section.module]}</span>
            <span className="text-[#3B2922]/70">{section.timeMinutes} min · {items.filter((i) => ["choice", "gap", "writing"].includes(i.kind)).length} Aufgaben</span>
          </div>
        ))}
        <p className="text-xs text-[#3B2922]/70 pt-1">
          ⏱️ About {totalMin} minutes. The timer is just a guide. <b>Reading &amp; Listening are graded instantly</b> and free — no sign-up. Your <b>Writing</b> gets a correction from Marvin&apos;s AI when you create a free account.
        </p>
      </div>
      <button onClick={begin} className="w-full py-3.5 rounded-xl bg-[#8A3030] text-white font-bold text-lg hover:brightness-110">Start the exam →</button>
      <p className="text-center text-xs text-[#3B2922]/60">100% free · no account needed to get your Reading &amp; Listening score</p>
    </div>,
  );

  if (phase === "result" && result) {
    const auto: [number, number] = [result.reading[0] + result.listening[0], result.reading[1] + result.listening[1]];
    const pct = auto[1] ? Math.round((auto[0] / auto[1]) * 100) : 0;
    const passed = pct >= 60;
    const row = (m: ExamModule) => result[m][1] > 0 && (
      <div className="flex items-center justify-between rounded-xl bg-[#FFF8E6] px-4 py-2.5">
        <span className="font-semibold text-[#8A3030]">{MOD[m]}</span>
        <span className="text-[#3B2922]/70">{result[m][0]} / {result[m][1]} ({Math.round((result[m][0] / result[m][1]) * 100)}%)</span>
      </div>
    );
    const hasWriting = writingItems.length > 0;
    return shell(
      <div className="space-y-6">
        <div className="rounded-2xl bg-white/70 border border-[#E3A12F]/30 p-7 text-center space-y-2">
          <div className="text-4xl">{passed ? "🎉" : "💪"}</div>
          <div className="text-xs uppercase tracking-wide text-[#3B2922]/60">Your Reading &amp; Listening score</div>
          <div className="text-3xl font-bold text-[#8A3030]">{auto[0]} / {auto[1]} · {pct}%</div>
          <div className={`text-sm font-semibold ${passed ? "text-green-700" : "text-[#3B2922]/70"}`}>
            {passed ? "Above the 60% pass mark — strong work!" : "Below the 60% pass mark — keep training, you’ll get there."}
          </div>
        </div>
        <div className="space-y-2">{(["reading", "listening"] as ExamModule[]).map((m) => <div key={m}>{row(m)}</div>)}</div>

        {hasWriting && (
          <div className="rounded-2xl bg-[#8A3030] text-white p-7 space-y-3 text-center">
            <div className="text-2xl font-bold">✍️ Unlock your Writing correction</div>
            <p className="text-white/85 text-sm">
              Get your writing corrected by Marvin&apos;s AI: a band score, criteria feedback and line-by-line fixes, plus a study plan for {p.level}. Create your free account — no card needed.
            </p>
            <Link href={REG(p.level)} className="inline-block px-7 py-3.5 rounded-xl bg-[#E3A12F] text-[#3b2116] font-bold text-lg hover:brightness-105">
              Create free account &amp; get my correction →
            </Link>
            <p className="text-white/70 text-xs">Also unlocks the full exam trainer on the free trial.</p>
          </div>
        )}

        <div className="rounded-xl bg-white/70 border border-[#E3A12F]/30 p-4 text-sm text-[#3B2922]/85">
          <b className="text-[#8A3030]">Ready for the Speaking part?</b> Practise it live in a{" "}
          <Link href="/online-german-lessons" className="text-[#8A3030] underline underline-offset-2 font-semibold">1-on-1 lesson</Link>.
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/free-exam" className="px-5 py-2.5 rounded-xl border border-[#8A3030] text-[#8A3030] font-semibold hover:bg-[#8A3030]/5">Try another level</Link>
          <Link href="/level-test" className="px-5 py-2.5 rounded-xl border border-[#8A3030] text-[#8A3030] font-semibold hover:bg-[#8A3030]/5">Free level test</Link>
        </div>
      </div>,
    );
  }

  // ---- running ----
  let qNum = 0;
  return (
    <div className="max-w-3xl mx-auto px-6 pb-28">
      <div className="sticky top-0 z-20 -mx-6 px-6 py-2.5 bg-[#FFF1D2]/95 backdrop-blur border-b border-[#E3A12F]/30 flex items-center justify-between">
        <div className="font-semibold text-sm text-[#8A3030] truncate">{p.title}</div>
        <div className={`text-sm font-bold tabular-nums ${left === 0 ? "text-[#8A3030]" : "text-[#3B2922]/60"}`}>
          {left === 0 ? "⏱️ Time’s up" : `⏱️ ${fmt(left)}`}
        </div>
      </div>

      <div className="pt-6 space-y-7">
        {full!.sections.map(({ section, items }) => (
          <section key={section.id} className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[#8A3030]">{MOD[section.module]}</h2>
              {section.instructions && <p className="text-sm text-[#3B2922]/70 mt-0.5">{section.instructions}</p>}
            </div>
            {items.map((it) => {
              if (it.kind === "passage") return (
                <div key={it.id} className="rounded-xl bg-white/70 border border-[#E3A12F]/25 p-4 text-[15px] leading-relaxed whitespace-pre-wrap text-[#3B2922]">{it.body}</div>
              );
              if (it.kind === "audio") return (
                <div key={it.id} className="rounded-xl bg-white/70 border border-[#E3A12F]/25 p-4 space-y-2">
                  {it.prompt && <div className="text-sm font-semibold text-[#8A3030]">{it.prompt}</div>}
                  {it.audioUrl
                    ? <audio controls preload="none" src={it.audioUrl} className="w-full" />
                    : <p className="text-sm text-[#3B2922]/60">🎧 Audio is being recorded — check back soon.</p>}
                </div>
              );
              if (it.kind === "writing") {
                const words = (answers[it.id] ?? "").trim().split(/\s+/).filter(Boolean).length;
                return (
                  <div key={it.id} className="rounded-xl bg-white/70 border border-[#E3A12F]/25 p-4 space-y-3">
                    <div className="font-semibold text-[#8A3030]">✍️ {it.prompt}</div>
                    {(it.minWords || it.maxWords) && <div className="text-xs text-[#3B2922]/60">Richtwert: {it.minWords ?? "?"}–{it.maxWords ?? "?"} Wörter · {it.points} Punkte</div>}
                    <textarea
                      value={answers[it.id] ?? ""}
                      onChange={(e) => saveWriting(it.id, e.target.value)}
                      rows={7} placeholder="Schreib deinen Text hier…"
                      className="w-full rounded-xl p-3 text-[15px] outline-none bg-white border-2 border-[#E3A12F]/40 focus:border-[#E3A12F] text-[#3B2922]"
                    />
                    <div className="text-xs text-[#3B2922]/60">{words} Wörter · your correction unlocks with a free account after you finish</div>
                  </div>
                );
              }
              // choice / gap
              qNum += 1;
              const n = qNum;
              if (it.kind === "choice") return (
                <div key={it.id} className="space-y-2">
                  <div className="font-semibold text-[#3B2922]"><span className="text-[#3B2922]/50">{n}.</span> {it.prompt}</div>
                  <div className="grid gap-2">
                    {it.options.map((opt, i) => {
                      const picked = answers[it.id] === String(i);
                      return (
                        <button key={i} onClick={() => setAnswers((a) => ({ ...a, [it.id]: String(i) }))}
                          className="text-left rounded-xl px-4 py-2.5 font-medium transition flex items-center gap-3 border"
                          style={{ background: picked ? "#E3A12F" : "#fff", color: picked ? "#3b2116" : "#3B2922", borderColor: picked ? "#E3A12F" : "rgba(227,161,47,0.3)" }}>
                          <span className="grid place-items-center w-6 h-6 rounded-md text-xs font-bold shrink-0" style={{ background: picked ? "rgba(59,33,22,0.14)" : "#FFF1D2" }}>{String.fromCharCode(97 + i)}</span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
              return (
                <div key={it.id} className="space-y-2">
                  <div className="font-semibold text-[#3B2922]"><span className="text-[#3B2922]/50">{n}.</span> {it.prompt}</div>
                  <input value={answers[it.id] ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [it.id]: e.target.value }))}
                    placeholder="Deine Antwort…" className="w-full rounded-xl px-4 py-2.5 outline-none bg-white border-2 border-[#E3A12F]/40 focus:border-[#E3A12F] text-[#3B2922]" />
                </div>
              );
            })}
          </section>
        ))}
      </div>

      <div className="sticky bottom-4 mt-6">
        <button onClick={finish} className="w-full py-3.5 rounded-xl bg-[#8A3030] text-white font-bold shadow-lg hover:brightness-110">Finish &amp; see my score →</button>
      </div>
    </div>
  );
}
