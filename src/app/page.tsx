/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import VideoPlayer from "@/components/VideoPlayer";
import { SITE, checkoutUrl, priceLabel, TAX_NOTE } from "@/lib/config";
import { REVIEWS, PREPLY_STATS } from "@/lib/reviews";

const benefits = [
  { icon: "🎬", title: "Clear video lessons", text: "Step-by-step explanations that make grammar and vocabulary easy to understand." },
  { icon: "⚡", title: "Interactive exercises", text: "Practice what you learn with engaging exercises and instant feedback." },
  { icon: "🗂️", title: "Smart flashcard trainer", text: "Remember more with a spaced-repetition system that adapts to you." },
  { icon: "📖", title: "Reading stories", text: "Short German stories at your level to build a real feel for the language." },
  { icon: "🧭", title: "One guided path", text: "A clear path from beginner to advanced — no guessing what to learn next." },
  { icon: "📊", title: "See your progress", text: "Track completed lessons, learned cards and your streak as you go." },
];

const included = [
  "All video lessons (A1–B2)",
  "Interactive exercises after every lesson",
  "The full flashcard trainer (1,800+ cards)",
  "Reading stories & downloadable material",
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
        <nav className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm rounded-lg border border-[#8A3030] text-[#8A3030] hover:bg-[#8A3030]/5 transition">Sign in</Link>
          <a href={checkoutUrl()} className="px-4 py-2 text-sm rounded-lg bg-[#8A3030] text-white hover:brightness-110 transition">Join now</a>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-6 pb-14 grid lg:grid-cols-[1fr_1.3fr] gap-10 items-center">
        <div>
          <span className="inline-block text-xs tracking-[0.3em] text-[#E3A12F] uppercase font-semibold mb-4">German Simplified</span>
          <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1]">
            Learn German with me —<br /><span className="text-[#8A3030]">the simple way.</span>
          </h1>
          <p className="mt-5 text-lg text-[#3B2922]/75 max-w-md">
            Video lessons, interactive exercises, a smart flashcard trainer and reading stories — everything you
            need to actually speak German, in one place.
          </p>

          <a href={checkoutUrl()} className="mt-8 inline-block rounded-xl bg-[#8A3030] text-white px-8 py-4 text-lg font-semibold hover:brightness-110 transition shadow-sm">
            Join now — {priceLabel()}/month
          </a>
          <p className="mt-2 text-sm text-[#3B2922]/60">Cancel anytime · instant access</p>

          <p className="mt-5 text-sm flex items-center gap-2 flex-wrap">
            <Stars /> <span className="font-bold">{PREPLY_STATS.rating}</span>
            <span className="text-[#3B2922]/60">· {PREPLY_STATS.reviews} reviews · more than {PREPLY_STATS.lessons.toLocaleString("en-US")} lessons taught</span>
          </p>
        </div>

        {/* Video + schwebende Badges */}
        <div className="relative">
          <div className="rounded-2xl bg-[#FBF2DA] p-3 shadow-lg border border-black/5">
            <VideoPlayer videoId={SITE.introVideoId} title="German Simplified — Marvin Graf" />
          </div>
          <div className="absolute -right-2 top-6 bg-[#FBF2DA] rounded-xl shadow-md border border-black/5 px-4 py-3 flex items-center gap-2">
            <span className="text-xl">📊</span>
            <div className="leading-tight"><div className="font-bold text-sm">A1–B2</div><div className="text-xs text-[#3B2922]/60">All levels</div></div>
          </div>
          <div className="absolute -right-2 top-28 bg-[#FBF2DA] rounded-xl shadow-md border border-black/5 px-4 py-3 flex items-center gap-2">
            <span className="text-xl">🗂️</span>
            <div className="leading-tight"><div className="font-bold text-sm">1,800+</div><div className="text-xs text-[#3B2922]/60">cards</div></div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#F7DEAD]">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-9">Everything you need to make German stick</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b) => (
              <div key={b.title} className="bg-[#FBF2DA] rounded-2xl p-6 shadow-sm border border-black/5">
                <div className="text-3xl mb-3">{b.icon}</div>
                <h3 className="text-lg font-bold">{b.title}</h3>
                <p className="mt-2 text-sm text-[#3B2922]/70">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">What my students say</h2>
          <p className="mt-2 text-sm"><Stars /> <span className="font-bold">{PREPLY_STATS.rating}</span> <span className="text-[#3B2922]/60">· {PREPLY_STATS.reviews} reviews</span></p>
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
      </section>

      {/* Preis / Abschluss-CTA */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <div className="bg-[#FBF2DA] rounded-2xl p-8 sm:p-10 text-center shadow-md border border-[#E3A12F]/40">
          <h2 className="text-2xl font-bold">German Simplified — All-Access</h2>
          <div className="mt-3">
            <span className="text-5xl font-bold text-[#8A3030]">{priceLabel()}</span>
            <span className="text-[#3B2922]/60"> / month</span>
            <div className="text-xs text-[#3B2922]/55 mt-1">{TAX_NOTE}</div>
          </div>
          <ul className="text-sm text-[#3B2922]/75 space-y-2 my-7 inline-block text-left">
            {included.map((f) => <li key={f}>✓ {f}</li>)}
          </ul>
          <a href={checkoutUrl()} className="block rounded-xl bg-[#8A3030] text-white px-8 py-4 text-lg font-semibold hover:brightness-110 transition">
            Join now — {priceLabel()}/month
          </a>
          <p className="text-sm text-[#3B2922]/60 mt-3">Cancel anytime. Instant access after checkout.</p>
          <div className="mt-6 pt-5 border-t border-black/10 text-sm text-[#3B2922]/70 space-y-1">
            <p>
              Got a code from <a href={SITE.preplyUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Preply</a> or{" "}
              <a href={SITE.skoolUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Skool</a>?{" "}
              <Link href="/register" className="text-[#8A3030] font-semibold underline underline-offset-4">Create your account</Link> and redeem it inside.
            </p>
            <p>Already a member? <Link href="/login" className="text-[#8A3030] font-semibold underline underline-offset-4">Sign in</Link></p>
          </div>
        </div>
      </section>

      {/* Footer (hell) */}
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
