"use client";

import { useEffect, useState } from "react";

// Schlankes Cookie-Consent-Banner + Google Consent Mode v2.
// Zeigt sich nur, solange keine Entscheidung gespeichert ist. Accept/Decline
// aktualisiert den Consent-Status (Google + Meta, falls geladen) und merkt die
// Wahl in localStorage. Die Consent-DEFAULTS (denied im EWR) setzt GoogleAds.tsx.
const KEY = "gs_consent_v1";

function applyConsent(granted: boolean) {
  const v = granted ? "granted" : "denied";
  const w = window as unknown as { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };
  if (typeof w.gtag === "function") {
    w.gtag("consent", "update", { ad_storage: v, ad_user_data: v, ad_personalization: v, analytics_storage: v });
  }
  if (typeof w.fbq === "function") w.fbq("consent", granted ? "grant" : "revoke");
  try { localStorage.setItem(KEY, v); } catch { /* egal */ }
}

export default function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try { if (!localStorage.getItem(KEY)) setShow(true); } catch { /* egal */ }
  }, []);

  if (!show) return null;

  const choose = (granted: boolean) => { applyConsent(granted); setShow(false); };

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-[60] p-3 sm:p-4"
      style={{ background: "#241310", borderTop: "1px solid rgba(227,161,47,.35)", boxShadow: "0 -8px 30px rgba(0,0,0,.35)" }}
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-5">
        <p className="text-xs sm:text-sm leading-snug" style={{ color: "#F5E6C8" }}>
          We use cookies for advertising &amp; analytics. Essential features work either way — see our{" "}
          <a href="/datenschutz" className="underline underline-offset-2" style={{ color: "#E3A12F" }}>Privacy Policy</a>.
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => choose(false)}
            className="px-4 py-2 text-sm rounded-lg"
            style={{ border: "1px solid rgba(245,230,200,.4)", color: "#F5E6C8" }}
          >
            Decline
          </button>
          <button
            onClick={() => choose(true)}
            className="px-5 py-2 text-sm font-bold rounded-lg"
            style={{ background: "#E3A12F", color: "#241310" }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
