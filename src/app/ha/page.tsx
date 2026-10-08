/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/config";
import PublicNav from "@/components/PublicNav";
import { TEACHERS } from "@/lib/landing";

export const metadata: Metadata = {
  title: "German lessons with Ha — patient, beginner-friendly, in your language",
  description:
    "Learn German 1-on-1 with Ha — a teacher who learned German herself, from zero to university level. Patient, beginner-friendly, explained in your own language. 50-minute online lessons from $30.",
  alternates: { canonical: "https://www.germanwithmarvin.com/ha" },
};

// ════════════════════════════════════════════════════════════════════════════
//  HIER die YouTube-Video-ID eintragen — der Teil NACH "v=" in der YouTube-URL.
//  Beispiel:  https://www.youtube.com/watch?v=AbC123xyz   ->   "AbC123xyz"
//  Solange leer ("") zeigt die Seite einen Platzhalter statt des Videos.
const HA_VIDEO_ID = "";
// ════════════════════════════════════════════════════════════════════════════

// Ha = der zweite Lehrer in TEACHERS (Thanh Ha). Foto/Preis kommen von dort.
const HA = TEACHERS.find((t) => t.name.toLowerCase().includes("ha")) ?? TEACHERS[TEACHERS.length - 1];
const PRICE = HA?.price ?? 30;
const PHOTO = HA?.photo ?? "/teachers/thanh-ha.jpg?v=2";

// PLATZHALTER-Bewertungen — im Stil der echten, bitte durch echte ersetzen,
// sobald Has erste Schüler Feedback gegeben haben.
const REVIEWS = [
  { text: "Ha is incredibly patient. She explains everything in English until it really clicks — I finally stopped being afraid to speak German.", name: "Sofia R.", tag: "Beginner · A1" },
  { text: "I started from zero and never once felt stupid for asking. Ha knows exactly where beginners struggle, because she learned German herself.", name: "Daniel K.", tag: "A2" },
  { text: "Calm, clear and so well prepared. After a month with Ha my grammar finally makes sense.", name: "Mariana L.", tag: "B1" },
];

const whyHa = [
  { icon: "🌱", title: "Made for beginners", text: "No pressure, no judgement. Ha starts exactly where you are and builds up step by step." },
  { icon: "🗣", title: "Explained in your language", text: "Stuck on a grammar point? Ha explains it in clear English until it makes sense — then back to German." },
  { icon: "🎯", title: "She walked the same path", text: "Ha learned German as a foreign language herself, to university level. She knows the hard parts first-hand." },
];

const steps = [
  { n: "1", title: "Create your free account", text: "No subscription required — sign up in a minute." },
  { n: "2", title: "Pick Ha & a time", text: "Choose Ha as your teacher and a slot that fits your week." },
  { n: "3", title: "Meet on video", text: "A focused 50-minute 1-on-1 lesson, tailored to you." },
];

function Stars() {
  return <span className="text-[#E3A12F] tracking-tight">★★★★★</span>;
}

export default function HaPage() {
  return (
    <div className="bg-[#FFF1D2] text-[#3B2922] min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center">
          <img src="/logo-light.png" alt="German Simplified" className="h-16 md:h-[125px] w-auto object-contain" />
        </Link>
        <PublicNav ctaLabel="Get started" ctaHref="/register?intent=lesson" />
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-6 pb-14 grid lg:grid-cols-[1fr_1fr] gap-10 items-center">
        <div>
          <span className="inline-block text-xs tracking-[0.3em] text-[#E3A12F] uppercase font-semibold mb-4">1-on-1 German lessons with Ha</span>
          <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1]">
            Learn German with someone<br /><span className="text-[#8A3030]">who started exactly where you are.</span>
          </h1>
          <p className="mt-5 text-lg text-[#3B2922]/75 max-w-md">
            Ha learned German herself — from zero to university level. Patient, beginner-friendly, and
            <span className="font-semibold text-[#3B2922]"> explained in your own language</span> until it clicks.
          </p>

          <Link href="/register?intent=lesson&t=2" className="mt-8 inline-block rounded-xl bg-[#8A3030] text-white px-8 py-4 text-lg font-semibold hover:brightness-110 transition shadow-sm">
            Start with a free 30-min trial
          </Link>
          <p className="mt-3 text-sm text-[#3B2922]/70">No payment, no card — just create a free account and claim your free lesson with <span className="font-semibold">Ha</span>.</p>

          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#3B2922]/70">
            <span>🎁 First lesson free</span>
            <span>🎓 Learned German to university level</span>
            <span>🗣 Explains in English</span>
          </div>
        </div>

        {/* Foto */}
        <div className="flex justify-center lg:justify-end">
          <div className="bg-[#FBF2DA] rounded-3xl p-5 shadow-sm border border-black/5 text-center max-w-xs w-full">
            <img src={PHOTO} alt="Ha — German teacher" className="w-40 h-40 mx-auto rounded-2xl object-cover shadow-sm" style={{ objectPosition: "center top" }} />
            <div className="mt-4 font-bold text-lg">Ha</div>
            <div className="text-sm text-[#3B2922]/60">Your German teacher</div>
            <div className="mt-3 text-sm text-[#3B2922]/70">🗣 German · English · Vietnamese</div>
          </div>
        </div>
      </section>

      {/* Video */}
      <section className="max-w-3xl mx-auto px-6 pb-4">
        <div className="text-center mb-5">
          <span className="inline-block text-xs tracking-[0.3em] text-[#E3A12F] uppercase font-semibold mb-2">Say hallo</span>
          <h2 className="text-2xl sm:text-3xl font-bold">Meet Ha in 60 seconds</h2>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-md border border-black/5 bg-[#FBF2DA]" style={{ aspectRatio: "16 / 9" }}>
          {HA_VIDEO_ID ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${HA_VIDEO_ID}`}
              title="Meet Ha"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-center px-6">
              <div>
                <div className="w-16 h-16 mx-auto grid place-items-center rounded-full bg-[#8A3030] text-white text-2xl">▶</div>
                <p className="mt-3 font-semibold">Intro video coming soon</p>
                <p className="mt-1 text-sm text-[#3B2922]/60">A short hello from Ha.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Her story */}
      <section className="max-w-3xl mx-auto px-6 py-14">
        <div className="bg-[#FBF2DA] rounded-2xl p-7 sm:p-9 shadow-sm border border-black/5">
          <h2 className="text-2xl font-bold">Hi, I’m Ha 👋</h2>
          <p className="mt-4 text-[#3B2922]/85 leading-relaxed">
            I learned German myself — from zero to university level. I know exactly where it gets hard,
            because I’ve been there. In my lessons you learn step by step, explained in your own language
            (English), without pressure — the way I wish someone had taught me.
          </p>
          <p className="mt-3 text-[#3B2922]/85 leading-relaxed">
            Whether you’re just starting out or getting ready for an exam, we’ll go at your pace and make
            sure it actually sticks.
          </p>
        </div>
      </section>

      {/* Why Ha */}
      <section className="bg-[#F7DEAD]">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-9">Why learn with Ha</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {whyHa.map((w) => (
              <div key={w.title} className="bg-[#FBF2DA] rounded-2xl p-6 shadow-sm border border-black/5 text-center">
                <div className="text-3xl">{w.icon}</div>
                <h3 className="mt-2 font-bold">{w.title}</h3>
                <p className="mt-1 text-sm text-[#3B2922]/70">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews (Platzhalter) */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">What Ha’s students say</h2>
          <p className="mt-2 text-sm"><Stars /> <span className="text-[#3B2922]/60">from her 1-on-1 students</span></p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {REVIEWS.map((r, i) => (
            <div key={i} className="bg-[#FBF2DA] rounded-2xl p-5 shadow-sm border border-black/5">
              <Stars />
              <p className="mt-2 text-sm text-[#3B2922]/90 italic">“{r.text}”</p>
              <p className="mt-3 text-xs font-semibold">{r.name} <span className="text-[#3B2922]/50 font-normal">· {r.tag}</span></p>
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
            <span className="font-semibold text-[#3B2922]">${PRICE} per 50-minute lesson.</span> Flexible monthly packages · unused hours stay valid for 5 weeks.
          </p>
        </div>
      </section>

      {/* Abschluss-CTA */}
      <section className="max-w-2xl mx-auto px-6 py-16">
        <div className="bg-[#FBF2DA] rounded-2xl p-8 sm:p-10 text-center shadow-md border border-[#E3A12F]/40">
          <h2 className="text-2xl font-bold">Your first lesson is free</h2>
          <p className="mt-2 text-sm text-[#3B2922]/70">Try a free 30-minute trial with Ha — no payment, no card. After that, lessons are ${PRICE} each.</p>
          <Link href="/register?intent=lesson&t=2" className="mt-6 inline-block rounded-xl bg-[#8A3030] text-white px-8 py-4 text-lg font-semibold hover:brightness-110 transition">
            Claim your free 30-min trial
          </Link>
          <p className="text-xs text-[#3B2922]/55 mt-4">
            Looking for exam prep with the founder?{" "}
            <Link href="/online-german-lessons" className="text-[#8A3030] underline underline-offset-4 font-semibold">See all teachers →</Link>
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
