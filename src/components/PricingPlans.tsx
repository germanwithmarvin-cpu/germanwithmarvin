"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { APP_PRICE_MONTHLY, APP_YEARLY_PER_MONTH, APP_YEARLY_TOTAL, TAX_NOTE } from "@/lib/config";

const included = [
  "All video lessons (A1–B2)",
  "Interactive exercises after every lesson",
  "Smart flashcard trainer — 2,600+ cards",
  "The vocab game & reading stories",
  "Statistics & progress tracking",
];

function Check() {
  return <span className="text-[#2e7d32] font-bold mt-0.5">✓</span>;
}

export default function PricingPlans() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function buy(plan: "monthly" | "yearly") {
    setBusy(plan);
    setErr(null);
    try {
      const res = await fetch("/api/course-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      // Noch kein Konto / nicht eingeloggt → kostenloses Konto anlegen, dann zurück.
      if (res.status === 401) {
        router.push("/register");
        return;
      }
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.url) {
        setErr(j.error ?? "Something went wrong. Please try again.");
        setBusy(null);
        return;
      }
      window.location.href = j.url as string;
    } catch {
      setErr("Network error. Please try again.");
      setBusy(null);
    }
  }

  return (
    <div>
      {err && <p className="max-w-md mx-auto mb-5 text-sm text-center text-[#8A3030] bg-[#8A3030]/10 rounded-lg p-3">{err}</p>}
      <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto items-start">
        {/* Monatlich — mobil unter dem empfohlenen Jahresplan (order), Desktop links */}
        <div className="order-2 sm:order-1 bg-[#FBF2DA] rounded-2xl p-7 border border-black/5 shadow-sm">
          <h3 className="text-lg font-bold">Monthly</h3>
          <p className="mt-1 text-sm text-[#3B2922]/70">Full flexibility — cancel anytime.</p>
          <div className="mt-4">
            <span className="text-4xl font-bold">${APP_PRICE_MONTHLY}</span>
            <span className="text-[#3B2922]/70"> / month</span>
          </div>
          <p className="text-xs text-[#3B2922]/50 mt-1">{TAX_NOTE}</p>
          <button
            onClick={() => buy("monthly")}
            disabled={busy !== null}
            className="mt-5 w-full rounded-xl border-2 border-[#8A3030] text-[#8A3030] px-6 py-3 font-semibold hover:bg-[#8A3030]/5 transition disabled:opacity-50"
          >
            {busy === "monthly" ? "…" : "Choose monthly"}
          </button>
          <ul className="mt-5 space-y-2 text-sm">
            {included.map((f) => (
              <li key={f} className="flex gap-2"><Check /><span>{f}</span></li>
            ))}
          </ul>
        </div>

        {/* Jahr — empfohlen; mobil zuerst (order-1), Desktop rechts */}
        <div className="order-1 sm:order-2 relative bg-[#FBF2DA] rounded-2xl p-7 border-2 border-[#E3A12F] shadow-md">
          <span className="absolute -top-3 left-7 bg-[#E3A12F] text-[#3B2922] text-xs font-bold px-3 py-1 rounded-full">Best value</span>
          <h3 className="text-lg font-bold">Yearly</h3>
          <p className="mt-1 text-sm text-[#3B2922]/70">One payment for a full year.</p>
          <div className="mt-4">
            <span className="text-4xl font-bold">${APP_YEARLY_PER_MONTH}</span>
            <span className="text-[#3B2922]/70"> / month</span>
          </div>
          <p className="text-xs text-[#3B2922]/60 mt-1">${APP_YEARLY_TOTAL} billed once for 12 months · {TAX_NOTE}</p>
          <button
            onClick={() => buy("yearly")}
            disabled={busy !== null}
            className="mt-5 w-full rounded-xl bg-[#8A3030] text-white px-6 py-3 font-semibold hover:brightness-110 transition disabled:opacity-50"
          >
            {busy === "yearly" ? "…" : "Choose yearly"}
          </button>
          <ul className="mt-5 space-y-2 text-sm">
            {included.map((f) => (
              <li key={f} className="flex gap-2"><Check /><span>{f}</span></li>
            ))}
            <li className="flex gap-2"><Check /><span className="font-semibold">Save vs. monthly — two months free</span></li>
          </ul>
        </div>
      </div>
      <p className="text-center text-xs text-[#3B2922]/55 mt-6 max-w-md mx-auto">
        New here? Choosing a plan creates your free account first. Prices in USD; tax is added at checkout based on your location.
      </p>
    </div>
  );
}
