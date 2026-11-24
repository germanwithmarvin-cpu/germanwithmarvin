/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import LegalFooter from "@/components/LegalFooter";
import CourseBuyButton from "@/components/CourseBuyButton";
import CourseScheduleDisplay from "@/components/CourseScheduleDisplay";
import ProbestundeForm from "@/components/ProbestundeForm";
import B1CourseTracker from "@/components/B1CourseTracker";
import { createClient } from "@/lib/supabase/server";
import { GROUP_COURSE, groupCoursePrice, eurLabel, SITE } from "@/lib/config";
import { B1_COPY } from "@/lib/b1course";
import { PREPLY_BADGES } from "@/lib/landing";
import { PREPLY_STATS, REVIEWS } from "@/lib/reviews";

const BASE = "https://www.germanwithmarvin.com";
const c = B1_COPY.course;

export const metadata: Metadata = {
  title: `${c.metaTitle} — German with Marvin`,
  description: c.metaDescription,
  alternates: { canonical: `${BASE}/b1-course` },
  openGraph: { title: c.metaTitle, description: c.metaDescription, url: `${BASE}/b1-course`, type: "website" },
};

// Echte, prüfungsnahe Bewertungen (keine erfundenen) — Ivan hat seine Prüfung bestanden.
const COURSE_REVIEWS = REVIEWS.filter((r) => ["Ivan", "Beatrice", "Karolina", "Veronika", "agnusdei"].includes(r.name));

function Stars() {
  return <span className="text-[#E3A12F]">★★★★★</span>;
}

export default async function B1CoursePage() {
  // Freie Plätze NUR aus echten Einschreibungen.
  let taken = 0;
  try {
    const supabase = await createClient();
    const { data } = await supabase.rpc("group_course_seats_taken", { p_course: GROUP_COURSE.slug });
    taken = Number(data ?? 0) || 0;
  } catch { /* RPC evtl. noch nicht angewandt → keine Platzanzeige */ }
  const seatsLeft = Math.max(0, GROUP_COURSE.maxSeats - taken);
  const showSeats = taken > 0 && seatsLeft > 0;

  const price = groupCoursePrice();
  const founder = GROUP_COURSE.founderActive;

  return (
    <div className="bg-[#FFF1D2] text-[#3B2922] min-h-screen flex flex-col">
      <B1CourseTracker />
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center">
          <img src="/logo-light.webp" alt="Marvin Graf — German Simplified" className="h-16 md:h-[90px] w-auto object-contain" />
        </Link>
        <PublicNav ctaLabel="Join the course" ctaHref="#book" />
      </header>

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="max-w-3xl mx-auto px-6 pt-6 pb-12 text-center space-y-4">
          <span className="inline-block text-xs tracking-[0.3em] text-[#E3A12F] uppercase font-semibold">{c.eyebrow}</span>
          <h1 className="text-3xl md:text-4xl font-bold text-[#8A3030] leading-tight">{c.h1} <span className="text-[#3B2922]">{c.h1accent}</span></h1>
          <p className="text-[#3B2922]/80 text-lg">{c.sub}</p>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {PREPLY_BADGES.map((b) => (
              <a key={b} href={SITE.preplyUrl} target="_blank" rel="noopener noreferrer" className="text-xs bg-white/70 border border-[#E3A12F]/40 rounded-full px-3 py-1 text-[#8A3030]">{b}</a>
            ))}
          </div>
          <div className="text-sm text-[#3B2922]/70"><Stars /> {PREPLY_STATS.rating} · {PREPLY_STATS.lessons.toLocaleString()} lessons taught · students in {PREPLY_STATS.countries} countries · verified on Preply</div>
          <div className="pt-2">
            <Link href="#book" className="inline-block px-8 py-4 rounded-xl bg-[#8A3030] text-white font-bold text-lg hover:brightness-110">{c.bookButton} →</Link>
            {showSeats && <div className="text-sm text-[#8A3030] font-semibold mt-2">Only {seatsLeft} {c.seatsLeft}</div>}
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-[#F7DEAD]">
          <div className="max-w-3xl mx-auto px-6 py-12 space-y-5">
            <h2 className="text-2xl font-bold text-[#8A3030] text-center">{c.benefitsHeading}</h2>
            <ul className="space-y-2">
              {c.benefits.map((b) => <li key={b} className="flex gap-3 items-start"><span className="text-[#2e7d4f] font-bold mt-0.5">✓</span><span>{b}</span></li>)}
            </ul>
          </div>
        </section>

        {/* Warum anders — Alleinstellung */}
        <section className="max-w-4xl mx-auto px-6 py-12 space-y-6">
          <h2 className="text-2xl font-bold text-[#8A3030] text-center">{c.differentHeading}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {c.different.map((d) => (
              <div key={d.title} className="rounded-2xl bg-white/70 border border-[#E3A12F]/25 p-5">
                <div className="font-bold text-[#8A3030]">{d.title}</div>
                <p className="mt-1.5 text-sm text-[#3B2922]/80">{d.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Komplette App gratis dabei */}
        <section className="bg-[#F7DEAD]">
          <div className="max-w-3xl mx-auto px-6 py-12 space-y-5">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-[#8A3030]">{c.includedHeading}</h2>
              <p className="text-[#3B2922]/80">{c.includedIntro}</p>
            </div>
            <div className="rounded-2xl bg-[#FBF2DA] border border-[#E3A12F]/40 p-6">
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                {c.includedItems.map((it) => (
                  <li key={it} className="flex gap-2 items-start text-sm"><span className="text-[#2e7d4f] font-bold mt-0.5">✓</span><span>{it}</span></li>
                ))}
              </ul>
            </div>
            <p className="text-center text-sm text-[#3B2922]/70">{c.includedNote}</p>
          </div>
        </section>

        {/* For who */}
        <section className="max-w-3xl mx-auto px-6 py-12 space-y-4">
          <h2 className="text-2xl font-bold text-[#8A3030] text-center">{c.forWhoHeading}</h2>
          <div className="space-y-2">
            {c.forWho.map((f) => <div key={f} className="rounded-xl bg-white/70 border border-[#E3A12F]/25 px-4 py-3">{f}</div>)}
          </div>
        </section>

        {/* 8-week outline */}
        <section className="bg-[#F7DEAD]">
          <div className="max-w-3xl mx-auto px-6 py-12 space-y-4">
            <h2 className="text-2xl font-bold text-[#8A3030] text-center">{c.outlineHeading}</h2>
            <div className="space-y-2">
              {c.outline.map((o, i) => (
                <div key={o} className="flex gap-3 items-start rounded-xl bg-white/70 px-4 py-3">
                  <span className="grid place-items-center w-7 h-7 rounded-lg bg-[#8A3030] text-white text-sm font-bold shrink-0">{i + 1}</span>
                  <span>{o}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Schedule */}
        <section className="max-w-3xl mx-auto px-6 py-12 space-y-4">
          <h2 className="text-2xl font-bold text-[#8A3030] text-center">{c.scheduleHeading}</h2>
          <p className="text-center text-sm text-[#3B2922]/70">{c.scheduleNote}</p>
          <CourseScheduleDisplay />
        </section>

        {/* Price + booking */}
        <section id="book" className="bg-[#F7DEAD] scroll-mt-6">
          <div className="max-w-md mx-auto px-6 py-12 space-y-4 text-center">
            <h2 className="text-2xl font-bold text-[#8A3030]">{c.priceHeading}</h2>
            <div className="rounded-2xl bg-[#FBF2DA] border-2 border-[#E3A12F] p-7 space-y-3 shadow-sm">
              <div className="flex items-end justify-center gap-2">
                {founder && <span className="text-xl text-[#3B2922]/50 line-through">{eurLabel(GROUP_COURSE.priceEur)}</span>}
                <span className="text-4xl font-bold text-[#8A3030]">{eurLabel(price)}</span>
              </div>
              {founder && <div className="text-sm text-[#8A3030] font-semibold">{c.priceFounderNote}</div>}
              <p className="text-sm text-[#2e7d4f] font-semibold">+ {GROUP_COURSE.weeks} weeks of full app access included (normally $29/month)</p>
              <p className="text-xs text-[#3B2922]/60">{c.taxNote}</p>
              <CourseBuyButton label={`${c.bookButton} →`} className="w-full py-3.5 rounded-xl bg-[#8A3030] text-white font-bold text-lg hover:brightness-110 disabled:opacity-50" />
              {showSeats && <div className="text-sm text-[#8A3030] font-semibold">Only {seatsLeft} {c.seatsLeft}</div>}
              <p className="text-xs text-[#3B2922]/60">{c.moneyBackNote}</p>
            </div>
            <Link href="#trial" className="inline-block text-[#8A3030] underline underline-offset-2 font-semibold text-sm">{c.trialLessonCta}</Link>
          </div>
        </section>

        {/* Teacher */}
        <section className="max-w-3xl mx-auto px-6 py-12 space-y-4">
          <h2 className="text-2xl font-bold text-[#8A3030] text-center">{c.teacherHeading}</h2>
          <div className="rounded-2xl bg-white/70 border border-[#E3A12F]/25 p-6 space-y-4">
            <div className="flex items-center gap-4">
              <img src="/teachers/marvin.jpg" alt="Marvin Graf" className="w-20 h-20 rounded-full object-cover" />
              <div>
                <div className="font-bold text-[#8A3030] text-lg">Marvin Graf</div>
                <div className="text-sm text-[#3B2922]/70">Teaching German full-time for 4+ years, with thousands of 1-on-1 hours. Levels A1–C1.</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {PREPLY_BADGES.map((b) => (
                <span key={b} className="text-xs bg-[#8A3030]/10 border border-[#8A3030]/20 rounded-full px-3 py-1 text-[#8A3030] font-semibold">{b}</span>
              ))}
            </div>
            <div className="text-sm text-[#3B2922]/70"><Stars /> {PREPLY_STATS.rating} · {PREPLY_STATS.reviews} reviews · {PREPLY_STATS.lessons.toLocaleString()} lessons taught · verified on Preply</div>
          </div>
        </section>

        {/* Reviews */}
        <section className="bg-[#F7DEAD]">
          <div className="max-w-3xl mx-auto px-6 py-12 space-y-4">
            <h2 className="text-2xl font-bold text-[#8A3030] text-center">{c.reviewsHeading}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {COURSE_REVIEWS.map((r) => (
                <div key={r.name + r.date} className="rounded-xl bg-white/70 border border-[#E3A12F]/25 p-4">
                  <div className="text-sm text-[#3B2922]/85">&ldquo;{r.text}&rdquo;</div>
                  <div className="text-xs text-[#3B2922]/60 mt-2"><Stars /> {r.name} · {r.date}</div>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-[#3B2922]/55">Real reviews from Marvin&apos;s <a href={SITE.preplyUrl} target="_blank" rel="noopener noreferrer" className="underline">Preply profile</a>.</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 py-12 space-y-3">
          <h2 className="text-2xl font-bold text-[#8A3030] text-center mb-2">{c.faqHeading}</h2>
          {c.faq.map((f) => (
            <details key={f.q} className="rounded-xl bg-white/70 border border-[#E3A12F]/25 p-4">
              <summary className="font-semibold text-[#8A3030] cursor-pointer">{f.q}</summary>
              <p className="text-sm text-[#3B2922]/80 mt-2">{f.a}</p>
            </details>
          ))}
        </section>

        {/* Free trial lesson */}
        <section id="trial" className="bg-[#F7DEAD] scroll-mt-6">
          <div className="max-w-md mx-auto px-6 py-12 space-y-4 text-center">
            <span className="inline-block text-xs tracking-[0.3em] text-[#E3A12F] uppercase font-semibold">{B1_COPY.probestunde.eyebrow}</span>
            <h2 className="text-2xl font-bold text-[#8A3030]">{B1_COPY.probestunde.h1}</h2>
            <p className="text-[#3B2922]/80 text-sm">{B1_COPY.probestunde.sub}</p>
            <ProbestundeForm />
          </div>
        </section>
      </main>

      <LegalFooter />
    </div>
  );
}
