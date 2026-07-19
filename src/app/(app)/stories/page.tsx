"use client";

import { useEffect, useState } from "react";
import type { Story } from "@/lib/data";
import { getStories } from "@/lib/stories";
import { getReadStories } from "@/lib/storyProgress";
import { getAccess, type AccessTier } from "@/lib/access";
import Paywall from "@/components/Paywall";
import { PathMap, type PathItem } from "@/components/PathMap";

const LEVELS: Story["level"][] = ["A1", "A2", "B1", "B2", "C1"];
const LEVEL_LABEL: Record<Story["level"], string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper intermediate",
  C1: "Advanced",
};

const wordCount = (html: string) => html.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [read, setRead] = useState<string[]>([]);
  const [tier, setTier] = useState<AccessTier>("none");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAccess().then((a) => setTier(a.tier));
    getStories().then((s) => { setStories(s); setLoading(false); });
    setRead(getReadStories());
  }, []);

  // Alle Geschichten in Level-Reihenfolge = ein Lese-Pfad.
  const ordered = LEVELS.flatMap((lv) => stories.filter((s) => s.level === lv));
  const readSet = new Set(read);
  const firstUnread = ordered.findIndex((s) => !readSet.has(s.id));

  const items: PathItem[] = [];
  let prevLevel: Story["level"] | null = null;
  ordered.forEach((s, i) => {
    const isRead = readSet.has(s.id);
    const hasText = s.body.trim().length > 0;
    items.push({
      kind: "node",
      id: s.id,
      href: `/stories/${s.id}`,
      emoji: hasText ? "📖" : s.fileUrl ? "📕" : "📘",
      title: s.title,
      sub: hasText ? `${wordCount(s.body)} words` : s.fileUrl ? "PDF book" : "Story",
      state: isRead ? "done" : i === firstUnread ? "current" : "normal",
      frac: isRead ? 1 : 0,
      firstOfLevel: s.level !== prevLevel,
      level: s.level,
      levelLabel: LEVEL_LABEL[s.level],
    });
    prevLevel = s.level;
    const next = ordered[i + 1];
    const levelEnds = !next || next.level !== s.level;
    if (levelEnds) {
      items.push({
        kind: "trophy",
        id: `t-${i}`,
        earned: ordered.slice(0, i + 1).every((x) => readSet.has(x.id)),
        icon: "👑",
        name: `${s.level} stories`,
        champion: true,
      });
    }
  });

  const readCount = ordered.filter((s) => readSet.has(s.id)).length;
  const pct = ordered.length ? Math.round((readCount / ordered.length) * 100) : 0;

  if (!loading && tier !== "full") return <Paywall title="Unlock all reading stories" />;

  return (
    <div className="pb-6">
      {/* Kopf: Titel + Lese-Fortschritt */}
      <div className="px-6 pt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Stories 📖</h1>
          <p className="text-cream-dim mt-2">Follow the reading trail — short German stories from the basics up to advanced.</p>
        </div>
        <div className="flex items-center gap-4 card px-5 py-3">
          <div>
            <div className="text-3xl font-bold text-gold-bright leading-none">{pct}%</div>
            <div className="text-xs text-cream-dim mt-1">{readCount}/{ordered.length} stories read</div>
          </div>
          <div className="w-24 h-2.5 rounded-full bg-bordeaux-deep/60 self-center">
            <div className="h-2.5 rounded-full bg-gold-bright transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Panorama-Pfad über die volle Breite */}
      <div className="mt-6">
        {loading ? (
          <p className="text-cream-dim px-6 py-10">Loading stories…</p>
        ) : ordered.length === 0 ? (
          <div className="card p-6 text-cream-dim m-6">No stories yet — check back soon!</div>
        ) : (
          <PathMap items={items} />
        )}
      </div>
    </div>
  );
}
