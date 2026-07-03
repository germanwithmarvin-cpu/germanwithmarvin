"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLearnedSummary, countFlagged } from "@/lib/study";
import { LEVELS } from "@/lib/types";

export default function ReviewPage() {
  const [summary, setSummary] = useState<{ total: number; byLevel: Record<string, number> } | null>(null);
  const [flagged, setFlagged] = useState(0);

  useEffect(() => {
    getLearnedSummary().then(setSummary);
    countFlagged().then(setFlagged);
  }, []);

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold">Review</h1>
      <p className="text-cream-dim mt-2">
        Freshen up cards you have already learned — all of them, by level, or just the ones you marked.
        This does not depend on which topic they came from.
      </p>

      {!summary ? (
        <p className="text-cream-dim mt-8">Loading…</p>
      ) : (
        <div className="mt-8 space-y-6">
          {/* Alle gelernten + markierte */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Tile
              href="/study/learned"
              disabled={summary.total === 0}
              icon="🔁"
              title="All learned cards"
              count={summary.total}
              note="Mix from every topic you have studied"
            />
            <Tile
              href="/study/marked"
              disabled={flagged === 0}
              icon="🔖"
              title="Marked cards"
              count={flagged}
              note="Cards you saved with the 🔖 button"
            />
          </div>

          {/* Nach Level */}
          <div>
            <h2 className="text-lg font-semibold mb-3">By level</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {LEVELS.filter((l) => (summary.byLevel[l] ?? 0) > 0).map((l) => (
                <Tile
                  key={l}
                  href={`/study/learned-${l}`}
                  icon="📚"
                  title={`${l} — learned cards`}
                  count={summary.byLevel[l]}
                  note="Review everything you know at this level"
                />
              ))}
              {LEVELS.every((l) => (summary.byLevel[l] ?? 0) === 0) && (
                <p className="text-sm text-cream-dim">Study some topics first — learned cards will show up here.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Tile({ href, icon, title, count, note, disabled }: { href: string; icon: string; title: string; count: number; note: string; disabled?: boolean }) {
  const inner = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-2xl font-bold text-gold-bright">{count}</span>
      </div>
      <div className="font-semibold mt-2">{title}</div>
      <div className="text-sm text-cream-dim mt-1">{note}</div>
    </>
  );
  if (disabled) {
    return <div className="card p-5 opacity-50">{inner}</div>;
  }
  return <Link href={href} className="card p-5 block hover:border-gold/40 transition">{inner}</Link>;
}
