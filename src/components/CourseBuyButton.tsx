"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackCheckoutClick } from "@/lib/track";
import { getAttribution } from "@/lib/attribution";

// Kauf-Button für den B1-Gruppenkurs. Feuert InitiateCheckout, hängt die
// First-Touch-Attribution an (landet in den Stripe-Metadaten) und startet den
// Checkout. Nicht eingeloggt → erst kostenloses Konto (/register).
export default function CourseBuyButton({ label, className }: { label: string; className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function buy() {
    setBusy(true); setErr(null);
    trackCheckoutClick();
    try {
      const a = getAttribution();
      const res = await fetch("/api/group-course-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utm_source: a.utm_source, utm_medium: a.utm_medium, utm_campaign: a.utm_campaign, gclid: a.gclid, ref: a.ref }),
      });
      if (res.status === 401) { router.push("/register?src=b1-course"); return; }
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.url) { setErr(j.error ?? "Something went wrong. Please try again."); setBusy(false); return; }
      window.location.href = j.url as string;
    } catch {
      setErr("Network error. Please try again."); setBusy(false);
    }
  }

  return (
    <div>
      <button onClick={buy} disabled={busy} className={className}>{busy ? "…" : label}</button>
      {err && <p className="text-sm text-[#8A3030] mt-2">{err}</p>}
    </div>
  );
}
