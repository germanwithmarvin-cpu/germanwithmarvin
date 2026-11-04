/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import LegalFooter from "@/components/LegalFooter";
import { REVIEWS, PREPLY_STATS } from "@/lib/reviews";

const BASE = "https://www.germanwithmarvin.com";
const title = "Free German Practice Exams A1–B2 (Goethe / telc style) — German with Marvin";
const description = "Take a full German mock exam online for free — Reading, Listening and Writing, A1 to B2. Reading & Listening graded instantly, no sign-up. Then unlock your writing correction and a study plan.";

export const metadata: Metadata = {
  title, description,
  alternates: { canonical: `${BASE}/free-exam` },
  openGraph: { title: "Free German practice exams A1–B2", description, url: `${BASE}/free-exam`, type: "website", images: [{ url: `${BASE}/ads/level-test-og.jpg`, width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Free German practice exams A1–B2", description },
};

const LEVELS: { lvl: string; blurb: string }[] = [
  { lvl: "A1", blurb: "Beginner — everyday words & simple sentences" },
  { lvl: "A2", blurb: "Elementary — familiar, routine situations" },
  { lvl: "B1", blurb: "Intermediate — travel, work & opinions" },
  { lvl: "B2", blurb: "Upper intermediate — abstract & detailed topics" },
];

const STEPS = [
  { n: "1", t: "Pick your level", d: "A1 to B2 — choose where you are (or take the 5-minute level test first)." },
  { n: "2", t: "Get your score instantly", d: "Reading & Listening are graded on the spot, completely free, no account." },
  { n: "3", t: "Unlock your writing", d: "Create a free account to get Marvin’s AI correction + a study plan for your level." },
];

const PICKS = REVIEWS.filter((r) => ["Ivan", "Sama", "Beatrice"].includes(r.name));

export default function FreeExamOverview() {
  return (
    <div className="bg-[#FFF1D2] text-[#3B2922] min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center">
          <img src="/logo-light.png" alt="Marvin Graf — German Simplified" className="h-16 md:h-[90px] w-auto object-contain" />
        </Link>
        <PublicNav ctaLabel="Start free" ctaHref="/register?src=free-exam" />
      </header>

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="max-w-3xl mx-auto px-6 pt-8 pb-10 text-center">
          <span className="inline-block text-xs tracking-[0.3em] text-[#E3A12F] uppercase font-semibold mb-3">Free practice exams</span>
          <h1 className="text-4xl md:text-5xl font-bold text-[#8A3030] leading-tight">Try a real German exam — free</h1>
          <p className="mt-4 text-lg text-[#3B2922]/80">
            Full mock exams in the Goethe / telc format: Reading, Listening and Writing. See your Reading &amp; Listening
            score instantly — <b>no sign-up needed</b>. Pick your level to start.
          </p>
          <div className="mt-4 text-sm text-[#3B2922]/70">
            ★★★★★ <b>{PREPLY_STATS.rating}</b> from {PREPLY_STATS.reviews} reviews · {PREPLY_STATS.lessons.toLocaleString()} lessons taught
          </div>
        </section>

        {/* Level cards */}
        <section className="max-w-3xl mx-auto px-6 grid sm:grid-cols-2 gap-4">
          {LEVELS.map(({ lvl, blurb }) => (
            <Link key={lvl} href={`/free-exam/${lvl.toLowerCase()}`}
              className="group rounded-2xl bg-white/70 border border-[#E3A12F]/30 p-6 hover:border-[#E3A12F] hover:bg-white transition">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-[#8A3030]">Level {lvl}</span>
                <span className="text-[#8A3030] opacity-0 group-hover:opacity-100 transition">→</span>
              </div>
              <p className="text-sm text-[#3B2922]/75 mt-1">{blurb}</p>
              <span className="inline-block mt-4 text-sm font-semibold text-[#E3A12F]">Start the free {lvl} exam →</span>
            </Link>
          ))}
        </section>

        {/* How it works */}
        <section className="max-w-4xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-6">
          {STEPS.map((s) => (
            <div key={s.n} className="text-center">
              <div className="mx-auto grid place-items-center w-11 h-11 rounded-full bg-[#8A3030] text-white font-bold">{s.n}</div>
              <div className="mt-3 font-semibold text-[#8A3030]">{s.t}</div>
              <p className="text-sm text-[#3B2922]/75 mt-1">{s.d}</p>
            </div>
          ))}
        </section>

        {/* Reviews */}
        <section className="max-w-4xl mx-auto px-6 pb-12">
          <div className="grid md:grid-cols-3 gap-4">
            {PICKS.map((r) => (
              <div key={r.name} className="rounded-2xl bg-white/70 border border-[#E3A12F]/25 p-5">
                <div className="text-[#E3A12F]">★★★★★</div>
                <p className="text-sm text-[#3B2922]/85 mt-2">“{r.text}”</p>
                <div className="text-xs text-[#3B2922]/60 mt-3">{r.name} · {r.date}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-3xl mx-auto px-6 pb-16 text-center">
          <div className="rounded-2xl bg-[#8A3030] text-white p-8 space-y-3">
            <h2 className="text-2xl font-bold">Not sure which level?</h2>
            <p className="text-white/85">Take the free 5-minute level test and we’ll point you to the right exam.</p>
            <Link href="/level-test" className="inline-block px-7 py-3.5 rounded-xl bg-[#E3A12F] text-[#3b2116] font-bold hover:brightness-105">Take the free level test →</Link>
          </div>
        </section>
      </main>

      <LegalFooter />
    </div>
  );
}
