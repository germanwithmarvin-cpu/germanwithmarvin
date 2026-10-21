"use client";

import { useEffect, useState } from "react";

type Row = { regs: number; tests: number; trials: number; paying: number };
type Data = {
  weeks: ({ weekStart: string } & Row)[];
  bySource: ({ source: string } & Row)[];
  payingActiveTotal: number;
  totalUsers: number;
  generatedAt: string;
};

const COLS: { key: keyof Row; label: string }[] = [
  { key: "regs", label: "Sign-ups" },
  { key: "tests", label: "Level tests" },
  { key: "trials", label: "Trials" },
  { key: "paying", label: "Paying" },
];

export default function MarketingAdmin() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/metrics", { method: "POST" })
      .then(async (r) => { if (!r.ok) throw new Error((await r.json()).error || "Error"); return r.json(); })
      .then(setData).catch((e) => setErr(String(e.message || e)));
  }, []);

  if (err) return <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-3">{err}</p>;
  if (!data) return <p className="text-sm text-cream-dim">Loading…</p>;

  const fmtWeek = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleDateString(undefined, { day: "numeric", month: "short", timeZone: "UTC" });
  const tot = (k: keyof Row) => data.weeks.reduce((n, w) => n + w[k], 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">Marketing 📊</h2>
        <p className="text-sm text-cream-dim mt-0.5">Last 8 weeks. Funnel: sign-ups → level tests → trials → paying.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Stat label="Total accounts" value={data.totalUsers} />
        <Stat label="Paying (active now)" value={data.payingActiveTotal} accent />
        {COLS.map((c) => <Stat key={c.key} label={`${c.label} (8 wk)`} value={tot(c.key)} />)}
      </div>

      {/* Weekly */}
      <div className="card p-4 overflow-x-auto">
        <div className="font-semibold mb-3">By week</div>
        <table className="w-full text-sm">
          <thead><tr className="text-cream-dim text-left">
            <th className="py-1.5 pr-4">Week of</th>
            {COLS.map((c) => <th key={c.key} className="py-1.5 px-3 text-right">{c.label}</th>)}
          </tr></thead>
          <tbody>
            {data.weeks.map((w) => (
              <tr key={w.weekStart} className="border-t border-gold/10">
                <td className="py-1.5 pr-4 font-medium">{fmtWeek(w.weekStart)}</td>
                {COLS.map((c) => <td key={c.key} className="py-1.5 px-3 text-right tabular-nums">{w[c.key] || <span className="text-cream-dim/40">·</span>}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* By source */}
      <div className="card p-4 overflow-x-auto">
        <div className="font-semibold mb-3">By source (utm_source)</div>
        {data.bySource.length === 0 ? <p className="text-sm text-cream-dim">No data yet.</p> : (
          <table className="w-full text-sm">
            <thead><tr className="text-cream-dim text-left">
              <th className="py-1.5 pr-4">Source</th>
              {COLS.map((c) => <th key={c.key} className="py-1.5 px-3 text-right">{c.label}</th>)}
            </tr></thead>
            <tbody>
              {data.bySource.map((s) => (
                <tr key={s.source} className="border-t border-gold/10">
                  <td className="py-1.5 pr-4 font-medium">{s.source}</td>
                  {COLS.map((c) => <td key={c.key} className="py-1.5 px-3 text-right tabular-nums">{s[c.key] || <span className="text-cream-dim/40">·</span>}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-cream-dim leading-relaxed">
        <b className="text-cream">Definitions:</b> Sign-ups = new accounts. Level tests = completed free tests.
        Trials = new accounts that got trial access. Paying = active Stripe subscriptions + yearly one-time access
        (dated best-effort). “direct” = no utm_source (typed URL, bio link without utm, or other referrer).
      </p>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-xl px-4 py-3 border ${accent ? "border-gold/40 bg-gold/10" : "border-gold/15 bg-bordeaux-deep/30"}`}>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-cream-dim">{label}</div>
    </div>
  );
}
