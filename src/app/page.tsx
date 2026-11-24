/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import VideoPlayer from "@/components/VideoPlayer";
import PublicNav from "@/components/PublicNav";
import SocialLinks from "@/components/SocialLinks";
import { SITE, priceLabel, APP_YEARLY_PER_MONTH, TAX_NOTE, GROUP_COURSE, groupCoursePrice, eurLabel } from "@/lib/config";
import { REVIEWS, PREPLY_STATS } from "@/lib/reviews";
import { SHOTS, TEACHERS, PREPLY_BADGES } from "@/lib/landing";
import { B1_COPY } from "@/lib/b1course";

// Wen die Seite anspricht — Positionierung über die Zielgruppe, nicht Features.
const AUDIENCES = [
  { icon: "🛫", title: "Moving to Germany", text: "For an Ausbildung, a job or the Chancenkarte — build the German your visa and your new life ask for.", level: "You'll need A1–B1" },
  { icon: "🗣️", title: "Living here, stuck at A2", text: "You get by, but you want to really speak — break through to confident, everyday German.", level: "Push to B1–B2" },
  { icon: "🎓", title: "Preparing for an exam", text: "Goethe or telc coming up? Learn in the exam's format and walk in ready.", level: "A1–B2, exam-ready" },
];

const STEPS = [
  { n: "1", title: "See where you stand", text: "Take a short placement test — no guessing where to begin." },
  { n: "2", title: "Follow your daily plan", text: "About 20 minutes a day: a video lesson, practice and flashcards — in the right order." },
  { n: "3", title: "Practice with a real teacher", text: "Whenever you want to speak out loud or get unstuck, book a 1-on-1 lesson with Marvin or Thanh Ha — right inside the app." },
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

const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "German with Marvin",
  url: "https://www.germanwithmarvin.com",
  logo: "https://www.germanwithmarvin.com/logo-light.png",
  sameAs: [SITE.tiktokUrl, SITE.instagramUrl, SITE.preplyUrl],
};

export default function Home() {
  return (
    <div className="bg-[#FFF1D2] text-[#3B2922] min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }} />
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center">
          <img src="/logo-light.png" alt="Marvin Graf — German Simplified" className="h-16 md:h-[125px] w-auto object-contain" />
        </Link>
        <PublicNav />
      </header>

      {/* Hero — ein klarer Blickpunkt, ein Hauptbutton */}
      <section className="max-w-6xl mx-auto px-6 pt-6 pb-10 grid lg:grid-cols-[1fr_1.1fr] gap-10 items-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1]">
            German for your life<br /><span className="text-[#8A3030]">in Germany.</span>
          </h1>
          <p className="mt-5 text-lg text-[#3B2922]/80 max-w-md">
            Learn German from zero to B2 with a real teacher — video lessons, flashcards in my own voice,
            stories and exam practice. Start free in two minutes.
          </p>
          <Link href="/register" className="mt-7 inline-block rounded-xl bg-[#8A3030] text-white px-8 py-4 text-lg font-semibold hover:brightness-110 transition shadow-sm">
            Start your 5-day free trial
          </Link>
          <p className="mt-3 text-sm text-[#3B2922]/70">
            <span className="font-semibold text-[#3B2922]">Free for 5 days · no credit card.</span> Cancel anytime.
          </p>
          <p className="mt-2 text-sm">
            <Link href="/level-test?src=home" className="text-[#8A3030] font-semibold underline underline-offset-4 hover:brightness-110">
              Not sure about your level? Take the free 5-minute test →
            </Link>
          </p>
        </div>

        <div className="rounded-2xl bg-[#FBF2DA] p-3 shadow-lg border border-black/5">
          <VideoPlayer videoId={SITE.introVideoId} title="German with Marvin — how it works" />
          <p className="text-center text-xs text-[#3B2922]/55 py-2">Watch how it works · 2 min</p>
        </div>
      </section>

      {/* Schmale Vertrauenszeile — ein ruhiger Beleg statt einer Wand */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-[#3B2922]/70 border-y border-black/5 py-4">
          <span className="flex items-center gap-1.5"><Stars /> <span className="font-bold text-[#3B2922]">{PREPLY_STATS.rating}</span></span>
          <span className="text-[#3B2922]/30">·</span>
          <span>{PREPLY_STATS.lessons.toLocaleString("en-US")} lessons taught</span>
          <span className="text-[#3B2922]/30 hidden sm:inline">·</span>
          <span className="hidden sm:inline">students in {PREPLY_STATS.countries} countries</span>
          {PREPLY_BADGES.slice(0, 1).map((b) => (
            <span key={b} className="inline-flex items-center rounded-full bg-[#8A3030]/10 border border-[#8A3030]/20 px-3 py-1 text-xs font-bold text-[#8A3030]">{b}</span>
          ))}
          <a href={SITE.preplyUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-[#8A3030]">verified on Preply</a>
        </div>
      </div>

      {/* Weiche: zwei klare Wege — Hauptweg Abo, daneben der B1-Kurs */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-6">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">{B1_COPY.home.forkHeading}</h2>
          <p className="mt-3 text-[#3B2922]/75">{B1_COPY.home.forkSub}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5 items-stretch">
          {/* A — Hauptweg: Selbstlern-Abo */}
          <div className="relative bg-[#8A3030] text-white rounded-3xl p-7 shadow-md flex flex-col">
            <span className="absolute -top-3 left-6 bg-[#E3A12F] text-[#3b2116] text-xs font-bold px-3 py-1 rounded-full">Most popular</span>
            <h3 className="text-xl font-bold">{B1_COPY.home.selfPacedTitle}</h3>
            <p className="mt-2 text-white/85 text-sm flex-1">{B1_COPY.home.selfPacedText}</p>
            <Link href="/register" className="mt-5 inline-block text-center rounded-xl bg-[#E3A12F] text-[#3b2116] px-6 py-3.5 font-bold hover:brightness-105 transition">
              Start your 5-day free trial →
            </Link>
          </div>
          {/* B — der B1-Live-Kurs */}
          <div className="bg-[#FBF2DA] border border-[#E3A12F]/40 rounded-3xl p-7 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold text-[#8A3030]">{B1_COPY.home.courseTitle}</h3>
            <p className="mt-2 text-[#3B2922]/80 text-sm flex-1">{B1_COPY.home.courseText}</p>
            <div className="mt-3 text-xs text-[#3B2922]/60">
              {GROUP_COURSE.weeks} weeks · {GROUP_COURSE.totalSessions} live sessions · max {GROUP_COURSE.maxSeats} people · from {eurLabel(groupCoursePrice())}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/b1-course" className="inline-block rounded-xl bg-[#8A3030] text-white px-6 py-3 font-semibold hover:brightness-110 transition">See the B1 course →</Link>
              <Link href="/b1-test" className="inline-block rounded-xl border border-[#8A3030] text-[#8A3030] px-6 py-3 font-semibold hover:bg-[#8A3030]/5 transition">Free B1 test</Link>
            </div>
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

      {/* So funktioniert es */}
      <section className="bg-[#FFF1D2]">
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blick in die App */}
      <section className="bg-[#F7DEAD]">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="text-center max-w-2xl mx-auto mb-9">
            <span className="inline-block text-xs tracking-[0.3em] text-[#E3A12F] uppercase font-semibold mb-3">A look inside</span>
            <h2 className="text-2xl sm:text-3xl font-bold">See exactly how it works</h2>
            <p className="mt-3 text-[#3B2922]/75">
              Real screens from the app — a clear path, video lessons, interactive practice and flashcards.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {SHOTS.slice(0, 4).map((s) => (
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
        </div>
      </section>

      {/* Ergebnisse / Reviews */}
      <section className="bg-[#FFF1D2]">
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
            {REVIEWS.slice(0, 6).map((r, i) => (
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
        <p className="mt-4 text-sm text-[#3B2922]/60">
          Not ready yet? <Link href="/free-a1-stories" className="text-[#8A3030] underline underline-offset-4 font-semibold">Get a free A1 story</Link>
          {" "}or <Link href="/level-test?src=home" className="text-[#8A3030] underline underline-offset-4 font-semibold">find your level free →</Link>
        </p>
      </section>

      {/* Footer (hell) */}
      <footer className="bg-[#F7DEAD] border-t border-black/5 py-8 text-center text-sm text-[#3B2922]/70">
        <div>© {new Date().getFullYear()} German with Marvin LLC · German Simplified</div>
        <SocialLinks className="justify-center mt-3 text-[#3B2922]" />
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
