/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import VideoPlayer from "@/components/VideoPlayer";
import PublicNav from "@/components/PublicNav";
import { SITE, APP_YEARLY_PER_MONTH, TAX_NOTE } from "@/lib/config";
import { REVIEWS, PREPLY_STATS } from "@/lib/reviews";
import { SHOTS, PREPLY_BADGES } from "@/lib/landing";

export type AudiencePoint = { icon: string; title: string; text: string };

export type AudienceLandingProps = {
  eyebrow: string;
  h1: string;
  h1accent: string;
  sub: string;
  levelTitle: string;
  levelText: string;
  points: AudiencePoint[];
  whyHeading: string;
};

function Stars() {
  return <span className="text-[#E3A12F] tracking-tight">★★★★★</span>;
}

export default function AudienceLanding(p: AudienceLandingProps) {
  return (
    <div className="bg-[#FFF1D2] text-[#3B2922] min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center">
          <img src="/logo-light.png" alt="Marvin Graf — German Simplified" className="h-[104px] md:h-[125px] w-auto object-contain" />
        </Link>
        <PublicNav />
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-6 pb-14 grid lg:grid-cols-[1fr_1.2fr] gap-10 items-center">
        <div>
          <span className="inline-block text-xs tracking-[0.3em] text-[#E3A12F] uppercase font-semibold mb-4">{p.eyebrow}</span>
          <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1]">
            {p.h1}<br /><span className="text-[#8A3030]">{p.h1accent}</span>
          </h1>
          <p className="mt-5 text-lg text-[#3B2922]/80 max-w-md">{p.sub}</p>

          {/* Niveau-Hinweis */}
          <div className="mt-5 rounded-xl border border-[#E3A12F]/50 bg-[#FBF2DA] p-4 max-w-md">
            <div className="text-sm font-bold text-[#8A3030]">{p.levelTitle}</div>
            <p className="text-sm text-[#3B2922]/75 mt-0.5">{p.levelText}</p>
          </div>

          <Link href="/register" className="mt-6 inline-block rounded-xl bg-[#8A3030] text-white px-8 py-4 text-lg font-semibold hover:brightness-110 transition shadow-sm">
            Start your 5-day free trial
          </Link>
          <p className="mt-3 text-sm text-[#3B2922]/70">
            <span className="font-semibold text-[#3B2922]">Free for 5 days · no credit card.</span> Then from ${APP_YEARLY_PER_MONTH}/month · cancel anytime.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {PREPLY_BADGES.map((b) => (
              <a key={b} href={SITE.preplyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full bg-[#8A3030]/10 border border-[#8A3030]/20 px-3 py-1.5 text-xs font-bold text-[#8A3030] hover:bg-[#8A3030]/15 transition">
                {b}
              </a>
            ))}
          </div>
          <p className="mt-3 text-sm flex items-center gap-2 flex-wrap text-[#3B2922]/70">
            <Stars /> <span className="font-bold text-[#3B2922]">{PREPLY_STATS.rating}</span>
            <span>· {PREPLY_STATS.lessons.toLocaleString("en-US")} lessons taught · students in {PREPLY_STATS.countries} countries</span>
          </p>
        </div>

        <div className="relative">
          <div className="rounded-2xl bg-[#FBF2DA] p-3 shadow-lg border border-black/5">
            <VideoPlayer videoId={SITE.introVideoId} title="German with Marvin — how it works" />
            <p className="text-center text-xs text-[#3B2922]/55 py-2">Watch how it works · 2 min</p>
          </div>
        </div>
      </section>

      {/* Why / points */}
      <section className="bg-[#F7DEAD]">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-9">{p.whyHeading}</h2>
          <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {p.points.map((pt) => (
              <div key={pt.title} className="bg-[#FBF2DA] rounded-2xl p-6 shadow-sm border border-black/5">
                <div className="text-3xl mb-2">{pt.icon}</div>
                <h3 className="text-lg font-bold">{pt.title}</h3>
                <p className="mt-1 text-sm text-[#3B2922]/75">{pt.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* A look inside */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="text-center max-w-2xl mx-auto mb-9">
          <span className="inline-block text-xs tracking-[0.3em] text-[#E3A12F] uppercase font-semibold mb-3">A look inside</span>
          <h2 className="text-2xl sm:text-3xl font-bold">See exactly how it works</h2>
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
      </section>

      {/* Reviews */}
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
          <div className="grid sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {REVIEWS.slice(0, 3).map((r, i) => (
              <div key={i} className="bg-[#FBF2DA] rounded-2xl p-5 shadow-sm border border-black/5">
                <Stars />
                <p className="mt-2 text-sm text-[#3B2922]/90 italic">“{r.text}”</p>
                <p className="mt-3 text-xs font-semibold">{r.name} <span className="text-[#3B2922]/50 font-normal">· {r.date}</span></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">Start today — free for 5 days</h2>
        <p className="mt-3 text-[#3B2922]/75">No credit card. Then from ${APP_YEARLY_PER_MONTH}/month · {TAX_NOTE}.</p>
        <Link href="/register" className="mt-6 inline-block rounded-xl bg-[#8A3030] text-white px-8 py-4 text-lg font-semibold hover:brightness-110 transition shadow-sm">
          Start your 5-day free trial
        </Link>
        <p className="mt-4 text-sm text-[#3B2922]/60">
          Prefer a real teacher? <Link href="/online-german-lessons" className="text-[#8A3030] underline underline-offset-4 font-semibold">See 1-on-1 lessons →</Link>
        </p>
        <p className="mt-2 text-sm text-[#3B2922]/60">
          Not ready yet? <Link href="/free-a1-stories" className="text-[#8A3030] underline underline-offset-4 font-semibold">Get a free A1 story →</Link>
        </p>
      </section>

      {/* Footer */}
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
