"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Lesson } from "@/lib/data";
import { getLessons } from "@/lib/lessons";
import { loadProgress } from "@/lib/progress";
import { getAccess, type AccessTier } from "@/lib/access";
import Paywall from "@/components/Paywall";

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
  const [tier, setTier] = useState<AccessTier>("none");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAccess().then((a) => setTier(a.tier));
    Promise.all([loadProgress(), getLessons()]).then(([p, ls]) => {
      setCompleted(p.completedLessons);
      setLessons(ls);
      setLoading(false);
    });
  }, []);

  if (!loading && tier !== "full") return <Paywall title="Unlock all video lessons" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Video lessons</h1>
        <p className="text-cream-dim text-sm">
          Browse all lessons by level — jump into any lesson you like, in any order.
        </p>
      </div>

      {loading && <p className="text-sm text-cream-dim">Loading lessons…</p>}
      {!loading && lessons.length === 0 && (
        <p className="text-sm text-cream-dim">No lessons yet. Check back soon!</p>
      )}

      <div className="space-y-8">
        {LEVELS.map((lv) => {
          const items = lessons.filter((l) => l.level === lv);
          if (items.length === 0) return null;

          return (
            <section key={lv} className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-gold-bright">{lv === "Intro" ? "⭐ Essentials" : lv}</h2>
                <span className="text-sm text-cream-dim">{LEVEL_LABEL[lv]}</span>
              </div>

              <div className="space-y-3">
                {items.map((l) => {
                  const isDone = completed.includes(l.id);
                  const hasQuiz = l.quizEnabled && (l.exercises.length > 0 || l.quiz.length > 0);
                  return (
                    <Link key={l.id} href={`/lessons/${l.id}`}>
                      <div className="card p-5 flex items-center justify-between gap-4 transition hover:border-gold/50">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-cream-dim">{l.topic} · {l.durationMin} min</span>
                            {hasQuiz && <span className="text-xs text-gold-bright">· ⚡ exercises</span>}
                          </div>
                          <div className="text-lg font-semibold mt-1">{l.title}</div>
                          <div className="text-sm text-cream-dim">{l.description}</div>
                        </div>
                        <div className="text-2xl shrink-0">{isDone ? "✅" : "▶️"}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
