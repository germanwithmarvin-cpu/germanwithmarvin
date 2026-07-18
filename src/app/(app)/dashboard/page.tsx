"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type Lesson } from "@/lib/data";
import { getLessons } from "@/lib/lessons";
import { loadProgress, type Progress } from "@/lib/progress";
import { countDueToday } from "@/lib/study";
import { getAccess, type Access } from "@/lib/access";
import { createClient } from "@/lib/supabase/client";
import { checkoutUrl, priceLabel } from "@/lib/config";

// Schnellzugriff-Kacheln zu den Hauptbereichen.
const TILES = [
  { href: "/lessons", icon: "🎬", label: "Lessons", sub: "Watch & practice" },
  { href: "/decks", icon: "🗂️", label: "Flashcards", sub: "Learn vocabulary" },
  { href: "/stories", icon: "📖", label: "Stories", sub: "Read at your level" },
  { href: "/stats", icon: "📊", label: "Statistics", sub: "See your progress" },
];

// Rotierende Lern-Tipps – bei jedem Laden erscheint ein zufälliger.
const TIPS = [
  "Study a little every day — 15 focused minutes beat a two-hour cram session.",
  "Say new words out loud. Hearing yourself helps them stick.",
  "Learn whole phrases, not just single words — you’ll sound natural faster.",
  "Review right before bed; your brain consolidates language while you sleep.",
  "Mistakes are progress. Every error you fix is a word you’ll never forget.",
  "Label things around your home in German — fridge, door, mirror, table.",
  "Change your phone’s language to German for a free daily workout.",
  "Don’t translate word-for-word — try to think directly in German.",
  "Listen to German podcasts or music, even in the background.",
  "Focus on the most common words first — they cover most conversations.",
  "Speak from day one. Perfect grammar can wait; communication can’t.",
  "Keep a small notebook for new words you meet in the wild.",
  "Re-watch a lesson without subtitles once you’ve understood it.",
  "Set a tiny daily goal — one lesson or ten flashcards — and keep the streak.",
  "Learn nouns together with their article (der/die/das). Always.",
  "Shadowing: repeat a sentence right after you hear it, copying the rhythm.",
  "Use new words in your own sentences — active use beats passive reading.",
  "Celebrate small wins. Motivation is the real secret to fluency.",
];

export default function Dashboard() {
  const [progress, setProgress] = useState<Progress>({ completedLessons: [], xp: 0 });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [access, setAccess] = useState<Access | null>(null);
  const [due, setDue] = useState<number | null>(null);
  const [firstName, setFirstName] = useState("");
  const [tip, setTip] = useState<string | null>(null);
  const [email, setEmail] = useState<string | undefined>();

  useEffect(() => {
    loadProgress().then(setProgress);
    getLessons().then(setLessons);
    getAccess().then(setAccess);
    countDueToday().then(setDue);

    // Vornamen + Konto-Infos holen (Name aus der Registrierung; ID/E-Mail für den Checkout).
    createClient().auth.getUser().then(({ data: { user } }) => {
      const full = (user?.user_metadata?.full_name as string) || "";
      const first = full.trim().split(/\s+/)[0];
      if (first) setFirstName(first);
      setEmail(user?.email ?? undefined);
    });

    // Zufälligen Tipp erst nach dem Mount setzen (verhindert Hydration-Konflikte).
    setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
  }, []);

  const done = progress.completedLessons.length;
  const total = lessons.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const nextLesson = lessons.find((l) => !progress.completedLessons.includes(l.id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Hi {firstName || "there"}! 👋</h1>
        <p className="text-cream-dim mt-1">
          {tip ? <><span className="text-gold-bright">💡 Tip:</span> {tip}</> : "Great to see you back. Let’s keep going!"}
        </p>
      </div>

      {/* Paywall-Banner: Konten ohne Vollzugang zum Abschluss bewegen */}
      {access && access.tier === "none" && (
        <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-gold/30">
          <div>
            <div className="font-semibold">🔓 Unlock full access</div>
            <div className="text-sm text-cream-dim mt-0.5">
              Get <span className="text-cream">German Simplified — All-Access</span>: all videos, exercises,
              flashcards & stories for {priceLabel()}/month. Cancel anytime.
            </div>
          </div>
          <div className="flex flex-col items-stretch sm:items-end gap-1.5 shrink-0">
            <a href={checkoutUrl(email)} className="btn-gold px-5 py-2.5 text-sm text-center whitespace-nowrap">
              Get full access — {priceLabel()}/mo
            </a>
            <Link href="/redeem" className="text-xs text-cream-dim hover:text-cream underline underline-offset-4 text-center">
              I have a code from Preply / Skool
            </Link>
          </div>
        </div>
      )}

      {/* HERO: Weitermachen */}
      <div className="card p-6 md:p-7 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full" style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--gold) 22%, transparent), transparent 70%)" }} aria-hidden="true" />
        <div className="relative">
          <div className="text-xs uppercase tracking-[0.2em] text-gold-bright">Continue where you left off</div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            {/* Nächste Lektion */}
            <div className="rounded-xl bg-bordeaux-deep/40 border border-gold/15 p-5 flex flex-col">
              <div className="text-sm text-cream-dim">🎬 Next lesson</div>
              {nextLesson ? (
                <>
                  <div className="text-lg font-semibold mt-1 flex-1">{nextLesson.title}</div>
                  <div className="text-sm text-cream-dim">{nextLesson.level} · {nextLesson.durationMin} min</div>
                  <Link href={`/lessons/${nextLesson.id}`} className="btn-gold px-5 py-2.5 mt-3 text-center">Start lesson →</Link>
                </>
              ) : (
                <>
                  <div className="text-lg font-semibold mt-1 flex-1">All lessons done! 🎉</div>
                  <Link href="/lessons" className="btn-outline px-5 py-2.5 mt-3 text-center">Review lessons</Link>
                </>
              )}
            </div>

            {/* Fällige Karten */}
            <div className="rounded-xl bg-bordeaux-deep/40 border border-gold/15 p-5 flex flex-col">
              <div className="text-sm text-cream-dim">🗂️ Flashcards for today</div>
              <div className="flex items-baseline gap-2 mt-1 flex-1">
                <span className="text-4xl font-bold text-gold-bright">{due ?? "…"}</span>
                <span className="text-cream-dim">card{due === 1 ? "" : "s"} due</span>
              </div>
              {due === 0 ? (
                <p className="text-sm text-cream-dim mb-3">All caught up — new cards unlock daily. 🎉</p>
              ) : null}
              <Link href="/study/today" className="btn-gold px-5 py-2.5 mt-1 text-center">
                {due === 0 ? "Study anyway" : "Study now →"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Schnellzugriff */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Jump back in</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {TILES.map((t) => (
            <Link key={t.href} href={t.href} className="card p-5 hover:border-gold/50 transition group">
              <div className="text-3xl">{t.icon}</div>
              <div className="font-semibold mt-2 group-hover:text-cream">{t.label}</div>
              <div className="text-xs text-cream-dim">{t.sub}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Kompakter Fortschritt */}
      <div className="card p-5">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-cream-dim">Your lesson progress</span>
          <span className="text-gold-bright font-medium">{done} / {total} · {pct}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-bordeaux-deep/70 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-gold to-gold-bright transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-sm text-cream-dim mt-3">⭐ {progress.xp} XP earned</div>
      </div>
    </div>
  );
}
