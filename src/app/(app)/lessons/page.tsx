"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Lesson } from "@/lib/data";
import { getLessons } from "@/lib/lessons";
import { loadProgress } from "@/lib/progress";
import { getAccess, canAccessVideoLevel, type AccessTier } from "@/lib/access";
import { SITE } from "@/lib/config";

// Übergeordnete Kategorien (Level) in fester Reihenfolge – "Intro" ganz oben.
const LEVELS: Lesson["level"][] = ["Intro", "A1", "A2", "B1", "B2", "C1"];
const LEVEL_LABEL: Record<Lesson["level"], string> = {
  Intro: "General lessons & study tips",
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper intermediate",
  C1: "Advanced",
};

export default function LessonsPage() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [tier, setTier] = useState<AccessTier>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAccess().then((a) => setTier(a.tier));
    Promise.all([loadProgress(), getLessons()]).then(([p, ls]) => {
      setCompleted(p.completedLessons);
      setLessons(ls);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Video lessons</h1>
        <p className="text-cream-dim text-sm">
          Browse all lessons by level — jump into any lesson you like, in any order.
        </p>
      </div>

      {/* Nur-Vokabel-Nutzer (Skool): Videos liegen auf Skool. */}
      {tier === "vocab" && (
        <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-sm">🎬 Your video course lives on Skool. Here you have the full vocabulary trainer.</span>
          <a href={SITE.skoolUrl} target="_blank" rel="noopener noreferrer" className="btn-gold px-4 py-2 text-sm whitespace-nowrap">Open on Skool</a>
        </div>
      )}

      {loading && <p className="text-sm text-cream-dim">Loading lessons…</p>}
      {!loading && lessons.length === 0 && (
        <p className="text-sm text-cream-dim">No lessons yet. Check back soon!</p>
      )}

      {/* Nach Level gruppiert; alle Lektionen sichtbar & anklickbar (A2–B2 hinter Code). */}
      <div className="space-y-8">
        {LEVELS.map((lv) => {
          const items = lessons.filter((l) => l.level === lv);
          if (items.length === 0) return null;
          const levelLocked = !canAccessVideoLevel(tier, lv);

          return (
            <section key={lv} className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-gold-bright">{lv === "Intro" ? "⭐ Essentials" : lv}</h2>
                <span className="text-sm text-cream-dim">{LEVEL_LABEL[lv]}</span>
                {levelLocked && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gold/15 text-gold-bright">
                    {tier === "vocab" ? "🎬 on Skool" : "🔒 needs an access code"}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {items.map((l) => {
                  const isDone = completed.includes(l.id);
                  const hasQuiz = l.quizEnabled && (l.exercises.length > 0 || l.quiz.length > 0);

                  const inner = (
                    <div className={`card p-5 flex items-center justify-between gap-4 transition ${levelLocked ? "opacity-60" : "hover:border-gold/50"}`}>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-cream-dim">{l.topic} · {l.durationMin} min</span>
                          {hasQuiz && <span className="text-xs text-gold-bright">· ⚡ exercises</span>}
                        </div>
                        <div className="text-lg font-semibold mt-1">{l.title}</div>
                        <div className="text-sm text-cream-dim">{l.description}</div>
                      </div>
                      <div className="text-2xl shrink-0">{isDone ? "✅" : levelLocked ? "🔒" : "▶️"}</div>
                    </div>
                  );

                  // A2–B2 ohne Zugang: Vokabel-Nutzer → Skool, sonst → Code einlösen.
                  if (levelLocked) {
                    return tier === "vocab" ? (
                      <a key={l.id} href={SITE.skoolUrl} target="_blank" rel="noopener noreferrer" title="Watch on Skool">{inner}</a>
                    ) : (
                      <Link key={l.id} href="/redeem" title="Redeem your access code">{inner}</Link>
                    );
                  }
                  return <Link key={l.id} href={`/lessons/${l.id}`}>{inner}</Link>;
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
