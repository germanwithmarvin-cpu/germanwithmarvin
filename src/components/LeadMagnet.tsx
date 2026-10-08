"use client";

import { useState } from "react";

// E-Mail-Formular für den Lead-Magnet (gratis A1-Story). Speichert den Lead und
// schickt das PDF per Mail; nach Erfolg zusätzlich Direkt-Download.
export default function LeadMagnet({ source = "a1-stories" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [marketing, setMarketing] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/lead-magnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, marketing, source }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { setError(j.error ?? "Something went wrong. Please try again."); setState("idle"); return; }
      setPdfUrl(j.pdfUrl ?? null);
      setState("done");
    } catch {
      setError("Network error. Please try again.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="bg-[#FBF2DA] rounded-2xl p-6 border border-[#E3A12F]/40 text-center">
        <div className="text-3xl">📬</div>
        <h3 className="mt-2 text-lg font-bold text-[#8A3030]">Check your inbox!</h3>
        <p className="mt-1 text-sm text-[#3B2922]/75">We sent your free A1 story to <span className="font-semibold">{email}</span>.</p>
        {pdfUrl && (
          <a href={pdfUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block rounded-xl bg-[#8A3030] text-white px-6 py-3 font-semibold hover:brightness-110 transition">
            Download now (PDF)
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-[#FBF2DA] rounded-2xl p-6 border border-[#E3A12F]/40">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-lg border border-[#8A3030]/25 bg-white px-4 py-3 outline-none focus:border-[#8A3030]"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="rounded-lg bg-[#8A3030] text-white px-6 py-3 font-semibold hover:brightness-110 transition disabled:opacity-60 whitespace-nowrap"
        >
          {state === "loading" ? "…" : "Send me the story"}
        </button>
      </div>
      <label className="flex items-start gap-2 text-xs text-[#3B2922]/70 cursor-pointer mt-3">
        <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 accent-[#8A3030]" />
        <span>Also send me German learning tips &amp; occasional offers. Unsubscribe anytime.</span>
      </label>
      {error && <p className="text-sm text-[#8A3030] bg-[#8A3030]/10 rounded-lg p-2 mt-3">{error}</p>}
      <p className="text-xs text-[#3B2922]/50 mt-2">Free PDF. No spam.</p>
    </form>
  );
}
