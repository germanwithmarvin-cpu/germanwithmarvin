"use client";

import { useState } from "react";
import Link from "next/link";
import { trackCompleteRegistration } from "@/lib/track";
import { B1_COPY } from "@/lib/b1course";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Öffentliches Probestunden-Formular (kein Login). Speichert die Anfrage und
// schickt eine Bestätigungsmail mit dem festen Termin. Feuert CompleteRegistration.
export default function ProbestundeForm() {
  const c = B1_COPY.probestunde;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [time, setTime] = useState(c.timeOptions[0]);
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
      const res = await fetch("/api/trial-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), preferred_time: time, consent: true, consent_text: c.consent }),
      });
      if (res.ok) { trackCompleteRegistration(); setDone(true); }
      else { const j = await res.json().catch(() => ({})); setErr(j.error ?? "Something went wrong. Please try again."); }
    } catch {
      setErr("Network error. Please try again.");
    }
    setBusy(false);
  }

  if (done) return (
    <div className="rounded-2xl bg-[#FBF2DA] border border-[#E3A12F]/40 p-6 text-center space-y-2">
      <div className="text-3xl">🎉</div>
      <div className="text-lg font-bold text-[#8A3030]">{c.successTitle}</div>
      <p className="text-[#3B2922]/80 text-sm">{c.successBody}</p>
    </div>
  );

  return (
    <div className="rounded-2xl bg-[#FBF2DA] border border-[#E3A12F]/40 p-6 space-y-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={c.nameLabel} autoComplete="name"
        className="w-full rounded-xl px-4 py-3 outline-none bg-white border-2 border-[#E3A12F]/40 focus:border-[#E3A12F] text-[#3B2922]" />
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={c.emailLabel} autoComplete="email"
        className="w-full rounded-xl px-4 py-3 outline-none bg-white border-2 border-[#E3A12F]/40 focus:border-[#E3A12F] text-[#3B2922]" />
      <div>
        <div className="text-sm text-[#3B2922]/75 mb-1">{c.timeLabel}</div>
        <select value={time} onChange={(e) => setTime(e.target.value)}
          className="w-full rounded-xl px-4 py-3 outline-none bg-white border-2 border-[#E3A12F]/40 focus:border-[#E3A12F] text-[#3B2922]">
          {c.timeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <label className="flex items-start gap-2 text-xs text-[#3B2922]/75">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
        <span>{c.consent} <Link href="/datenschutz" className="underline">Privacy</Link>.</span>
      </label>
      {err && <p className="text-sm text-[#8A3030]">{err}</p>}
      <button onClick={submit} disabled={busy} className="w-full py-3 rounded-xl bg-[#8A3030] text-white font-bold hover:brightness-110 disabled:opacity-50">
        {busy ? c.busy : c.button}
      </button>
    </div>
  );
}
