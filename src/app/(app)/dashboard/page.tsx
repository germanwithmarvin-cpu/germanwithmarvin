"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import { type Lesson } from "@/lib/data";
import { getLessons } from "@/lib/lessons";
import { loadProgress, type Progress } from "@/lib/progress";
import { countDueToday, getLearnedSummary } from "@/lib/study";
import { getStats } from "@/lib/stats";
import { getMyAvatar } from "@/lib/profile";
import { getAccess, type Access } from "@/lib/access";
import { createClient } from "@/lib/supabase/client";
import { checkoutUrl, priceLabel } from "@/lib/config";
import Lena from "@/components/training/Lena";

// Rang anhand gelernter Karten (wie im Profil) – spielerische Stufe im Hero.
const RANKS: [number, string, string][] = [
  [0, "Newcomer", "🌱"], [50, "Explorer", "🧭"], [200, "Adventurer", "🎒"],
  [500, "Pathfinder", "🗺️"], [1000, "Wordsmith", "🔥"], [1500, "Master", "👑"],
];
function rankFor(cards: number): { name: string; icon: string } {
  let i = 0;
  for (let k = 0; k < RANKS.length; k++) if (cards >= RANKS[k][0]) i = k;
  return { name: RANKS[i][1], icon: RANKS[i][2] };
}

const TILES = [
  { href: "/lessons", icon: "🎬", label: "Lessons", sub: "Watch & practice" },
  { href: "/decks", icon: "🗂️", label: "Flashcards", sub: "Learn vocabulary" },
  { href: "/stories", icon: "📖", label: "Stories", sub: "Read at your level" },
  { href: "/review", icon: "🔁", label: "Review", sub: "Refresh known cards" },
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
  const [streak, setStreak] = useState(0);
  const [learned, setLearned] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    loadProgress().then(setProgress);
    getLessons().then(setLessons);
    getAccess().then(setAccess);
    countDueToday().then(setDue);
    getStats().then((s) => setStreak(s.streak));
    getLearnedSummary().then((s) => setLearned(s.total));
    getMyAvatar().then(setAvatarUrl);

    createClient().auth.getUser().then(({ data: { user } }) => {
      const full = (user?.user_metadata?.full_name as string) || "";
      const first = full.trim().split(/\s+/)[0];
      if (first) setFirstName(first);
      setEmail(user?.email ?? undefined);
    });

    setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
  }, []);

  const done = progress.completedLessons.length;
  const total = lessons.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const nextLesson = lessons.find((l) => !progress.completedLessons.includes(l.id));
  const rank = rankFor(learned);

  return (
    <div className="space-y-7">
      {/* ---------- Begrüßungs-Hero ---------- */}
      <div className="card study-card p-6 md:p-7 relative overflow-hidden">
        <div className="absolute -right-16 -top-20 w-64 h-64 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--gold) 26%, transparent), transparent 70%)" }} aria-hidden="true" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-20 h-20 shrink-0 rounded-full p-[3px]" style={{ background: "linear-gradient(150deg, var(--gold-bright), var(--bordeaux))" }}>
            <div className="w-full h-full rounded-full overflow-hidden bg-surface grid place-items-center">
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-3xl">{rank.icon}</span>}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold">Hi {firstName || "there"}! <span className="align-middle">👋</span></h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold" style={{ background: "color-mix(in srgb, var(--gold) 22%, var(--surface))", border: "1px solid color-mix(in srgb, var(--gold) 45%, transparent)", color: "var(--bordeaux)" }}>
                <span>{rank.icon}</span> {rank.name}
              </span>
              <span className="text-sm text-cream-dim">Keep the momentum going.</span>
            </div>
          </div>
          {/* Mini-Statistik */}
          <div className="flex gap-2 sm:gap-3 shrink-0">
            <MiniStat icon="🔥" value={streak} label="day streak" />
            <MiniStat icon="🎴" value={learned} label="cards" />
            <MiniStat icon="⭐" value={progress.xp} label="XP" />
          </div>
        </div>
        {total > 0 && (
          <div className="relative mt-5">
            <div className="flex justify-between text-xs text-cream-dim mb-1.5">
              <span>Lesson progress</span><span className="text-gold-bright font-medium">{done}/{total} · {pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-bordeaux-deep/60 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-gold to-gold-bright transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Lena mit dem Tipp des Tages – eine Figur, die mitlernt, wirkt anders als ein Hinweiskasten */}
      {tip && (
        <div className="flex items-end gap-3 sm:gap-4">
          <Lena mood="wave" size={190} className="shrink-0 -mb-1" />
          <div className="relative flex-1 rounded-2xl px-4 py-3.5 mb-3"
            style={{ background: "color-mix(in srgb, var(--gold) 14%, var(--surface))", border: "1px solid color-mix(in srgb, var(--gold) 28%, transparent)" }}>
            {/* Sprechblasen-Zipfel nach links */}
            <span className="absolute -left-2 bottom-5 w-4 h-4 rotate-45"
              style={{ background: "color-mix(in srgb, var(--gold) 14%, var(--surface))", borderLeft: "1px solid color-mix(in srgb, var(--gold) 28%, transparent)", borderBottom: "1px solid color-mix(in srgb, var(--gold) 28%, transparent)" }} />
            <div className="text-[13px] font-semibold text-gold-bright mb-0.5">Lena</div>
            <p className="text-[15px] leading-relaxed text-cream">{tip}</p>
          </div>
        </div>
      )}

      {/* Paywall-Banner */}
      {access && access.tier === "none" && (
        <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-gold/30">
          <div>
            <div className="font-semibold">🔓 Unlock full access</div>
            <div className="text-sm text-cream-dim mt-0.5">
              Get <span className="text-cream">German Simplified — All-Access</span>: all videos, exercises, flashcards & stories for {priceLabel()}/month. Cancel anytime.
            </div>
          </div>
          <div className="flex flex-col items-stretch sm:items-end gap-1.5 shrink-0">
            <a href={checkoutUrl(email)} className="btn-gold px-5 py-2.5 text-sm text-center whitespace-nowrap">Get full access — {priceLabel()}/mo</a>
            <Link href="/redeem" className="text-xs text-cream-dim hover:text-cream underline underline-offset-4 text-center">I have a code from Preply / Skool</Link>
          </div>
        </div>
      )}

      {/* ---------- Weitermachen ---------- */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Continue where you left off</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card p-5 flex flex-col relative overflow-hidden">
            <div className="absolute right-4 top-4 text-3xl opacity-20">🎬</div>
            <div className="text-sm text-cream-dim">Next lesson</div>
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

          <div className="card p-5 flex flex-col relative overflow-hidden">
            <div className="absolute right-4 top-4 text-3xl opacity-20">🗂️</div>
            <div className="text-sm text-cream-dim">Flashcards for today</div>
            <div className="flex items-baseline gap-2 mt-1 flex-1">
              <span className="text-4xl font-bold text-gold-bright">{due ?? "…"}</span>
              <span className="text-cream-dim">card{due === 1 ? "" : "s"} due</span>
            </div>
            {due === 0 && <p className="text-sm text-cream-dim mb-3">All caught up — new cards unlock daily. 🎉</p>}
            <Link href="/study/today" className="btn-gold px-5 py-2.5 mt-1 text-center">{due === 0 ? "Study anyway" : "Study now →"}</Link>
          </div>
        </div>
      </div>

      {/* ---------- Schnellzugriff ---------- */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Jump back in</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {TILES.map((t) => (
            <Link key={t.href} href={t.href} className="card p-5 hover:border-gold/50 transition group">
              <div className="w-12 h-12 grid place-items-center rounded-2xl text-2xl transition group-hover:scale-105" style={{ background: "color-mix(in srgb, var(--gold) 16%, var(--surface))", border: "1px solid color-mix(in srgb, var(--gold) 30%, transparent)" }}>{t.icon}</div>
              <div className="font-semibold mt-3 group-hover:text-cream">{t.label}</div>
              <div className="text-xs text-cream-dim">{t.sub}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div className="rounded-xl px-3 py-2 text-center min-w-[64px]" style={{ background: "color-mix(in srgb, var(--gold) 10%, var(--surface))", border: "1px solid color-mix(in srgb, var(--gold) 22%, transparent)" }}>
      <div className="text-lg font-bold text-gold-bright leading-none">{icon} {value}</div>
      <div className="text-[11px] text-cream-dim mt-1">{label}</div>
    </div>
  );
}
