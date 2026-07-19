"use client";

import { useEffect, useState } from "react";
import type { Lesson } from "@/lib/data";
import { getLessons } from "@/lib/lessons";
import { loadProgress } from "@/lib/progress";
import { getAccess, type AccessTier } from "@/lib/access";
import Paywall from "@/components/Paywall";
import { PathMap, topicEmoji, type PathItem } from "@/components/PathMap";

// Level in fester Reihenfolge – "Intro" (Essentials) ganz oben.
const LEVELS: Lesson["level"][] = ["Intro", "A1", "A2", "B1", "B2", "C1"];
const LEVEL_LABEL: Record<Lesson["level"], string> = {
  Intro: "Start here & study tips",
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

  // Alle Lektionen in Level-Reihenfolge aneinandergereiht = ein Pfad.
  const ordered = LEVELS.flatMap((lv) => lessons.filter((l) => l.level === lv));
  const doneSet = new Set(completed);
  const firstIncomplete = ordered.findIndex((l) => !doneSet.has(l.id));

  // PathItems: Lektions-Knoten + 👑-Pokal am Ende jedes Levels.
  const items: PathItem[] = [];
  let prevLevel: Lesson["level"] | null = null;
  ordered.forEach((l, i) => {
    const done = doneSet.has(l.id);
    items.push({
      kind: "node",
      id: l.id,
      href: `/lessons/${l.id}`,
      emoji: topicEmoji(l.topic || l.title),
      title: l.title,
      sub: `${l.durationMin} min`,
      state: done ? "done" : i === firstIncomplete ? "current" : "normal",
      frac: done ? 1 : 0,
      firstOfLevel: l.level !== prevLevel,
      level: l.level === "Intro" ? "⭐" : l.level,
      levelLabel: LEVEL_LABEL[l.level],
    });
    prevLevel = l.level;
    const next = ordered[i + 1];
    const levelEnds = !next || next.level !== l.level;
    if (levelEnds) {
      items.push({
        kind: "trophy",
        id: `t-${i}`,
        earned: ordered.slice(0, i + 1).every((x) => doneSet.has(x.id)),
        icon: "👑",
        name: l.level === "Intro" ? "Essentials done" : `${l.level} Master`,
        champion: true,
      });
    }
  });

  const doneCount = ordered.filter((l) => doneSet.has(l.id)).length;
  const pct = ordered.length ? Math.round((doneCount / ordered.length) * 100) : 0;

  if (!loading && tier !== "full") return <Paywall title="Unlock all video lessons" />;

  return (
    <div className="pb-6">
      {/* Kopf: Titel + kompakter Fortschritt */}
      <div className="px-6 pt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Video lessons</h1>
          <p className="text-cream-dim mt-2">Follow the trail of lessons from the very basics up to advanced German — jump in anywhere.</p>
        </div>
        <div className="flex items-center gap-4 card px-5 py-3">
          <div>
            <div className="text-3xl font-bold text-gold-bright leading-none">{pct}%</div>
            <div className="text-xs text-cream-dim mt-1">{doneCount}/{ordered.length} lessons done</div>
          </div>
          <div className="w-24 h-2.5 rounded-full bg-bordeaux-deep/60 self-center">
            <div className="h-2.5 rounded-full bg-gold-bright transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Panorama-Pfad über die volle Breite */}
      <div className="mt-6">
        {loading ? (
          <p className="text-cream-dim px-6 py-10">Loading lessons…</p>
        ) : ordered.length === 0 ? (
          <div className="card p-6 text-cream-dim m-6">No lessons yet. Check back soon!</div>
        ) : (
          <PathMap items={items} />
        )}
      </div>
    </div>
  );
}
