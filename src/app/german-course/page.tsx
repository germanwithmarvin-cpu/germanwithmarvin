/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Metadata } from "next";
import VideoPlayer from "@/components/VideoPlayer";
import { SITE, priceLabel, TAX_NOTE } from "@/lib/config";
import { REVIEWS, PREPLY_STATS } from "@/lib/reviews";
import { SHOTS } from "@/lib/landing";

export const metadata: Metadata = {
  title: "Online German Course A1–B2 — structured & simple",
  description:
    "A structured online German course from A1 to B2: clear video lessons, a smart flashcard trainer, a vocab game and reading stories. One clear plan — start free for 5 days, no credit card.",
  alternates: { canonical: "https://www.germanwithmarvin.com/german-course" },
};

const included = [
  "A structured path of video lessons, A1 to B2",
  "Interactive exercises after every lesson",
  "A smart flashcard trainer — 2,600+ cards with real audio",
  "A fast vocab game & short reading stories",
  "Statistics & progress tracking, learn at your own pace",
];

const faqs = [
  { q: "What language is the course taught in?", a: "In English, with clear German examples throughout — no prior German needed." },
  { q: "Do I need a credit card for the free trial?", a: "No. The 5 days are completely free and need no credit card." },
  { q: "What happens after the 5 free days?", a: "Nothing is charged automatically. Your access simply pauses, and you choose whether to continue for $39/month — or not." },
  { q: "Which levels are included?", a: "Everything from A1 (complete beginner) to B2 (upper-intermediate): lessons, flashcards, exercises and stories for every level." },
  { q: "Which level should I start at?", a: "Start at A1 if you're new, or jump straight to your level. The in-app check (“Where you stand”) points you to the right starting point." },
  { q: "Do you add new content?", a: "Yes — I add new lessons, exercises and vocabulary regularly, and you get all updates while subscribed." },
  { q: "Can I cancel anytime?", a: "Yes, cancel anytime in a couple of clicks — no lock-in." },
];

function Stars() {
  return <span className="text-[#E3A12F] tracking-tight">★★★★★</span>;
}

export default function GermanCoursePage() {
  return (
    <div className="bg-[#FFF1D2] text-[#3B2922] min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center">
          <img src="/logo-light.png" alt="Marvin Graf — German Simplified" className="h-[104px] md:h-[125px] w-auto object-contain" />
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm rounded-lg border border-[#8A3030] text-[#8A3030] hover:bg-[#8A3030]/5 transition">Sign in</Link>
          <Link href="/register" className="px-4 py-2 text-sm rounded-lg bg-[#8A3030] text-white hover:brightness-110 transition">Start free</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-6 pb-14 grid lg:grid-cols-[1fr_1.1fr] gap-10 items-center">
        <div>
          <span className="inline-block text-xs tracking-[0.3em] text-[#E3A12F] uppercase font-semibold mb-4">Online German course</span>
          <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1]">
            A structured German course —<br /><span className="text-[#8A3030]">from A1 to B2.</span>
          </h1>
          <p className="mt-5 text-lg text-[#3B2922]/75 max-w-md">
            Stop collecting random German lessons. Follow <span className="font-semibold text-[#3B2922]">one clear plan</span> —
            video lessons, a smart flashcard trainer, a vocab game and reading stories. Learn at your own pace.
          </p>

          <Link href="/register" className="mt-8 inline-block rounded-xl bg-[#8A3030] text-white px-8 py-4 text-lg font-semibold hover:brightness-110 transition shadow-sm">
            Start your 5-day free trial
          </Link>
          <p className="mt-3 text-sm text-[#3B2922]/70">
            <span className="font-semibold text-[#3B2922]">5 days free · no credit card.</span> After that, choose whether to continue for {priceLabel()}/month.
          </p>

          <p className="mt-5 text-sm flex items-center gap-2 flex-wrap">
            <Stars /> <span className="font-bold">{PREPLY_STATS.rating}</span>
            <span className="text-[#3B2922]/60">· {PREPLY_STATS.reviews} reviews · more than {PREPLY_STATS.lessons.toLocaleString("en-US")} lessons taught</span>
          </p>
        </div>

        {/* Hero-Screenshot: Videovorschau einer Lektion */}
        <div className="bg-[#FBF2DA] rounded-2xl border border-black/5 shadow-lg overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-black/5" style={{ background: "rgba(0,0,0,0.03)" }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#E36B6B" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#E3A12F" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#5FA45F" }} />
          </div>
          <img src="/screens/video-lesson.jpg" alt="A German video lesson" className="w-full h-auto block" />
        </div>
      </section>

      {/* Zahlen-Band */}
      <section className="bg-[#F7DEAD]/70 border-y border-black/5">
        <div className="max-w-4xl mx-auto px-6 py-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center text-sm text-[#3B2922]/75">
          <span><b className="text-[#8A3030] text-base">40+</b> video lessons</span>
          <span><b className="text-[#8A3030] text-base">2,600+</b> flashcards</span>
          <span><b className="text-[#8A3030] text-base">60+</b> topics</span>
          <span><b className="text-[#8A3030] text-base">A1–B2</b> all levels</span>
        </div>
      </section>

      {/* Screenshots */}
      <section id="how" className="max-w-6xl mx-auto px-6 py-14 scroll-mt-8">
        <div className="text-center max-w-2xl mx-auto mb-9">
          <span className="inline-block text-xs tracking-[0.3em] text-[#E3A12F] uppercase font-semibold mb-3">A look inside</span>
          <h2 className="text-2xl sm:text-3xl font-bold">See exactly what you get</h2>
          <p className="mt-3 text-[#3B2922]/75">Real screens from the course — not stock photos.</p>
        </div>
        {/* Intro-Video (wie auf der Startseite) */}
        <div className="max-w-2xl mx-auto mb-10 rounded-2xl bg-[#FBF2DA] p-3 shadow-lg border border-black/5">
          <VideoPlayer videoId={SITE.introVideoId} title="German Simplified — Marvin Graf" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {SHOTS.filter((s) => s.src !== "/screens/video-lesson.jpg").map((s) => (
            <figure key={s.src} className="bg-[#FBF2DA] rounded-2xl border border-black/5 shadow-sm overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-black/5" style={{ background: "rgba(0,0,0,0.03)" }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#E36B6B" }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#E3A12F" }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#5FA45F" }} />
              </div>
              <img src={s.src} alt={s.alt} loading="lazy" className="w-full h-auto block" />
              <figcaption className="px-5 py-4 text-sm">
                <span className="font-bold">{s.title}</span>{" "}
                <span className="text-[#3B2922]/70">{s.text}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="text-center mt-9">
          <Link href="/register" className="inline-block rounded-xl bg-[#8A3030] text-white px-8 py-4 text-lg font-semibold hover:brightness-110 transition shadow-sm">
            Start your 5-day free trial
          </Link>
          <p className="mt-2 text-sm text-[#3B2922]/60">No credit card · full access.</p>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="bg-[#F7DEAD] scroll-mt-8">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">Students love learning with me</h2>
            <p className="mt-2 text-sm"><Stars /> <span className="font-bold">{PREPLY_STATS.rating}</span> <span className="text-[#3B2922]/60">· {PREPLY_STATS.reviews} reviews</span></p>
          </div>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
            {REVIEWS.slice(0, 9).map((r, i) => (
              <div key={i} className="bg-[#FBF2DA] rounded-2xl p-5 mb-4 break-inside-avoid shadow-sm border border-black/5">
                <Stars />
                <p className="mt-2 text-sm text-[#3B2922]/90 italic">“{r.text}”</p>
                <p className="mt-3 text-xs font-semibold">{r.name} <span className="text-[#3B2922]/50 font-normal">· {r.date}</span></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-14 scroll-mt-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Frequently asked questions</h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="bg-[#FBF2DA] rounded-xl border border-black/5 p-5 group">
              <summary className="font-semibold cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-center justify-between gap-4">
                {f.q}
                <span className="text-[#8A3030] text-xl leading-none group-open:rotate-45 transition shrink-0">+</span>
              </summary>
              <p className="mt-2 text-sm text-[#3B2922]/75">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Preis / Abschluss-CTA */}
      <section id="pricing" className="max-w-2xl mx-auto px-6 py-16 scroll-mt-8">
        <div className="bg-[#FBF2DA] rounded-2xl p-8 sm:p-10 text-center shadow-md border border-[#E3A12F]/40">
          <h2 className="text-2xl font-bold">Try the whole course — free for 5 days</h2>
          <div className="mt-3">
            <span className="text-5xl font-bold text-[#8A3030]">5 days free</span>
            <div className="text-sm text-[#3B2922]/70 mt-1">After that, choose whether to continue for {priceLabel()}/month · {TAX_NOTE}</div>
          </div>
          <ul className="text-sm text-[#3B2922]/75 space-y-2 my-7 inline-block text-left">
            {included.map((f) => <li key={f}>✓ {f}</li>)}
          </ul>
          <Link href="/register" className="block rounded-xl bg-[#8A3030] text-white px-8 py-4 text-lg font-semibold hover:brightness-110 transition">
            Start your 5-day free trial
          </Link>
          <p className="text-sm text-[#3B2922]/60 mt-3">No credit card needed · cancel anytime.</p>
          <p className="text-xs text-[#3B2922]/55 mt-4">
            Prefer a real teacher?{" "}
            <Link href="/online-german-lessons" className="text-[#8A3030] underline underline-offset-4 font-semibold">See our 1-on-1 lessons →</Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F7DEAD] border-t border-black/5 py-8 text-center text-sm text-[#3B2922]/70">
        <div>© {new Date().getFullYear()} German with Marvin LLC · German Simplified</div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <a href={`mailto:${SITE.contactEmail}`} className="hover:text-[#3B2922] underline underline-offset-4">Contact · Kontakt</a>
          <Link href="/impressum" className="hover:text-[#3B2922] underline underline-offset-4">Legal Notice · Impressum</Link>
          <Link href="/datenschutz" className="hover:text-[#3B2922] underline underline-offset-4">Privacy · Datenschutz</Link>
          <Link href="/agb" className="hover:text-[#3B2922] underline underline-offset-4">Terms · AGB</Link>
        </div>
      </footer>
    </div>
  );
}
