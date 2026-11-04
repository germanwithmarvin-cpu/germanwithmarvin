/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicNav from "@/components/PublicNav";
import LegalFooter from "@/components/LegalFooter";
import FreeExamRunner from "@/components/FreeExamRunner";

const BASE = "https://www.germanwithmarvin.com";
const LEVELS = ["A1", "A2", "B1", "B2"] as const;
type Lvl = (typeof LEVELS)[number];

function normalize(raw: string): Lvl | null {
  const up = raw.toUpperCase();
  return (LEVELS as readonly string[]).includes(up) ? (up as Lvl) : null;
}

export function generateStaticParams() {
  return LEVELS.map((l) => ({ level: l.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ level: string }> }): Promise<Metadata> {
  const { level } = await params;
  const lvl = normalize(level);
  if (!lvl) return { title: "Free German exam — German with Marvin" };
  const title = `Free ${lvl} German Practice Exam (Goethe / telc style) — German with Marvin`;
  const description = `Take a free ${lvl} German mock exam online — Reading, Listening and Writing. Reading & Listening graded instantly, no sign-up. Then unlock your writing correction and study plan.`;
  const url = `${BASE}/free-exam/${lvl.toLowerCase()}`;
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title: `Free ${lvl} German practice exam`, description, url, type: "website", images: [{ url: `${BASE}/ads/level-test-og.jpg`, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: `Free ${lvl} German practice exam`, description },
  };
}

export default async function FreeExamLevelPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const lvl = normalize(level);
  if (!lvl) notFound();

  return (
    <div className="bg-[#FFF1D2] text-[#3B2922] min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center">
          <img src="/logo-light.png" alt="Marvin Graf — German Simplified" className="h-16 md:h-[90px] w-auto object-contain" />
        </Link>
        <PublicNav ctaLabel="Start free" ctaHref="/register?src=free-exam" />
      </header>
      <main className="flex-1 w-full">
        <FreeExamRunner level={lvl} />
      </main>
      <LegalFooter />
    </div>
  );
}
