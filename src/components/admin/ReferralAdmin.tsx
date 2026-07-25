"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import {
  listReferralStats,
  createReferralCode,
  setReferralActive,
  deleteReferralCode,
  type ReferralStat,
} from "@/lib/referral";

const SITE_URL = "https://www.germanwithmarvin.com";
const inputCls = "rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold text-sm";

function refLink(code: string) {
  return `${SITE_URL}/?ref=${encodeURIComponent(code)}`;
}
function money(cents: number, currency: string | null) {
  const cur = (currency ?? "usd").toUpperCase();
  const symbol = cur === "USD" ? "$" : cur === "EUR" ? "€" : "";
  return `${symbol}${(cents / 100).toFixed(2)}${symbol ? "" : " " + cur}`;
}

export default function ReferralAdmin() {
  const [rows, setRows] = useState<ReferralStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState("");
  const [influencer, setInfluencer] = useState("");
  const [custom, setCustom] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setRows(await listReferralStats());
    setLoading(false);
  }, []);
  useEffect(() => { reload(); }, [reload]);

  async function generate() {
    if (!partner.trim() && !influencer.trim()) { setError("Please enter at least a partner or an influencer name."); return; }
    setBusy(true); setError(null);
    const { error } = await createReferralCode({ partner, influencer, note, customCode: custom });
    setBusy(false);
    if (error) { setError(error); return; }
    setInfluencer(""); setCustom(""); setNote("");
    reload();
  }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
    } catch { /* ignore */ }
  }

  const totals = rows.reduce(
    (a, r) => ({ visits: a.visits + r.visits, customers: a.customers + r.customers, revenue: a.revenue + r.revenue_cents }),
    { visits: 0, customers: 0, revenue: 0 },
  );

  // Nach Vertriebspartner gruppieren, damit du je Partner die Summe siehst und
  // darunter die einzelnen Influencer-Codes. Codes ohne Partner unter „—".
  const groups = Array.from(
    rows.reduce((m, r) => {
      const key = r.partner.trim() || "—";
      (m.get(key) ?? m.set(key, []).get(key)!).push(r);
      return m;
    }, new Map<string, ReferralStat[]>()),
  );

  return (
    <div className="space-y-6">
      {/* Generator */}
      <div className="card p-5 space-y-3">
        <h3 className="font-semibold">Create a referral code</h3>
        <p className="text-xs text-cream-dim">
          One code per influencer. Give the partner the link — when people visit or pay through it, you see it below.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1 text-cream-dim">Partner (group)</label>
            <input value={partner} onChange={(e) => setPartner(e.target.value)} placeholder="e.g. Sales partner Tom" className={`${inputCls} w-full`} />
          </div>
          <div>
            <label className="block text-sm mb-1 text-cream-dim">Influencer / channel</label>
            <input value={influencer} onChange={(e) => setInfluencer(e.target.value)} placeholder="e.g. @deutschmitlena" className={`${inputCls} w-full`} />
          </div>
          <div>
            <label className="block text-sm mb-1 text-cream-dim">Custom code (optional)</label>
            <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="e.g. LENA10 — leave empty for random" className={`${inputCls} w-full`} />
          </div>
          <div>
            <label className="block text-sm mb-1 text-cream-dim">Note (optional)</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="internal note" className={`${inputCls} w-full`} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={generate} disabled={busy} className="btn-gold px-4 py-2 text-sm disabled:opacity-50">
            {busy ? "Creating…" : "Create code"}
          </button>
          {error && <span className="text-sm text-red-300">{error}</span>}
        </div>
      </div>

      {/* Auswertung */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Referral performance</h3>
          {!loading && rows.length > 0 && (
            <span className="text-xs text-cream-dim">
              Total: {totals.visits} visits · {totals.customers} paying · {money(totals.revenue, rows[0]?.currency ?? "usd")}
            </span>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-cream-dim">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-cream-dim">No codes yet. Create one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-cream-dim border-b border-gold/15">
                  <th className="py-2 pr-3">Code</th>
                  <th className="py-2 pr-3">Partner</th>
                  <th className="py-2 pr-3">Influencer</th>
                  <th className="py-2 pr-3 text-right">Visits</th>
                  <th className="py-2 pr-3 text-right">Paying</th>
                  <th className="py-2 pr-3 text-right">Revenue</th>
                  <th className="py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {groups.map(([partnerName, list]) => {
                  const sub = list.reduce(
                    (a, r) => ({ visits: a.visits + r.visits, customers: a.customers + r.customers, revenue: a.revenue + r.revenue_cents }),
                    { visits: 0, customers: 0, revenue: 0 },
                  );
                  const cur = list.find((r) => r.currency)?.currency ?? "usd";
                  return (
                    <Fragment key={partnerName}>
                      {/* Partner-Zwischensumme */}
                      <tr className="bg-gold/10 border-b border-gold/20">
                        <td className="py-2 pr-3 font-semibold" colSpan={3}>▸ Partner: {partnerName}</td>
                        <td className="py-2 pr-3 text-right font-semibold">{sub.visits}</td>
                        <td className="py-2 pr-3 text-right font-semibold">{sub.customers}</td>
                        <td className="py-2 pr-3 text-right font-semibold">{sub.revenue ? money(sub.revenue, cur) : "—"}</td>
                        <td className="py-2 pr-3"></td>
                      </tr>
                      {list.map((r) => (
                        <tr key={r.code} className={`border-b border-gold/10 ${r.active ? "" : "opacity-50"}`}>
                          <td className="py-2 pr-3 pl-4 font-mono font-semibold">{r.code}</td>
                          <td className="py-2 pr-3 text-cream-dim">{r.partner || "—"}</td>
                          <td className="py-2 pr-3">{r.influencer || "—"}</td>
                          <td className="py-2 pr-3 text-right">{r.visits}</td>
                          <td className="py-2 pr-3 text-right">{r.customers}</td>
                          <td className="py-2 pr-3 text-right">{r.revenue_cents ? money(r.revenue_cents, r.currency) : "—"}</td>
                          <td className="py-2 pr-3">
                            <div className="flex gap-2 justify-end whitespace-nowrap">
                              <button onClick={() => copy(refLink(r.code), r.code)} className="btn-outline px-2 py-1 text-xs">
                                {copied === r.code ? "Copied ✓" : "Copy link"}
                              </button>
                              <button onClick={async () => { await setReferralActive(r.code, !r.active); reload(); }} className="btn-outline px-2 py-1 text-xs">
                                {r.active ? "Disable" : "Enable"}
                              </button>
                              <button
                                onClick={async () => { if (confirm(`Delete code ${r.code}? Past stats are removed too.`)) { await deleteReferralCode(r.code); reload(); } }}
                                className="btn-outline px-2 py-1 text-xs text-red-300"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
