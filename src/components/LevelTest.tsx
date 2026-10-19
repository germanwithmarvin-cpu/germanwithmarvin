"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import PublicNav from "@/components/PublicNav";
import LegalFooter from "@/components/LegalFooter";
import VideoPlayer from "@/components/VideoPlayer";
import { PREPLY_BADGES } from "@/lib/landing";
import { PLACEMENT_ITEMS } from "@/lib/placement";
import { REVIEWS, PREPLY_STATS } from "@/lib/reviews";
import { getPlacement, type PItem, type PSection, type Lv } from "@/lib/placementTest";
import { SITE } from "@/lib/config";

// Öffentliche Werbe-Landingpage (FB-Ads): mehrteiliger Gratis-Einstufungstest
// OHNE Login (Vokabeln / Grammatik / Lesen / Hören) → Niveau-Teaser sofort →
// volle Auswertung + Plan erst nach Anmeldung (/register, Probeabo + Werbe-Opt-in).
// Inhalte aus der DB (placement_questions); Fallback = Vokabeltest, bis geseedet.

const REG = "/register?src=level-test";
const LEVELS: Lv[] = ["A1", "A2", "B1", "B2"];

function fbq(event: string) {
  try { (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq?.("track", event); } catch { /* kein Pixel */ }
}
function shuffle<T>(a: T[]): T[] {
  const t = [...a];
  for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; }
  return t;
}

const PICKED_REVIEWS = ["Ivan", "Erin", "Sama", "Beatrice", "Karolina", "Veronika"]
  .map((n) => REVIEWS.find((r) => r.name === n))
  .filter((r): r is (typeof REVIEWS)[number] => Boolean(r));

type RQ = { id: string; level: Lv; prompt: string; options: string[]; correct: number };
type RStim = { kind: "passage" | "audio"; body: string; prompt: string; audioUrl: string | null };
type RGroup = { stimulus: RStim | null; questions: RQ[] };
type RSection = { section: PSection; label: string; instruction: string; groups: RGroup[] };

const SECMETA: Record<PSection, { label: string; instruction: string }> = {
  vocab: { label: "🔤 Vocabulary", instruction: "Choose the correct meaning." },
  grammar: { label: "🧩 Grammar", instruction: "Pick the word that fits the gap." },
  reading: { label: "📖 Reading", instruction: "Read the text, then answer." },
  listening: { label: "🎧 Listening", instruction: "Listen, then answer. You can replay." },
};

// Fallback-Test (nur Vokabeln), falls die DB noch nicht geseedet ist.
function fallbackSections(): RSection[] {
  const qs: RQ[] = [];
  for (const lv of LEVELS) {
    for (const it of PLACEMENT_ITEMS.filter((i) => i.level === lv).slice(0, 3)) {
      const options = shuffle([it.correct, ...it.distractors]);
      qs.push({ id: `fb-${qs.length}`, level: lv as Lv, prompt: it.prompt, options, correct: options.indexOf(it.correct) });
    }
  }
  return [{ section: "vocab", ...SECMETA.vocab, groups: [{ stimulus: null, questions: qs }] }];
}

function buildSections(items: PItem[]): RSection[] {
  const order: PSection[] = ["vocab", "grammar", "reading", "listening"];
  const out: RSection[] = [];
  for (const sec of order) {
    const si = items.filter((i) => i.section === sec);
    if (si.length === 0) continue;
    if (sec === "listening") {
      const audios = si.filter((i) => i.kind === "audio");
      if (audios.length === 0 || audios.some((a) => !a.audioUrl)) continue; // erst wenn eingesprochen
    }
    const toRQ = (i: PItem): RQ => ({ id: i.id, level: i.level, prompt: i.prompt, options: i.options, correct: i.correct });
    if (sec === "vocab" || sec === "grammar") {
      out.push({ section: sec, ...SECMETA[sec], groups: [{ stimulus: null, questions: si.filter((i) => i.kind === "choice").map(toRQ) }] });
    } else {
      const grps = [...new Set(si.map((i) => i.grp))].sort((a, b) => a - b);
      const groups: RGroup[] = grps.map((g) => {
        const gi = si.filter((i) => i.grp === g);
        const stim = gi.find((i) => i.kind !== "choice");
        return {
          stimulus: stim ? { kind: stim.kind as "passage" | "audio", body: stim.body, prompt: stim.prompt, audioUrl: stim.audioUrl } : null,
          questions: gi.filter((i) => i.kind === "choice").map(toRQ),
        };
      });
      out.push({ section: sec, ...SECMETA[sec], groups });
    }
  }
  return out.filter((s) => s.groups.some((g) => g.questions.length > 0));
}

export default function LevelTest() {
  const [items, setItems] = useState<PItem[] | null>(null);
  const [phase, setPhase] = useState<"intro" | "running" | "result">("intro");
  const [secIdx, setSecIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  useEffect(() => { getPlacement().then(setItems).catch(() => setItems([])); }, []);

  const sections = useMemo<RSection[]>(() => {
    if (items === null) return [];
    const built = buildSections(items);
    const totalChoice = built.reduce((n, s) => n + s.groups.reduce((m, g) => m + g.questions.length, 0), 0);
    return totalChoice >= 6 ? built : fallbackSections();
  }, [items]);

  const allQ = useMemo(() => sections.flatMap((s) => s.groups.flatMap((g) => g.questions)), [sections]);
  const answeredCount = allQ.filter((q) => answers[q.id] !== undefined).length;

  const result = useMemo(() => {
    const by: Record<Lv, { c: number; n: number }> = { A1: { c: 0, n: 0 }, A2: { c: 0, n: 0 }, B1: { c: 0, n: 0 }, B2: { c: 0, n: 0 } };
    let correct = 0;
    for (const q of allQ) { by[q.level].n++; if (answers[q.id] === q.correct) { by[q.level].c++; correct++; } }
    let level: Lv = "A1";
    for (const lv of LEVELS) { const b = by[lv]; if (b.n > 0 && b.c / b.n >= 0.5) level = lv; else if (b.n > 0) break; }
    return { level, correct, total: allQ.length, by, starting: by.A1.n > 0 && by.A1.c / by.A1.n < 0.5 };
  }, [allQ, answers]);

  const skills = sections.map((s) => s.section);
  const multi = skills.length > 1;

  function start() { setPhase("running"); setSecIdx(0); document.getElementById("test")?.scrollIntoView({ behavior: "smooth" }); }
  function pick(id: string, i: number) { setAnswers((a) => ({ ...a, [id]: i })); }
  function next() {
    if (secIdx < sections.length - 1) { setSecIdx(secIdx + 1); document.getElementById("test")?.scrollIntoView({ behavior: "smooth" }); }
    else { setPhase("result"); fbq("Lead"); document.getElementById("test")?.scrollIntoView({ behavior: "smooth" }); }
  }

  const estMinutes = multi ? 10 : 5;
  const heroSub = multi
    ? "A real placement test — vocabulary, grammar, reading & listening."
    : "A quick vocabulary check to estimate your level.";

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
            Take our free test — about <b>{estMinutes} minutes</b>, <b>no sign-up to start</b>. {heroSub} Get your
            estimated level instantly, then unlock your full breakdown and a personalized study plan.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button onClick={start} className="rounded-xl bg-[#8A3030] text-white font-bold px-7 py-3.5 text-lg hover:brightness-110 transition">
              Start the free test →
            </button>
            <span className="text-sm text-[#3B2922]/55">instant result · no card</span>
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
                multi ? "Tests vocabulary, grammar, reading & listening" : "Find your level in minutes",
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
              <h2 className="text-2xl font-bold">
                {multi ? "A quick test across 4 skills" : "Ready? Pick the correct meaning."}
              </h2>
              <p className="text-[#3B2922]/65 mt-2">
                {multi
                  ? "Vocabulary, grammar, reading and listening — it gets harder as you go. Just give your best guess."
                  : "The questions get harder as you go. Just give your best guess."}
              </p>
              {items === null ? (
                <p className="text-[#3B2922]/50 mt-6">Loading…</p>
              ) : (
                <button onClick={start} className="rounded-xl bg-[#8A3030] text-white font-bold px-7 py-3.5 text-lg hover:brightness-110 transition mt-6">
                  Start the free test →
                </button>
              )}
            </div>
          )}

          {phase === "running" && sections[secIdx] && (() => {
            const sec = sections[secIdx];
            let qn = 0;
            return (
              <div>
                <div className="flex items-center justify-between text-sm text-[#3B2922]/60 mb-2">
                  <span className="font-semibold">{sec.label}</span>
                  <span>Part {secIdx + 1} of {sections.length}</span>
                </div>
                <div className="h-2 rounded-full bg-[#e3a12f]/20 mb-5">
                  <div className="h-2 rounded-full bg-[#e3a12f] transition-all" style={{ width: `${allQ.length ? (answeredCount / allQ.length) * 100 : 0}%` }} />
                </div>
                <p className="text-sm text-[#3B2922]/60 mb-5">{sec.instruction}</p>

                <div className="space-y-6">
                  {sec.groups.map((g, gi) => (
                    <div key={gi} className="space-y-4">
                      {g.stimulus?.kind === "passage" && (
                        <div className="rounded-2xl bg-white border border-[#e3a12f]/40 p-5 text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm">{g.stimulus.body}</div>
                      )}
                      {g.stimulus?.kind === "audio" && (
                        <div className="rounded-2xl bg-white border border-[#e3a12f]/40 p-5 shadow-sm">
                          {g.stimulus.prompt && <div className="text-sm font-semibold mb-2">{g.stimulus.prompt}</div>}
                          {g.stimulus.audioUrl && <audio controls preload="none" src={g.stimulus.audioUrl} className="w-full" />}
                        </div>
                      )}
                      {g.questions.map((q) => {
                        qn += 1;
                        const isVocab = sec.section === "vocab";
                        return (
                          <div key={q.id} className="rounded-2xl bg-white border border-[#e3a12f]/35 p-5 shadow-sm">
                            {isVocab
                              ? <><div className="text-xs uppercase tracking-wide text-[#3B2922]/45">What does this mean?</div><div className="text-2xl font-extrabold mt-1">{q.prompt}</div></>
                              : <div className="font-semibold"><span className="text-[#3B2922]/45">{qn}.</span> {q.prompt}</div>}
                            <div className="grid gap-2 mt-4">
                              {q.options.map((opt, i) => {
                                const picked = answers[q.id] === i;
                                return (
                                  <button key={i} onClick={() => pick(q.id, i)}
                                    className={`text-left rounded-xl px-4 py-2.5 font-medium border-2 transition ${
                                      picked ? "bg-[#8A3030] text-white border-[#8A3030]" : "bg-[#fff8ea] border-[#e3a12f]/30 hover:border-[#8A3030]/50"
                                    }`}>
                                    <span className="inline-grid place-items-center w-6 h-6 rounded-md text-xs font-bold mr-2" style={{ background: picked ? "rgba(255,255,255,.2)" : "rgba(227,161,47,.18)" }}>{String.fromCharCode(97 + i)}</span>
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <button onClick={next} className="w-full mt-6 rounded-xl bg-[#8A3030] text-white font-bold py-3 hover:brightness-110 transition">
                  {secIdx < sections.length - 1 ? "Next part →" : "See my level →"}
                </button>
              </div>
            );
          })()}

          {phase === "result" && (
            <div className="text-center">
              <div className="text-sm font-bold uppercase tracking-wide text-[#C77D14]">Your estimated level</div>
              <div className="text-7xl font-extrabold text-[#8A3030] mt-2">{result.level}</div>
              <p className="text-[#3B2922]/70 mt-3 max-w-md mx-auto">
                {result.starting
                  ? "You're just getting started — the perfect time to build a solid foundation."
                  : `Nice work! Based on vocabulary, grammar${skills.includes("reading") ? ", reading" : ""}${skills.includes("listening") ? " and listening" : ""}, you're around ${result.level}. You got ${result.correct} of ${result.total} right.`}
              </p>

              <div className="relative mt-8 text-left">
                <div className="rounded-2xl bg-white border border-[#e3a12f]/40 shadow-lg p-6 sm:p-8">
                  <div className="font-bold text-lg flex items-center gap-2">🔒 Your full result &amp; study plan</div>
                  <div className="mt-4 space-y-2.5 text-sm">
                    {[
                      "Your detailed breakdown by skill (vocab, grammar, reading, listening)",
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

      {/* ---------- REVIEWS ---------- */}
      <section className="px-5 sm:px-8 pb-14 max-w-5xl mx-auto w-full">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold">What my students say</h2>
          <p className="mt-2 text-[#3B2922]/70">
            <span className="text-[#e3a12f]">★★★★★</span>{" "}
            <b className="text-[#3B2922]">{PREPLY_STATS.rating}</b> · {PREPLY_STATS.reviews} reviews ·{" "}
            {PREPLY_STATS.lessons.toLocaleString("en-US")}+ lessons taught ·{" "}
            <a href={SITE.preplyUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-[#8A3030]">verified on Preply</a>
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {PICKED_REVIEWS.map((r, i) => (
            <div key={i} className="rounded-2xl bg-white border border-[#e3a12f]/35 p-5 shadow-sm">
              <div className="text-[#e3a12f]">★★★★★</div>
              <p className="mt-2 text-sm text-[#3B2922]/85 leading-relaxed">“{r.text}”</p>
              <p className="mt-3 text-xs text-[#3B2922]/55 font-semibold">— {r.name}, {r.date}</p>
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
