/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Metadata } from "next";
import PublicNav from "@/components/PublicNav";
import LeadMagnet from "@/components/LeadMagnet";
import { SITE } from "@/lib/config";
import { PREPLY_STATS } from "@/lib/reviews";
import { PREPLY_BADGES } from "@/lib/landing";

export const metadata: Metadata = {
  title: "Free A1 German story (PDF) | German with Marvin",
  description:
    "Get a free A1 German story as a PDF — a gentle, fun way to start reading German from day one. Enter your email and we'll send it over.",
  alternates: { canonical: "https://www.germanwithmarvin.com/free-a1-stories" },
};

export default function Page() {
  return (
    <div className="bg-[#FFF1D2] text-[#3B2922] min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center">
          <img src="/logo-light.png" alt="Marvin Graf — German Simplified" className="h-[104px] md:h-[125px] w-auto object-contain" />
        </Link>
        <PublicNav />
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-6 pb-16">
        <div className="text-center">
          <span className="inline-block text-xs tracking-[0.3em] text-[#E3A12F] uppercase font-semibold mb-3">Free gift</span>
          <h1 className="text-3xl sm:text-4xl font-bold leading-[1.15]">
            A free A1 German story,<br /><span className="text-[#8A3030]">to read from day one.</span>
          </h1>
          <p className="mt-4 text-[#3B2922]/80">
            A short, illustrated story at beginner level — the gentle, fun way to start reading real German.
            Pop in your email and we&rsquo;ll send the PDF straight over.
          </p>
        </div>

        <div className="mt-8">
          <LeadMagnet source="a1-stories-page" />
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {PREPLY_BADGES.map((b) => (
            <a key={b} href={SITE.preplyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full bg-[#8A3030]/10 border border-[#8A3030]/20 px-3 py-1.5 text-xs font-bold text-[#8A3030] hover:bg-[#8A3030]/15 transition">
              {b}
            </a>
          ))}
        </div>
        <p className="mt-3 text-center text-sm text-[#3B2922]/60">
          ★ {PREPLY_STATS.rating} · {PREPLY_STATS.lessons.toLocaleString("en-US")} lessons taught · students in {PREPLY_STATS.countries} countries
        </p>

        <div className="mt-12 text-center border-t border-black/10 pt-10">
          <h2 className="text-xl font-bold">Ready for the full path to B2?</h2>
          <p className="mt-2 text-sm text-[#3B2922]/75">Video lessons, 2,600+ flashcards, stories and exercises — try everything free for 5 days.</p>
          <Link href="/register" className="mt-5 inline-block rounded-xl bg-[#8A3030] text-white px-8 py-4 text-lg font-semibold hover:brightness-110 transition shadow-sm">
            Start your 5-day free trial
          </Link>
        </div>
      </main>

      <footer className="bg-[#F7DEAD] border-t border-black/5 py-8 text-center text-sm text-[#3B2922]/70">
        <div>© {new Date().getFullYear()} German with Marvin LLC · German Simplified</div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <a href={`mailto:${SITE.contactEmail}`} className="hover:text-[#3B2922] underline underline-offset-4">Contact · Kontakt</a>
          <Link href="/pricing" className="hover:text-[#3B2922] underline underline-offset-4">Pricing</Link>
          <Link href="/impressum" className="hover:text-[#3B2922] underline underline-offset-4">Legal Notice · Impressum</Link>
          <Link href="/datenschutz" className="hover:text-[#3B2922] underline underline-offset-4">Privacy · Datenschutz</Link>
        </div>
      </footer>
    </div>
  );
}
