/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/config";
import { REVIEWS, PREPLY_STATS } from "@/lib/reviews";
import { TEACHERS } from "@/lib/landing";

export const metadata: Metadata = {
  title: "Online German Lessons — private 1-on-1 with a real teacher",
  description:
    "Private online German lessons, 1-on-1 with a real teacher. 50-minute sessions from $30, tailored to your level. Book with Marvin or Thanh Ha inside the app.",
  alternates: { canonical: "https://www.germanwithmarvin.com/online-german-lessons" },
};

const steps = [
  { n: "1", title: "Create your free account", text: "Sign up in a minute — 5 days free, no credit card." },
  { n: "2", title: "Choose your teacher & time", text: "Pick Marvin or Thanh Ha and a slot that fits your week." },
  { n: "3", title: "Meet on video", text: "A focused 50-minute 1-on-1 lesson, tailored to you." },
];

function Stars() {
  return <span className="text-[#E3A12F] tracking-tight">★★★★★</span>;
}

export default function OnlineLessonsPage() {
  return (
    <div className="bg-[#FFF1D2] text-[#3B2922] min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center">
          <img src="/logo-light.png" alt="Marvin Graf — German Simplified" className="h-[104px] md:h-[125px] w-auto object-contain" />
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm rounded-lg border border-[#8A3030] text-[#8A3030] hover:bg-[#8A3030]/5 transition">Sign in</Link>
          <Link href="/register" className="px-4 py-2 text-sm rounded-lg bg-[#8A3030] text-white hover:brightness-110 transition">Get started</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-6 pb-14 grid lg:grid-cols-[1fr_1fr] gap-10 items-center">
        <div>
          <span className="inline-block text-xs tracking-[0.3em] text-[#E3A12F] uppercase font-semibold mb-4">1-on-1 online lessons</span>
          <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1]">
            Private German lessons —<br /><span className="text-[#8A3030]">with a real teacher.</span>
          </h1>
          <p className="mt-5 text-lg text-[#3B2922]/75 max-w-md">
            Learn faster with <span className="font-semibold text-[#3B2922]">1-on-1 online lessons</span> tailored to your level.
            50-minute sessions from <span className="font-semibold text-[#3B2922]">$30</span> — with Marvin or Thanh Ha, clear explanations in your language.
          </p>

          <Link href="/register" className="mt-8 inline-block rounded-xl bg-[#8A3030] text-white px-8 py-4 text-lg font-semibold hover:brightness-110 transition shadow-sm">
            Get started — book a lesson
          </Link>
          <p className="mt-3 text-sm text-[#3B2922]/70">Create a free account, then book your first lesson inside the app.</p>

          <p className="mt-5 text-sm flex items-center gap-2 flex-wrap">
            <Stars /> <span className="font-bold">{PREPLY_STATS.rating}</span>
            <span className="text-[#3B2922]/60">· {PREPLY_STATS.reviews} reviews · more than {PREPLY_STATS.lessons.toLocaleString("en-US")} lessons taught</span>
          </p>
        </div>

        {/* Lehrer-Vorschau */}
        <div className="grid sm:grid-cols-2 gap-4">
          {TEACHERS.map((t) => (
            <div key={t.name} className="bg-[#FBF2DA] rounded-2xl p-6 shadow-sm border border-black/5 flex flex-col items-center text-center">
              <img src={t.photo} alt={t.name} className="w-24 h-24 rounded-2xl object-cover shadow-sm" style={{ objectPosition: "center top" }} />
              <div className="mt-3 font-bold">{t.name}</div>
              <div className="text-xs text-[#3B2922]/60">{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Lehrer-Profile ausführlich */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <div className="text-center max-w-2xl mx-auto mb-9">
          <span className="inline-block text-xs tracking-[0.3em] text-[#E3A12F] uppercase font-semibold mb-3">Meet your teachers</span>
          <h2 className="text-2xl sm:text-3xl font-bold">Real teachers, not a faceless platform</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {TEACHERS.map((t) => (
            <div key={t.name} className="bg-[#FBF2DA] rounded-2xl p-7 shadow-sm border border-black/5 flex flex-col items-center text-center">
              <img src={t.photo} alt={t.name} className="w-28 h-28 rounded-2xl object-cover shadow-sm" style={{ objectPosition: "center top" }} />
              <div className="mt-4 font-bold text-lg">{t.name}</div>
              <div className="text-sm text-[#3B2922]/60">{t.role}</div>
              <p className="mt-3 text-sm text-[#3B2922]/75">{t.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {/* So funktioniert's */}
      <section className="bg-[#F7DEAD]">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-9">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {steps.map((s) => (
              <div key={s.n} className="bg-[#FBF2DA] rounded-2xl p-6 shadow-sm border border-black/5 text-center">
                <div className="w-10 h-10 mx-auto grid place-items-center rounded-full bg-[#8A3030] text-white font-bold">{s.n}</div>
                <h3 className="mt-3 font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-[#3B2922]/70">{s.text}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-[#3B2922]/70 mt-8">
            <span className="font-semibold text-[#3B2922]">From $30 per 50-minute lesson.</span> Flexible monthly packages · unused hours stay valid for 5 weeks.
          </p>
        </div>
      </section>

      {/* Reviews (echte 1:1-Bewertungen) */}
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

      {/* Abschluss-CTA */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <div className="bg-[#FBF2DA] rounded-2xl p-8 sm:p-10 text-center shadow-md border border-[#E3A12F]/40">
          <h2 className="text-2xl font-bold">Ready for your first lesson?</h2>
          <p className="mt-2 text-sm text-[#3B2922]/70">Create a free account, pick your teacher and book — from $30 per 50-minute lesson.</p>
          <Link href="/register" className="mt-6 inline-block rounded-xl bg-[#8A3030] text-white px-8 py-4 text-lg font-semibold hover:brightness-110 transition">
            Get started — book a lesson
          </Link>
          <p className="text-xs text-[#3B2922]/55 mt-4">
            Prefer to learn on your own?{" "}
            <Link href="/german-course" className="text-[#8A3030] underline underline-offset-4 font-semibold">Try the self-study course →</Link>
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
