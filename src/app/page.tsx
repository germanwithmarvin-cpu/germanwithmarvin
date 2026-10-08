/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import VideoPlayer from "@/components/VideoPlayer";
import PublicNav from "@/components/PublicNav";
import { SITE, priceLabel, APP_YEARLY_PER_MONTH, TAX_NOTE } from "@/lib/config";
import { REVIEWS, PREPLY_STATS } from "@/lib/reviews";
import { SHOTS, TEACHERS } from "@/lib/landing";

// Wen die Seite anspricht — Positionierung über die Zielgruppe, nicht Features.
const AUDIENCES = [
  { icon: "🛫", title: "Moving to Germany", text: "For an Ausbildung, a job or the Chancenkarte — build the German your visa and your new life ask for.", level: "You'll need A1–B1" },
  { icon: "🗣️", title: "Living here, stuck at A2", text: "You get by, but you want to really speak — break through to confident, everyday German.", level: "Push to B1–B2" },
  { icon: "🎓", title: "Preparing for an exam", text: "Goethe or telc coming up? Learn in the exam's format and walk in ready.", level: "A1–B2, exam-ready" },
];

// Typische Deutsch-Niveaus je Aufenthaltszweck (Quelle: Make it in Germany).
const VISA_LEVELS = [
  { purpose: "Opportunity Card (Chancenkarte)", level: "German A1 — or English B2" },
  { purpose: "Recognition of your qualification", level: "often A2" },
  { purpose: "Vocational training visa (Ausbildung)", level: "B1" },
  { purpose: "University place search", level: "usually B2" },
  { purpose: "Nursing profession licence", level: "B2" },
];

const STEPS = [
  { n: "1", title: "See where you stand", text: "Take a short placement test — no guessing where to begin." },
  { n: "2", title: "Follow your daily plan", text: "About 20 minutes a day: a video lesson, practice and flashcards — in the right order." },
  { n: "3", title: "Speak in the live session", text: "Join the weekly group call to ask questions and practice out loud.", soon: true },
];

const included = [
  "All video lessons (A1–B2)",
  "Interactive exercises after every lesson",
  "Smart flashcard trainer — 2,600+ cards",
  "The vocab game & reading stories",
  "Statistics & progress tracking",
];

function Stars() {
  return <span className="text-[#E3A12F] tracking-tight">★★★★★</span>;
}

export default function Home() {
  return (
    <div className="bg-[#FFF1D2] text-[#3B2922] min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center">
          <img src="/logo-light.png" alt="Marvin Graf — German Simplified" className="h-[104px] md:h-[125px] w-auto object-contain" />
        </Link>
        <PublicNav />
      </header>

      {/* Hero — Positionierung: Ergebnis & Zielgruppe */}
      <section className="max-w-6xl mx-auto px-6 pt-6 pb-14 grid lg:grid-cols-[1fr_1.25fr] gap-10 items-center">
        <div>
          <span className="inline-block text-xs tracking-[0.3em] text-[#E3A12F] uppercase font-semibold mb-4">German with Marvin</span>
          <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1]">
            German for your life<br /><span className="text-[#8A3030]">in Germany.</span>
          </h1>
          <p className="mt-5 text-lg text-[#3B2922]/80 max-w-md">
            From zero to B2, with a real teacher. The structured course that’s taken students from A1 to their
            B2 certificate — video lessons, flashcards in my own voice, stories and exam practice.
          </p>
          <p className="mt-3 text-[#3B2922]/70 max-w-md">
            Self-paced from <span className="font-semibold text-[#3B2922]">${APP_YEARLY_PER_MONTH}/month</span>.
            Add 1-on-1 lessons whenever you need them.
          </p>

          <Link href="/register" className="mt-7 inline-block rounded-xl bg-[#8A3030] text-white px-8 py-4 text-lg font-semibold hover:brightness-110 transition shadow-sm">
            Start your 5-day free trial
          </Link>
          <p className="mt-3 text-sm text-[#3B2922]/70">
            <span className="font-semibold text-[#3B2922]">Free for 5 days · no credit card.</span> Cancel anytime.
          </p>

          <p className="mt-5 text-sm flex items-center gap-2 flex-wrap">
            <Stars /> <span className="font-bold">{PREPLY_STATS.rating}</span>
            <a href={SITE.preplyUrl} target="_blank" rel="noreferrer" className="text-[#3B2922]/60 underline underline-offset-2 hover:text-[#8A3030]">
              on Preply
            </a>
            <span className="text-[#3B2922]/60">· {PREPLY_STATS.lessons.toLocaleString("en-US")}+ lessons taught</span>
          </p>
        </div>

        {/* Video + schwebende Badges */}
        <div className="relative">
          <div className="rounded-2xl bg-[#FBF2DA] p-3 shadow-lg border border-black/5">
            <VideoPlayer videoId={SITE.introVideoId} title="German with Marvin — how it works" />
            <p className="text-center text-xs text-[#3B2922]/55 py-2">Watch how it works · 2 min</p>
          </div>
          <div className="absolute -right-2 top-6 bg-[#FBF2DA] rounded-xl shadow-md border border-black/5 px-4 py-3 flex items-center gap-2">
            <span className="text-xl">📊</span>
            <div className="leading-tight"><div className="font-bold text-sm">A1–B2</div><div className="text-xs text-[#3B2922]/60">All levels</div></div>
          </div>
          <div className="absolute -right-2 top-28 bg-[#FBF2DA] rounded-xl shadow-md border border-black/5 px-4 py-3 flex items-center gap-2">
            <span className="text-xl">🗂️</span>
            <div className="leading-tight"><div className="font-bold text-sm">2,600+</div><div className="text-xs text-[#3B2922]/60">cards</div></div>
          </div>
          <div className="absolute -left-2 bottom-12 bg-[#FBF2DA] rounded-xl shadow-md border border-black/5 px-4 py-3 flex items-center gap-2">
            <span className="text-xl">👩‍🏫</span>
            <div className="leading-tight"><div className="font-bold text-sm">1-on-1</div><div className="text-xs text-[#3B2922]/60">from $30/lesson</div></div>
          </div>
        </div>
      </section>

      {/* Für wen */}
      <section className="bg-[#F7DEAD]">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="text-center max-w-2xl mx-auto mb-9">
            <span className="inline-block text-xs tracking-[0.3em] text-[#E3A12F] uppercase font-semibold mb-3">Who it’s for</span>
            <h2 className="text-2xl sm:text-3xl font-bold">Built for people who need German for Germany</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {AUDIENCES.map((a) => (
              <div key={a.title} className="bg-[#FBF2DA] rounded-2xl p-6 shadow-sm border border-black/5 flex flex-col">
                <div className="text-3xl mb-3">{a.icon}</div>
                <h3 className="text-lg font-bold">{a.title}</h3>
                <p className="mt-2 text-sm text-[#3B2922]/75 flex-1">{a.text}</p>
                <p className="mt-4 text-sm font-semibold text-[#8A3030]">{a.level}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Warum Niveaus zählen */}
      <section className="max-w-3xl mx-auto px-6 py-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Every level is a door</h2>
          <p className="mt-3 text-[#3B2922]/75">
            In Germany, your plans often depend on your German level. This course walks you through all of them.
          </p>
        </div>
        <div className="bg-[#FBF2DA] rounded-2xl border border-black/5 shadow-sm overflow-hidden">
          {VISA_LEVELS.map((v, i) => (
            <div key={v.purpose} className={`flex items-center justify-between gap-4 px-5 py-4 ${i > 0 ? "border-t border-black/5" : ""}`}>
              <span className="text-sm text-[#3B2922]/85">{v.purpose}</span>
              <span className="text-sm font-semibold text-[#8A3030] whitespace-nowrap">{v.level}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-[#3B2922]/55 text-center">
          Typical requirements — check your own case. Source:{" "}
          <a href="https://www.make-it-in-germany.com/en/" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-[#8A3030]">Make it in Germany</a>.
        </p>
      </section>

      {/* So funktioniert es */}
      <section className="bg-[#F7DEAD]">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <div className="text-center max-w-2xl mx-auto mb-9">
            <span className="inline-block text-xs tracking-[0.3em] text-[#E3A12F] uppercase font-semibold mb-3">How it works</span>
            <h2 className="text-2xl sm:text-3xl font-bold">A clear plan — three simple steps</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-[#FBF2DA] rounded-2xl p-6 shadow-sm border border-black/5 text-center">
                <div className="w-10 h-10 mx-auto grid place-items-center rounded-full bg-[#8A3030] text-white font-bold">{s.n}</div>
                <h3 className="mt-3 font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-[#3B2922]/70">{s.text}</p>
                {s.soon && <span className="mt-3 inline-block text-xs font-semibold text-[#E3A12F] uppercase tracking-wide">Coming soon</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blick in die App */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="text-center max-w-2xl mx-auto mb-9">
          <span className="inline-block text-xs tracking-[0.3em] text-[#E3A12F] uppercase font-semibold mb-3">A look inside</span>
          <h2 className="text-2xl sm:text-3xl font-bold">See exactly how it works</h2>
          <p className="mt-3 text-[#3B2922]/75">
            Real screens from the app — a clear path, video lessons, interactive practice, flashcards and a vocab game.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {SHOTS.map((s) => (
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
      </section>

      {/* Ergebnisse / Reviews */}
      <section className="bg-[#F7DEAD]">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">What students say about learning with Marvin</h2>
            <p className="mt-2 text-sm">
              <Stars /> <span className="font-bold">{PREPLY_STATS.rating}</span>{" "}
              <span className="text-[#3B2922]/60">· {PREPLY_STATS.reviews} reviews · </span>
              <a href={SITE.preplyUrl} target="_blank" rel="noreferrer" className="text-[#3B2922]/60 underline underline-offset-2 hover:text-[#8A3030]">verified on Preply</a>
            </p>
          </div>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
            {REVIEWS.map((r, i) => (
              <div key={i} className="bg-[#FBF2DA] rounded-2xl p-5 mb-4 break-inside-avoid shadow-sm border border-black/5">
                <Stars />
                <p className="mt-2 text-sm text-[#3B2922]/90 italic">“{r.text}”</p>
                <p className="mt-3 text-xs font-semibold">{r.name} <span className="text-[#3B2922]/50 font-normal">· {r.date}</span></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preise (Teaser → Trial / /pricing) */}
      <section className="max-w-2xl mx-auto px-6 py-16">
        <div className="bg-[#FBF2DA] rounded-2xl p-8 sm:p-10 text-center shadow-md border border-[#E3A12F]/40">
          <h2 className="text-2xl font-bold">Start free. Continue from ${APP_YEARLY_PER_MONTH}/month.</h2>
          <div className="mt-3">
            <span className="text-5xl font-bold text-[#8A3030]">5 days free</span>
            <div className="text-sm text-[#3B2922]/70 mt-1">
              then ${APP_YEARLY_PER_MONTH}/month (billed yearly) or {priceLabel()} monthly · {TAX_NOTE}
            </div>
          </div>
          <ul className="text-sm text-[#3B2922]/75 space-y-2 my-7 inline-block text-left">
            {included.map((f) => <li key={f}>✓ {f}</li>)}
          </ul>
          <Link href="/register" className="block rounded-xl bg-[#8A3030] text-white px-8 py-4 text-lg font-semibold hover:brightness-110 transition">
            Start your 5-day free trial
          </Link>
          <p className="text-sm text-[#3B2922]/60 mt-3">No credit card needed · cancel anytime.</p>
          <p className="text-xs text-[#3B2922]/55 mt-2">
            See all plans on the{" "}
            <Link href="/pricing" className="text-[#8A3030] underline underline-offset-4 font-semibold">pricing page</Link>.
          </p>
          <div className="mt-6 pt-5 border-t border-black/10 text-sm text-[#3B2922]/70 space-y-1">
            <p>
              Have a code?{" "}
              <Link href="/register" className="text-[#8A3030] font-semibold underline underline-offset-4">Create your account</Link> and redeem it inside.
            </p>
            <p>Already a member? <Link href="/login" className="text-[#8A3030] font-semibold underline underline-offset-4">Sign in</Link></p>
          </div>
        </div>
      </section>

      {/* 1:1-Lehrer */}
      <section id="teachers" className="bg-[#F7DEAD] scroll-mt-6">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="text-center max-w-2xl mx-auto mb-9">
            <span className="inline-block text-xs tracking-[0.3em] text-[#E3A12F] uppercase font-semibold mb-3">1-on-1 lessons</span>
            <h2 className="text-2xl sm:text-3xl font-bold">Want a real teacher? Learn 1-on-1</h2>
            <p className="mt-3 text-[#3B2922]/75">
              Book private lessons with Marvin or Thanh Ha — flexible times, at your level, with clear
              explanations in your own language, right inside the app.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {TEACHERS.map((t) => (
              <div key={t.name} className="bg-[#FBF2DA] rounded-2xl p-7 shadow-sm border border-black/5 flex flex-col items-center text-center">
                <img src={t.photo} alt={t.name} className="w-28 h-28 rounded-2xl object-cover shadow-sm" style={{ objectPosition: "center top" }} />
                <div className="mt-4 font-bold text-lg">{t.name}</div>
                <div className="text-sm text-[#3B2922]/60">{t.role}</div>
                <p className="mt-3 text-sm text-[#3B2922]/75">{t.blurb}</p>
                <div className="mt-3 text-sm font-semibold text-[#8A3030]">${t.price}/lesson · 50 min</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-9">
            <Link href="/online-german-lessons" className="inline-block rounded-xl border-2 border-[#8A3030] text-[#8A3030] px-8 py-4 text-lg font-semibold hover:bg-[#8A3030]/5 transition">
              See 1-on-1 lessons →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">Ready to start speaking German?</h2>
        <p className="mt-3 text-[#3B2922]/75">Try the whole course free for 5 days — no credit card.</p>
        <Link href="/register" className="mt-6 inline-block rounded-xl bg-[#8A3030] text-white px-8 py-4 text-lg font-semibold hover:brightness-110 transition shadow-sm">
          Start your 5-day free trial
        </Link>
      </section>

      {/* Footer (hell) */}
      <footer className="bg-[#F7DEAD] border-t border-black/5 py-8 text-center text-sm text-[#3B2922]/70">
        <div>© {new Date().getFullYear()} German with Marvin LLC · German Simplified</div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <a href={`mailto:${SITE.contactEmail}`} className="hover:text-[#3B2922] underline underline-offset-4">Contact · Kontakt</a>
          <Link href="/pricing" className="hover:text-[#3B2922] underline underline-offset-4">Pricing</Link>
          <Link href="/impressum" className="hover:text-[#3B2922] underline underline-offset-4">Legal Notice · Impressum</Link>
          <Link href="/datenschutz" className="hover:text-[#3B2922] underline underline-offset-4">Privacy · Datenschutz</Link>
          <Link href="/agb" className="hover:text-[#3B2922] underline underline-offset-4">Terms · AGB</Link>
        </div>
      </footer>
    </div>
  );
}
