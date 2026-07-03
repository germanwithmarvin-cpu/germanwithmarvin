"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TROPHIES, type Lesson } from "@/lib/data";
import { getLessons } from "@/lib/lessons";
import { loadProgress, type Progress } from "@/lib/progress";
import DueToday from "@/components/DueToday";
import { getAccess, type Access } from "@/lib/access";

export default function Dashboard() {
  const [progress, setProgress] = useState<Progress>({ completedLessons: [], xp: 0 });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [access, setAccess] = useState<Access | null>(null);

  useEffect(() => {
    loadProgress().then(setProgress);
    getLessons().then(setLessons);
    getAccess().then(setAccess);
  }, []);

  const done = progress.completedLessons.length;
  const total = lessons.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const nextLesson = lessons.find((l) => !progress.completedLessons.includes(l.id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Hi there! 👋</h1>
        <p className="text-cream-dim">Great to see you back. Let&apos;s keep going!</p>
      </div>

      {/* Zugangsstatus */}
      {access && (
        <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {access.tier === "subscribed" ? (
            <span className="text-sm">✓ Full access active — all levels, videos and vocabulary.</span>
          ) : access.tier === "vocab" ? (
            <span className="text-sm">✓ Vocabulary access active. Your video course is on Skool.</span>
          ) : access.tier === "trial" ? (
            <span className="text-sm">
              🎁 Free trial: <span className="text-gold-bright font-medium">{access.trialDaysLeft} day{access.trialDaysLeft === 1 ? "" : "s"} left</span> of full access. A1 stays free forever.
            </span>
          ) : (
            <span className="text-sm">A1 is free for you. Got a code from Preply or Skool? Redeem it for full access.</span>
          )}
          {access.tier !== "subscribed" && access.tier !== "vocab" && (
            <Link href="/redeem" className="btn-gold px-4 py-2 text-sm whitespace-nowrap shrink-0">
              Redeem access code
            </Link>
          )}
        </div>
      )}

      {/* Heutige Wiederholung (Flashcards) */}
      <DueToday />

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="text-3xl font-bold text-gold-bright">{progress.xp}</div>
          <div className="text-sm text-cream-dim">XP earned</div>
        </div>
        <div className="card p-5">
          <div className="text-3xl font-bold text-gold-bright">{done}/{total}</div>
          <div className="text-sm text-cream-dim">Lessons completed</div>
        </div>
        <div className="card p-5">
          <div className="text-3xl font-bold text-gold-bright">
            {TROPHIES.filter((t) => progress.xp >= t.unlockedAtXp).length}
          </div>
          <div className="text-sm text-cream-dim">Trophies unlocked</div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex justify-between text-sm mb-2">
          <span>Your progress</span>
          <span className="text-gold-bright">{pct}%</span>
        </div>
        <div className="h-3 rounded-full bg-bordeaux-deep/70 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-gold to-gold-bright" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {nextLesson && (
        <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-gold-bright uppercase tracking-wider">Continue learning</div>
            <div className="text-lg font-semibold mt-1">{nextLesson.title}</div>
            <div className="text-sm text-cream-dim">{nextLesson.level} · {nextLesson.durationMin} min</div>
          </div>
          <Link href={`/lessons/${nextLesson.id}`} className="btn-gold px-5 py-2.5 text-center">
            Start lesson
          </Link>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Trophies</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {TROPHIES.map((t) => {
            const unlocked = progress.xp >= t.unlockedAtXp;
            return (
              <div key={t.id} className={`card p-5 text-center ${unlocked ? "" : "opacity-40"}`}>
                <div className="text-4xl">{unlocked ? t.icon : "🔒"}</div>
                <div className="font-medium mt-2">{t.name}</div>
                <div className="text-xs text-cream-dim mt-1">{t.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
