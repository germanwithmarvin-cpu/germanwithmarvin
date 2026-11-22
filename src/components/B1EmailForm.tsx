"use client";

import { useState } from "react";
import Link from "next/link";
import { B1_COPY } from "@/lib/b1course";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Dezentes E-Mail-Formular für die kostenlose B1-Probeprüfung (Double-Opt-in).
// POSTet an /api/b1/subscribe; danach "Posteingang prüfen". Theme-konform.
export default function B1EmailForm({ source = "homepage" }: { source?: string }) {
  const c = B1_COPY.home;
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setErr(null);
    if (!EMAIL_RE.test(email.trim())) { setErr("Please enter a valid email."); return; }
    if (!consent) { setErr("Please tick the box to continue."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/b1/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), consent: true, source, consent_text: c.emailConsent }),
      });
      if (res.ok) setDone(true);
      else { const j = await res.json().catch(() => ({})); setErr(j.error ?? "Something went wrong. Please try again."); }
    } catch {
      setErr("Network error. Please try again.");
    }
    setBusy(false);
  }

  if (done) return (
    <div className="rounded-xl bg-[#FBF2DA] border border-[#E3A12F]/40 p-4 text-sm text-[#3B2922]/85 text-center">
      ✅ Check your inbox and click the link to confirm — then we&apos;ll send your free B1 test.
    </div>
  );

  return (
    <div className="rounded-2xl bg-[#FBF2DA] border border-[#E3A12F]/40 p-5 space-y-3">
      <p className="text-sm text-[#3B2922]/85">{c.emailPrompt}</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={c.emailLabel} autoComplete="email"
          className="flex-1 rounded-xl px-4 py-3 outline-none bg-white border-2 border-[#E3A12F]/40 focus:border-[#E3A12F] text-[#3B2922]" />
        <button onClick={submit} disabled={busy} className="rounded-xl bg-[#8A3030] text-white px-6 py-3 font-semibold hover:brightness-110 disabled:opacity-50 whitespace-nowrap">
          {busy ? "…" : c.emailButton}
        </button>
      </div>
      <label className="flex items-start gap-2 text-xs text-[#3B2922]/70">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
        <span>{c.emailConsent} <Link href="/datenschutz" className="underline">Privacy</Link>.</span>
      </label>
      {err && <p className="text-sm text-[#8A3030]">{err}</p>}
    </div>
  );
}
