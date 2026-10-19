"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import PublicNav from "@/components/PublicNav";
import LegalFooter from "@/components/LegalFooter";
import VideoPlayer from "@/components/VideoPlayer";
import { PREPLY_BADGES } from "@/lib/landing";
import { PLACEMENT_ITEMS } from "@/lib/placement";
import { SITE } from "@/lib/config";

// Öffentliche Werbe-Landingpage (für FB-Ads): kostenloser Einstufungstest OHNE
// Login → Niveau-Teaser sofort → volle Auswertung + Plan erst nach Anmeldung
// (Probeabo + Werbe-Opt-in über /register). Feuert ein Meta-"Lead"-Event, wenn
// der Test fertig ist, damit Facebook auf qualifizierte Leads optimieren kann.

const LEVELS = ["A1", "A2", "B1", "B2"] as const;
type Lv = (typeof LEVELS)[number];
const REG = "/register?src=level-test";

function fbq(event: string) {
  try { (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq?.("track", event); } catch { /* kein Pixel */ }
}
function shuffle<T>(a: T[]): T[] {
  const t = [...a];
  for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; }
  return t;
}

type Q = { level: Lv; prompt: string; options: string[]; correctIdx: number };

export default function LevelTest() {
  // 3 Fragen je Niveau (A1→B2), steigende Schwierigkeit. Optionen einmal mischen.
  const questions = useMemo<Q[]>(() => {
    const out: Q[] = [];
    for (const lv of LEVELS) {
      for (const it of PLACEMENT_ITEMS.filter((i) => i.level === lv).slice(0, 3)) {
        const options = shuffle([it.correct, ...it.distractors]);
        out.push({ level: lv, prompt: it.prompt, options, correctIdx: options.indexOf(it.correct) });
      }
    }
    return out;
  }, []);

  const [phase, setPhase] = useState<"intro" | "running" | "result">("intro");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));

  const answered = answers[idx] !== null && answers[idx] !== undefined;

  function start() {
    setPhase("running"); setIdx(0);
    document.getElementById("test")?.scrollIntoView({ behavior: "smooth" });
  }
  function pick(i: number) {
    setAnswers((a) => { const n = [...a]; n[idx] = i; return n; });
  }
  function next() {
    if (idx < questions.length - 1) setIdx(idx + 1);
    else { setPhase("result"); fbq("Lead"); document.getElementById("test")?.scrollIntoView({ behavior: "smooth" }); }
  }

  const result = useMemo(() => {
    const by: Record<Lv, number> = { A1: 0, A2: 0, B1: 0, B2: 0 };
    let total = 0;
    answers.forEach((a, i) => { if (a === questions[i].correctIdx) { by[questions[i].level]++; total++; } });
    let est: Lv = "A1";
    for (const lv of LEVELS) { if (by[lv] >= 2) est = lv; else break; }
    const starting = by.A1 < 2;
    return { by, total, est, starting };
  }, [answers, questions]);

  return (
    <div className="flex-1 flex flex-col bg-[#fff1d2] text-[#3B2922]">
      <header className="px-5 sm:px-8 py-4 max-w-6xl mx-auto w-full flex items-center justify-between gap-4">
        <Logo href="/" size={56} />
        <PublicNav ctaLabel="Start free" ctaHref={REG} />
      </header>

      {/* ---------- HERO ---------- */}
      <section className="px-5 sm:px-8 pt-6 pb-10 max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-block text-xs font-bold tracking-[0.14em] uppercase text-[#C77D14] bg-[#e3a12f]/15 rounded-full px-3 py-1.5">
            Free placement test · Goethe / telc style
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.08] tracking-tight mt-4">
            What&apos;s your <span className="text-[#8A3030]">German level?</span>
          </h1>
          <p className="text-lg text-[#3B2922]/75 mt-4 leading-relaxed">
            Take our free test — about <b>5 minutes</b>, <b>no sign-up to start</b>. Get your estimated level
            instantly, then unlock your full breakdown and a personalized study plan.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button onClick={start} className="rounded-xl bg-[#8A3030] text-white font-bold px-7 py-3.5 text-lg hover:brightness-110 transition">
              Start the free test →
            </button>
            <span className="text-sm text-[#3B2922]/55">12 quick questions · instant result</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {PREPLY_BADGES.map((b) => (
              <span key={b} className="text-xs font-semibold bg-white/70 border border-[#e3a12f]/40 rounded-full px-3 py-1.5">{b}</span>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="rounded-3xl bg-white border border-[#e3a12f]/40 shadow-xl p-6 sm:p-8">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/teachers/marvin.jpg" alt="Marvin Graf" className="w-16 h-16 rounded-full object-cover border-2 border-[#e3a12f]/50" />
              <div>
                <div className="font-bold">Marvin Graf</div>
                <div className="text-sm text-[#3B2922]/60">Your teacher · German A1–C1</div>
              </div>
            </div>
            <div className="mt-5 space-y-2.5 text-sm">
              {[
                "Find your level in 5 minutes",
                "Then train with real Goethe / telc mock exams",
                "Video lessons, 1,200+ exercises & flashcards",
                "Free 5-day trial — no credit card",
              ].map((t) => (
                <div key={t} className="flex items-start gap-2.5">
                  <span className="text-[#2e7d4f] font-bold mt-0.5">✓</span><span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- TEST ---------- */}
      <section id="test" className="px-5 sm:px-8 py-10 bg-white/50 border-y border-[#e3a12f]/25">
        <div className="max-w-2xl mx-auto">
          {phase === "intro" && (
            <div className="text-center">
              <h2 className="text-2xl font-bold">Ready? Pick the correct English meaning.</h2>
              <p className="text-[#3B2922]/65 mt-2">The questions get harder as you go. Just give your best guess.</p>
              <button onClick={start} className="rounded-xl bg-[#8A3030] text-white font-bold px-7 py-3.5 text-lg hover:brightness-110 transition mt-6">
                Start the free test →
              </button>
            </div>
          )}

          {phase === "running" && (
            <div>
              <div className="flex items-center justify-between text-sm text-[#3B2922]/60 mb-2">
                <span>Question {idx + 1} of {questions.length}</span>
                <span>{Math.round(((idx) / questions.length) * 100)}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#e3a12f]/20 mb-6">
                <div className="h-2 rounded-full bg-[#e3a12f] transition-all" style={{ width: `${(idx / questions.length) * 100}%` }} />
              </div>
              <div className="rounded-2xl bg-white border border-[#e3a12f]/40 shadow-sm p-6 sm:p-8">
                <div className="text-xs uppercase tracking-wide text-[#3B2922]/45">What does this mean?</div>
                <div className="text-3xl font-extrabold mt-1">{questions[idx].prompt}</div>
                <div className="grid gap-2.5 mt-6">
                  {questions[idx].options.map((opt, i) => {
                    const picked = answers[idx] === i;
                    return (
                      <button key={i} onClick={() => pick(i)}
                        className={`text-left rounded-xl px-4 py-3 font-medium border-2 transition ${
                          picked ? "bg-[#8A3030] text-white border-[#8A3030]" : "bg-[#fff8ea] border-[#e3a12f]/30 hover:border-[#8A3030]/50"
                        }`}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                <button onClick={next} disabled={!answered}
                  className="w-full mt-6 rounded-xl bg-[#8A3030] text-white font-bold py-3 disabled:opacity-40 hover:brightness-110 transition">
                  {idx < questions.length - 1 ? "Next →" : "See my level →"}
                </button>
              </div>
            </div>
          )}

          {phase === "result" && (
            <div className="text-center">
              <div className="text-sm font-bold uppercase tracking-wide text-[#C77D14]">Your estimated level</div>
              <div className="text-7xl font-extrabold text-[#8A3030] mt-2">{result.est}</div>
              <p className="text-[#3B2922]/70 mt-3 max-w-md mx-auto">
                {result.starting
                  ? "You're just getting started — the perfect time to build a solid foundation."
                  : `Nice! Based on your answers, you're around ${result.est}. You got ${result.total} of ${questions.length} right.`}
              </p>

              {/* Gated full result → register */}
              <div className="relative mt-8 text-left">
                <div className="rounded-2xl bg-white border border-[#e3a12f]/40 shadow-lg p-6 sm:p-8">
                  <div className="font-bold text-lg flex items-center gap-2">🔒 Your full result &amp; study plan</div>
                  <div className="mt-4 space-y-2.5 text-sm">
                    {[
                      "Your detailed breakdown across A1–B2",
                      "What you can already do — and your weak spots",
                      "A personalized plan to reach your target level",
                      "Real Goethe / telc mock exams at your level",
                    ].map((t) => (
                      <div key={t} className="flex items-start gap-2.5">
                        <span className="text-[#2e7d4f] font-bold mt-0.5">✓</span><span>{t}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={REG} className="block text-center rounded-xl bg-[#8A3030] text-white font-bold px-7 py-3.5 text-lg hover:brightness-110 transition mt-6">
                    Unlock it — start your free 5-day trial →
                  </Link>
                  <p className="text-center text-xs text-[#3B2922]/55 mt-3">No credit card. Cancel anytime.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ---------- WHY ---------- */}
      <section className="px-5 sm:px-8 py-14 max-w-5xl mx-auto w-full">
        <h2 className="text-3xl font-extrabold text-center">Then actually reach your level</h2>
        <p className="text-center text-[#3B2922]/65 mt-2 max-w-xl mx-auto">Everything you need to go from your result to passing your exam — in one place.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[
            { e: "📝", t: "Real mock exams", x: "Goethe / telc-style tests for A1–B2, with instant scoring." },
            { e: "✍️", t: "AI writing feedback", x: "Write freely and get corrected like in the real exam." },
            { e: "🎬", t: "Video lessons", x: "Short, clear lessons with notes and real examples." },
            { e: "🗂️", t: "Smart flashcards", x: "Spaced repetition with my own recorded pronunciation." },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl bg-white border border-[#e3a12f]/35 p-5">
              <div className="text-3xl">{c.e}</div>
              <div className="font-bold mt-2">{c.t}</div>
              <div className="text-sm text-[#3B2922]/65 mt-1">{c.x}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- TEACHER + VIDEO ---------- */}
      <section className="px-5 sm:px-8 pb-14 max-w-4xl mx-auto w-full">
        <div className="rounded-3xl bg-white border border-[#e3a12f]/40 shadow-sm overflow-hidden grid md:grid-cols-2">
          <div className="p-7 sm:p-9">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/teachers/marvin.jpg" alt="Marvin Graf" className="w-14 h-14 rounded-full object-cover border-2 border-[#e3a12f]/50" />
              <div>
                <div className="font-bold">Hi, I&apos;m Marvin 👋</div>
                <div className="text-sm text-[#3B2922]/60">Full-time German teacher · {PREPLY_BADGES[1]}</div>
              </div>
            </div>
            <p className="text-sm text-[#3B2922]/75 mt-4 leading-relaxed">
              I&apos;ve taught German full-time for 4+ years with thousands of 1-on-1 hours. I built this platform so you can
              find your level, train for your real exam, and actually feel ready — at your own pace.
            </p>
            <Link href={REG} className="inline-block rounded-xl bg-[#8A3030] text-white font-bold px-6 py-3 mt-5 hover:brightness-110 transition">
              Start your free trial →
            </Link>
            <div className="mt-3 text-xs text-[#3B2922]/55">
              <a href={SITE.preplyUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">Verified on Preply</a>
            </div>
          </div>
          <div className="p-4 sm:p-6 bg-[#fff8ea] flex items-center">
            <div className="w-full">
              <VideoPlayer videoId={SITE.introVideoId} title="German with Marvin — how it works" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="px-5 sm:px-8 pb-16 max-w-3xl mx-auto w-full text-center">
        <h2 className="text-3xl font-extrabold">Know your level. Then pass your exam.</h2>
        <p className="text-[#3B2922]/65 mt-2">Start free today — no credit card, cancel anytime.</p>
        <Link href={REG} className="inline-block rounded-xl bg-[#8A3030] text-white font-bold px-8 py-4 text-lg mt-6 hover:brightness-110 transition">
          Start your free 5-day trial →
        </Link>
      </section>

      <LegalFooter />
    </div>
  );
}
