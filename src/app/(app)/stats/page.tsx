"use client";

import { useEffect, useState } from "react";
import { getStats, type Stats } from "@/lib/stats";

function StatCard({ value, label, accent }: { value: string | number; label: string; accent?: boolean }) {
  return (
    <div className="card p-5">
      <div className={`text-3xl font-bold ${accent ? "text-gold-bright" : "text-cream"}`}>{value}</div>
      <div className="text-sm text-cream-dim mt-1">{label}</div>
    </div>
  );
}

// Einfaches Balkendiagramm der Wiederholungen pro Tag (letzte 30 Tage).
function ReviewChart({ stats }: { stats: Stats }) {
  const data = stats.reviewsByDay;
  const max = Math.max(1, ...data.map((d) => d.count));
  const W = 640, H = 160, pad = 24;
  const barW = (W - pad * 2) / data.length;

  return (
    <div className="card p-5 overflow-x-auto">
      <h3 className="font-semibold mb-3">Reviews — last 30 days</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Reviews per day">
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="var(--gold)" strokeOpacity="0.25" />
        {data.map((d, i) => {
          const h = (d.count / max) * (H - pad * 2);
          const x = pad + i * barW;
          const y = H - pad - h;
          return (
            <rect key={d.date} x={x + 1} y={y} width={Math.max(1, barW - 2)} height={h}
              rx="2" fill="var(--gold-bright)" opacity={d.count ? 0.9 : 0.15}>
              <title>{d.date}: {d.count} review{d.count === 1 ? "" : "s"}</title>
            </rect>
          );
        })}
      </svg>
      <div className="flex justify-between text-xs text-cream-dim mt-1">
        <span>{data[0]?.date.slice(5)}</span>
        <span>today</span>
      </div>
    </div>
  );
}

// Aufteilung gelernter Karten: lernend vs. reif.
function MaturityBar({ stats }: { stats: Stats }) {
  const total = Math.max(1, stats.studied);
  const learnPct = (stats.learning / total) * 100;
  const maturePct = (stats.mature / total) * 100;
  return (
    <div className="card p-5">
      <h3 className="font-semibold mb-3">Your cards</h3>
      {stats.studied === 0 ? (
        <p className="text-sm text-cream-dim">No cards studied yet. Start a review to see progress here.</p>
      ) : (
        <>
          <div className="flex h-4 rounded-full overflow-hidden bg-bordeaux-deep/60">
            <div style={{ width: `${learnPct}%`, background: "var(--gold)" }} title={`Learning: ${stats.learning}`} />
            <div style={{ width: `${maturePct}%`, background: "var(--green-accent)" }} title={`Mature: ${stats.mature}`} />
          </div>
          <div className="flex gap-4 text-sm mt-3">
            <span><span className="inline-block w-3 h-3 rounded-sm align-middle mr-1" style={{ background: "var(--gold)" }} /> Learning: {stats.learning}</span>
            <span><span className="inline-block w-3 h-3 rounded-sm align-middle mr-1" style={{ background: "var(--green-accent)" }} /> Mature (≥21d): {stats.mature}</span>
          </div>
        </>
      )}
    </div>
  );
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  if (!stats) return <p className="text-cream-dim">Loading…</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold">Statistics</h1>
      <p className="text-cream-dim mt-2 mb-6">Your learning progress at a glance.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard value={`🔥 ${stats.streak}`} label="Day streak" accent />
        <StatCard value={stats.studied} label="Cards studied" />
        <StatCard value={`${stats.accuracy}%`} label="Accuracy" />
        <StatCard value={stats.totalReviews} label="Total reviews" />
      </div>

      <div className="mt-6 space-y-6">
        <ReviewChart stats={stats} />
        <MaturityBar stats={stats} />
      </div>
    </div>
  );
}
