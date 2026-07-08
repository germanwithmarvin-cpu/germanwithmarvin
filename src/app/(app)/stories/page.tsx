"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Story } from "@/lib/data";
import { getStories } from "@/lib/stories";
import { getAccess, canAccessVideoLevel, type AccessTier } from "@/lib/access";
import { SITE } from "@/lib/config";

const LEVELS: Story["level"][] = ["A1", "A2", "B1", "B2", "C1"];
const LEVEL_LABEL: Record<Story["level"], string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper intermediate",
  C1: "Advanced",
};

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [tier, setTier] = useState<AccessTier>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAccess().then((a) => setTier(a.tier));
    getStories().then((s) => { setStories(s); setLoading(false); });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stories 📖</h1>
        <p className="text-cream-dim text-sm">
          Read short German stories at your level to build vocabulary and a feel for the language.
        </p>
      </div>

      {loading && <p className="text-sm text-cream-dim">Loading stories…</p>}
      {!loading && stories.length === 0 && (
        <p className="text-sm text-cream-dim">No stories yet — check back soon!</p>
      )}

      {!loading && stories.length > 0 && (
        <div className="space-y-8">
          {LEVELS.map((lv) => {
            const items = stories.filter((s) => s.level === lv);
            if (items.length === 0) return null;
            const levelLocked = !canAccessVideoLevel(tier, lv);

            return (
              <section key={lv} className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-bold text-gold-bright">{lv}</h2>
                  <span className="text-sm text-cream-dim">{LEVEL_LABEL[lv]}</span>
                  {levelLocked && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gold/15 text-gold-bright">
                      {tier === "vocab" ? "🎬 on Skool" : "🔒 needs an access code"}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {items.map((s) => {
                    const inner = (
                      <div className={`card p-5 flex items-center justify-between gap-4 transition ${levelLocked ? "opacity-60" : "hover:border-gold/50"}`}>
                        <div className="min-w-0">
                          <div className="text-lg font-semibold">{s.title}</div>
                          {s.intro && <div className="text-sm text-cream-dim mt-1">{s.intro}</div>}
                        </div>
                        <div className="text-2xl shrink-0">{levelLocked ? "🔒" : "📖"}</div>
                      </div>
                    );
                    if (levelLocked) {
                      return tier === "vocab" ? (
                        <a key={s.id} href={SITE.skoolUrl} target="_blank" rel="noopener noreferrer" title="Read on Skool">{inner}</a>
                      ) : (
                        <Link key={s.id} href="/redeem" title="Redeem your access code">{inner}</Link>
                      );
                    }
                    return <Link key={s.id} href={`/stories/${s.id}`}>{inner}</Link>;
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
