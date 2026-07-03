"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { redeemCode } from "@/lib/codes";

export default function RedeemPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setOk(null);
    const res = await redeemCode(code.trim());
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "This code could not be redeemed.");
      return;
    }
    setOk(res.scope === "vocab" ? "Vocabulary trainer unlocked!" : "Full access unlocked!");
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1200);
  }

  return (
    <div className="max-w-md mx-auto mt-6">
      <h1 className="text-2xl font-bold">Redeem your access code</h1>
      <p className="text-cream-dim mt-2 text-sm">
        Got a code from Preply or Skool? Enter it here to unlock your access.
      </p>

      <form onSubmit={submit} className="card p-6 mt-6 space-y-4">
        <div>
          <label className="block text-sm mb-1 text-cream-dim">Access code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="XXXX-XXXX"
            className="w-full rounded-lg bg-bordeaux-deep/60 border border-gold/25 px-3 py-2 outline-none focus:border-gold tracking-widest text-center text-lg"
            autoFocus
          />
        </div>

        {error && <p className="text-sm text-red-300 bg-red-accent/15 rounded-lg p-3">{error}</p>}
        {ok && <p className="text-sm text-cream bg-green-accent/20 rounded-lg p-3">✓ {ok} Redirecting…</p>}

        <button type="submit" disabled={loading || !!ok} className="btn-gold w-full py-2.5 disabled:opacity-50">
          {loading ? "Checking…" : "Redeem code"}
        </button>
      </form>
    </div>
  );
}
