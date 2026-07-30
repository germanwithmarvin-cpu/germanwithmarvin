"use client";

import { useEffect, useState } from "react";

type DiscountCode = { id: string; code: string; price: number | null; timesRedeemed: number; maxRedemptions: number | null };

export default function DiscountCodesAdmin() {
  const [items, setItems] = useState<DiscountCode[] | null>(null);
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/discount-codes");
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Could not load codes."); setItems([]); return; }
      setItems(data.items ?? []);
    } catch { setItems([]); }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setMsg(null);
    const p = Number(price);
    if (!Number.isFinite(p) || p <= 0) { setError("Enter a monthly price greater than 0."); return; }
    setBusy(true);
    const res = await fetch("/api/discount-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code || undefined, price: p, maxRedemptions: maxRedemptions || undefined }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { setError(data.error || "Could not create code."); return; }
    setMsg(`Created “${data.code}” → $${data.price}/month.`);
    setCode(""); setPrice(""); setMaxRedemptions("");
    load();
  }

  async function deactivate(id: string, c: string) {
    if (!confirm(`Turn off code “${c}”? Existing subscribers keep their price; the code just stops working for new checkouts.`)) return;
    const res = await fetch(`/api/discount-codes?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) load(); else { const d = await res.json().catch(() => ({})); setError(d.error || "Could not turn off code."); }
  }

  const inputCls = "rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 text-sm outline-none focus:border-gold";

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold">Discount codes (custom price) 🏷️</h3>
        <p className="text-sm text-cream-dim mt-0.5">
          Create a code that sets the monthly subscription price for whoever uses it. The customer enters the code at checkout.
          <span className="block mt-1">⚠️ Enable <b className="text-cream">“Allow promotion codes”</b> on your Stripe Payment Link once, otherwise there’s no field to enter the code.</span>
        </p>
      </div>

      <form onSubmit={create} className="card p-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-cream-dim">
          Code (optional)
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. SUMMER25" className={`${inputCls} w-40`} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-cream-dim">
          Monthly price ($)
          <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="1" max="38" step="0.01" placeholder="19" required className={`${inputCls} w-28`} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-cream-dim">
          Max uses (optional)
          <input value={maxRedemptions} onChange={(e) => setMaxRedemptions(e.target.value)} type="number" min="1" placeholder="∞" className={`${inputCls} w-28`} />
        </label>
        <button type="submit" disabled={busy} className="btn-gold px-4 py-2 text-sm disabled:opacity-50">{busy ? "Creating…" : "Create code"}</button>
      </form>

      {msg && <p className="text-sm text-cream bg-green-accent/20 rounded-lg p-3">{msg}</p>}
      {error && <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-3">{error}</p>}

      {items === null ? (
        <p className="text-sm text-cream-dim">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-cream-dim">No discount codes yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.id} className="card p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="font-mono font-bold text-cream">{it.code}</span>
                <span className="text-sm text-cream-dim ml-2">→ {it.price != null ? `$${it.price}/month` : "custom discount"}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-cream-dim shrink-0">
                <span>{it.timesRedeemed} used{it.maxRedemptions ? ` / ${it.maxRedemptions}` : ""}</span>
                <button onClick={() => deactivate(it.id, it.code)} className="text-red-700 hover:underline">Turn off</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
