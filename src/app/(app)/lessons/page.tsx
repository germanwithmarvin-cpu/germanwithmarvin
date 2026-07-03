"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Lesson } from "@/lib/data";
import { getLessons } from "@/lib/lessons";
import { loadProgress } from "@/lib/progress";
import { getAccess, canAccessVideoLevel, type AccessTier } from "@/lib/access";
import { SITE } from "@/lib/config";

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
        <h1 className="text-2xl font-bold">Your learning path</h1>
        <p className="text-cream-dim text-sm">
          Follow the path step by step. Finish a lesson to unlock the next one.
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

      <div className="space-y-4">
        {lessons.map((l, i) => {
          const isDone = completed.includes(l.id);
          // Eine Lektion ist freigeschaltet, wenn es die erste ist
          // oder die vorherige bereits abgeschlossen wurde.
          const prevDone = i === 0 || completed.includes(lessons[i - 1].id);
          const seqLocked = !isDone && !prevDone;
          // Level-Sperre: A2–B2 nur mit Abo/Trial.
          const levelLocked = !canAccessVideoLevel(tier, l.level);
          const locked = seqLocked || levelLocked;

          const inner = (
            <div
              className={`card p-5 flex items-center justify-between gap-4 transition ${
                locked ? "opacity-60" : "hover:border-gold/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="grid place-items-center w-9 h-9 rounded-full border border-gold/40 text-gold-bright text-sm font-semibold shrink-0">
                  {i + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gold/20 text-gold-bright">{l.level}</span>
                    <span className="text-xs text-cream-dim">{l.topic} · {l.durationMin} min</span>
                    {levelLocked && <span className="text-xs text-gold-bright">· membership</span>}
                  </div>
                  <div className="text-lg font-semibold mt-1">{l.title}</div>
                  <div className="text-sm text-cream-dim">{l.description}</div>
                </div>
              </div>
              <div className="text-2xl shrink-0">{isDone ? "✅" : locked ? "🔒" : "▶️"}</div>
            </div>
          );

          // Level-gesperrt: Vokabel-Nutzer → Skool; sonst → Code einlösen.
          if (levelLocked) {
            return tier === "vocab" ? (
              <a key={l.id} href={SITE.skoolUrl} target="_blank" rel="noopener noreferrer" title="Watch on Skool">{inner}</a>
            ) : (
              <Link key={l.id} href="/redeem" title="Redeem your access code">{inner}</Link>
            );
          }
          return seqLocked ? (
            <div key={l.id} title="Finish the previous lesson to unlock this one.">{inner}</div>
          ) : (
            <Link key={l.id} href={`/lessons/${l.id}`}>{inner}</Link>
          );
        })}
      </div>
    </div>
  );
}
