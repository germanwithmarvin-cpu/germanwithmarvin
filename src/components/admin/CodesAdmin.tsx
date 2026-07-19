"use client";

import { useEffect, useState, useCallback } from "react";
import { listCodes, createCodes, setCodeActive, deleteCode, type AccessCode, type CodeScope } from "@/lib/codes";

const inputCls = "rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold text-sm";

export default function CodesAdmin() {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(true);
  const scope: CodeScope = "full"; // Codes geben immer Vollzugang
  const [kind, setKind] = useState<"single" | "community">("single");
  const [count, setCount] = useState(10);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [justCreated, setJustCreated] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setCodes(await listCodes());
    setLoading(false);
  }, []);
  useEffect(() => { reload(); }, [reload]);

  async function generate() {
    setBusy(true);
    setError(null);
    setJustCreated([]);
    const single = kind === "single";
    const { error, codes: created } = await createCodes({ scope, count: single ? count : 1, singleUse: single, note });
    setBusy(false);
    if (error) { setError(error); return; }
    setJustCreated(created);
    reload();
  }

  async function toggle(c: AccessCode) {
    await setCodeActive(c.code, !c.active);
    reload();
  }
  async function remove(c: AccessCode) {
    if (!confirm(`Delete code ${c.code}? People who already redeemed it keep their access.`)) return;
    await deleteCode(c.code);
    reload();
  }

  return (
    <div className="space-y-6">
      {/* Generator */}
      <div className="card p-5 space-y-3">
        <h3 className="font-semibold">Generate access codes</h3>
        <p className="text-xs text-cream-dim">Codes give full access. Use them for Preply/Skool students.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1 text-cream-dim">Type</label>
            <select value={kind} onChange={(e) => setKind(e.target.value as "single" | "community")} className={`${inputCls} w-full`}>
              <option value="single">Individual codes (single-use, e.g. Preply)</option>
              <option value="community">Community code (reusable, e.g. Skool)</option>
            </select>
          </div>
          {kind === "single" && (
            <div>
              <label className="block text-sm mb-1 text-cream-dim">How many</label>
              <input type="number" min={1} max={200} value={count} onChange={(e) => setCount(Number(e.target.value))} className={`${inputCls} w-full`} />
            </div>
          )}
          <div>
            <label className="block text-sm mb-1 text-cream-dim">Note (optional)</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Preply July" className={`${inputCls} w-full`} />
          </div>
        </div>
        {error && <p className="text-sm text-red-700 bg-red-accent/15 rounded-lg p-2">{error}</p>}
        <button onClick={generate} disabled={busy} className="btn-gold px-5 py-2.5 text-sm disabled:opacity-50">
          {busy ? "Creating…" : kind === "single" ? `Create ${count} code${count === 1 ? "" : "s"}` : "Create community code"}
        </button>

        {justCreated.length > 0 && (
          <div className="rounded-lg bg-bordeaux-deep/50 border border-gold/20 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gold-bright">New codes — copy them now:</span>
              <button onClick={() => navigator.clipboard.writeText(justCreated.join("\n"))} className="btn-outline px-2 py-1 text-xs">Copy all</button>
            </div>
            <div className="font-mono text-sm space-y-0.5 max-h-40 overflow-auto">
              {justCreated.map((c) => <div key={c}>{c}</div>)}
            </div>
          </div>
        )}
      </div>

      {/* Liste */}
      <div>
        <h3 className="font-semibold mb-2">All codes ({codes.length})</h3>
        {loading && <p className="text-sm text-cream-dim">Loading…</p>}
        {!loading && codes.length === 0 && <p className="text-sm text-cream-dim">No codes yet.</p>}
        <div className="space-y-2">
          {codes.map((c) => (
            <div key={c.code} className="card p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="font-mono font-medium">{c.code}</span>
                <span className="text-xs text-cream-dim ml-2">
                  {c.scope === "vocab" ? "vocab" : "full"} ·
                  {c.max_uses === null ? " community" : ` single-use`} ·
                  used {c.used_count}{c.max_uses ? `/${c.max_uses}` : ""}
                  {c.note ? ` · ${c.note}` : ""}
                  {!c.active ? " · inactive" : ""}
                </span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => navigator.clipboard.writeText(c.code)} className="text-xs text-cream-dim hover:text-cream">Copy</button>
                <button onClick={() => toggle(c)} className="text-xs text-cream-dim hover:text-cream">{c.active ? "Disable" : "Enable"}</button>
                <button onClick={() => remove(c)} className="text-xs text-red-700 hover:text-red-700">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
