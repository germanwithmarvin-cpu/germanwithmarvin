/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/config";
import PublicNav from "@/components/PublicNav";
import SocialLinks from "@/components/SocialLinks";
import { TEACHERS, PREPLY_BADGES } from "@/lib/landing";
import { REVIEWS, PREPLY_STATS } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "1-on-1 German lessons with Marvin — exam prep & a clear method",
  description:
    "Learn German 1-on-1 with Marvin — full-time teacher, Preply Super Tutor (top 10%), A1–C1. Structured lessons and real Goethe/telc exam prep. 50-minute online lessons from $33.",
  alternates: { canonical: "https://www.germanwithmarvin.com/marvin" },
};

// Marvins Preply-Vorstellungsvideo. Standard: das vorhandene Intro-Video der
// Startseite. Zum Tauschen einfach die YouTube-ID eintragen (Teil nach "v=").
const MARVIN_VIDEO_ID = SITE.introVideoId;

const MARVIN = TEACHERS.find((t) => t.name.toLowerCase().includes("marvin")) ?? TEACHERS[0];
const PRICE = MARVIN?.price ?? 33;
const PHOTO = MARVIN?.photo ?? "/teachers/marvin.jpg";

// Kuratierte ECHTE Bewertungen (1:1-Qualität) aus src/lib/reviews.ts.
const PICKED = ["Doron", "Erin", "Ivan", "Andy", "Karolina", "Veronika"]
  .map((n) => REVIEWS.find((r) => r.name === n))
  .filter((r): r is (typeof REVIEWS)[number] => Boolean(r));

const whyMarvin = [
  { icon: "📝", title: "Exam-ready", text: "Goethe & telc prep, A1–B2 — learn in the real exam format so there are no surprises on the day." },
  { icon: "🧭", title: "A clear method", text: "Structured lessons that build on each other — not random chat. You always know what's next." },
  { icon: "⭐", title: "Super Tutor", text: "Full-time teacher, top 10% on Preply, thousands of 1-on-1 hours across A1–C1." },
];

const steps = [
  { n: "1", title: "Create your free account", text: "No subscription required — sign up in a minute." },
  { n: "2", title: "Pick Marvin & a time", text: "Choose Marvin as your teacher and a slot that fits your week." },
  { n: "3", title: "Meet on video", text: "A focused 50-minute 1-on-1 lesson, tailored to your goal." },
];

function Stars() {
  return <span className="text-[#E3A12F] tracking-tight">★★★★★</span>;
}

export default function MarvinPage() {
  return (
    <div className="bg-[#FFF1D2] text-[#3B2922] min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center">
          <img src="/logo-light.png" alt="German with Marvin" className="h-16 md:h-[125px] w-auto object-contain" />
        </Link>
        <PublicNav ctaLabel="Get started" ctaHref="/register?intent=lesson" />
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-6 pb-14 grid lg:grid-cols-[1fr_1fr] gap-10 items-center">
        <div>
          <span className="inline-block text-xs tracking-[0.3em] text-[#E3A12F] uppercase font-semibold mb-4">1-on-1 German lessons with Marvin</span>
          <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1]">
            Reach your level —<br /><span className="text-[#8A3030]">with the founder himself.</span>
          </h1>
          <p className="mt-5 text-lg text-[#3B2922]/75 max-w-md">
            I teach German full-time — <span className="font-semibold text-[#3B2922]">A1 to C1</span>, with real
            Goethe/telc exam prep and a clear method that actually builds up, lesson by lesson.
          </p>

          <Link href="/register?intent=lesson&t=1" className="mt-8 inline-block rounded-xl bg-[#8A3030] text-white px-8 py-4 text-lg font-semibold hover:brightness-110 transition shadow-sm">
            Book a lesson with Marvin
          </Link>
          <p className="mt-3 text-sm text-[#3B2922]/70">Create a free account, pick a time, and meet on video — from ${PRICE} per 50-minute lesson.</p>

          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#3B2922]/70">
            <span>🎓 Full-time teacher, 4+ years</span>
            <span>📝 Goethe/telc exam prep</span>
            <span>⭐ Super Tutor · top 10%</span>
          </div>
        </div>

        {/* Foto */}
        <div className="flex justify-center lg:justify-end">
          <div className="bg-[#FBF2DA] rounded-3xl p-5 shadow-sm border border-black/5 text-center max-w-xs w-full">
            <img src={PHOTO} alt="Marvin — German teacher" className="w-40 h-40 mx-auto rounded-2xl object-cover shadow-sm" style={{ objectPosition: "center top" }} />
            <div className="mt-4 font-bold text-lg">Marvin Graf</div>
            <div className="text-sm text-[#3B2922]/60">Founder & your teacher · A1–C1</div>
            <div className="mt-3 text-sm text-[#3B2922]/70">🗣 German · English</div>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {PREPLY_BADGES.map((b) => (
                <span key={b} className="text-[11px] font-semibold bg-[#8A3030]/10 border border-[#8A3030]/20 rounded-full px-2 py-1 text-[#8A3030]">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Video */}
      <section className="max-w-3xl mx-auto px-6 pb-4">
        <div className="text-center mb-5">
          <span className="inline-block text-xs tracking-[0.3em] text-[#E3A12F] uppercase font-semibold mb-2">Say hallo</span>
          <h2 className="text-2xl sm:text-3xl font-bold">Meet Marvin</h2>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-md border border-black/5 bg-[#FBF2DA]" style={{ aspectRatio: "16 / 9" }}>
          {MARVIN_VIDEO_ID ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${MARVIN_VIDEO_ID}`}
              title="Meet Marvin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-center px-6">
              <div>
                <div className="w-16 h-16 mx-auto grid place-items-center rounded-full bg-[#8A3030] text-white text-2xl">▶</div>
                <p className="mt-3 font-semibold">Intro video coming soon</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Story */}
      <section className="max-w-3xl mx-auto px-6 py-14">
        <div className="bg-[#FBF2DA] rounded-2xl p-7 sm:p-9 shadow-sm border border-black/5">
          <h2 className="text-2xl font-bold">Hi, I’m Marvin 👋</h2>
          <p className="mt-4 text-[#3B2922]/85 leading-relaxed">
            I’ve taught German full-time for 4+ years, with thousands of 1-on-1 hours from complete beginners
            to C1. I built this whole platform — the course, the flashcards, the exam trainer — because I
            wanted my students to have real structure, not scattered tips.
          </p>
          <p className="mt-3 text-[#3B2922]/85 leading-relaxed">
            In our lessons we work on exactly what you need: speaking with confidence, fixing your weak spots,
            or getting exam-ready for Goethe or telc. We go at your pace and make it stick.
          </p>
        </div>
      </section>

      {/* Why Marvin */}
      <section className="bg-[#F7DEAD]">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-9">Why learn with Marvin</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {whyMarvin.map((w) => (
              <div key={w.title} className="bg-[#FBF2DA] rounded-2xl p-6 shadow-sm border border-black/5 text-center">
                <div className="text-3xl">{w.icon}</div>
                <h3 className="mt-2 font-bold">{w.title}</h3>
                <p className="mt-1 text-sm text-[#3B2922]/70">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews (echt) */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">What Marvin’s students say</h2>
          <p className="mt-2 text-sm">
            <Stars /> <span className="font-bold">{PREPLY_STATS.rating}</span>{" "}
            <span className="text-[#3B2922]/60">· {PREPLY_STATS.reviews} reviews · {PREPLY_STATS.lessons.toLocaleString("en-US")}+ lessons taught · </span>
            <a href={SITE.preplyUrl} target="_blank" rel="noreferrer" className="text-[#3B2922]/60 underline underline-offset-2 hover:text-[#8A3030]">verified on Preply</a>
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {PICKED.map((r, i) => (
            <div key={i} className="bg-[#FBF2DA] rounded-2xl p-5 shadow-sm border border-black/5">
              <Stars />
              <p className="mt-2 text-sm text-[#3B2922]/90 italic">“{r.text}”</p>
              <p className="mt-3 text-xs font-semibold">{r.name} <span className="text-[#3B2922]/50 font-normal">· {r.date}</span></p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
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
            <span className="font-semibold text-[#3B2922]">${PRICE} per 50-minute lesson.</span> Flexible monthly packages from 4 lessons · unused hours stay valid for 5 weeks · cancel anytime.
          </p>
        </div>
      </section>

      {/* Abschluss-CTA */}
      <section className="max-w-2xl mx-auto px-6 py-16">
        <div className="bg-[#FBF2DA] rounded-2xl p-8 sm:p-10 text-center shadow-md border border-[#E3A12F]/40">
          <h2 className="text-2xl font-bold">Ready for your first lesson?</h2>
          <p className="mt-2 text-sm text-[#3B2922]/70">Create a free account, pick a time with Marvin and meet on video — ${PRICE} per 50-minute lesson, in monthly packages from 4.</p>
          <Link href="/register?intent=lesson&t=1" className="mt-6 inline-block rounded-xl bg-[#8A3030] text-white px-8 py-4 text-lg font-semibold hover:brightness-110 transition">
            Book a lesson with Marvin
          </Link>
          <p className="text-xs text-[#3B2922]/55 mt-4">
            New to German and want a gentle start?{" "}
            <Link href="/ha" className="text-[#8A3030] underline underline-offset-4 font-semibold">Meet Ha, beginner-friendly →</Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F7DEAD] border-t border-black/5 py-8 text-center text-sm text-[#3B2922]/70">
        <div>© {new Date().getFullYear()} German with Marvin LLC · German Simplified</div>
        <SocialLinks className="justify-center mt-3 text-[#3B2922]" />
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
