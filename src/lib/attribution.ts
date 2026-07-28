"use client";

// Herkunfts-/Kampagnen-Erfassung ("attribution"). Beim ersten Besuch merken wir
// uns, WOHER der Besucher kam – Google-Klick-ID (gclid), UTM-Parameter und den
// Referrer – in Cookies (First-Touch: der erste nicht-leere Wert je Feld bleibt).
// Beim Registrieren hängen wir das an die Signup-Metadaten, sodass es dauerhaft
// im Profil landet. Der Influencer-Code (?ref) kommt aus referral.ts dazu.

import { getRefCode } from "@/lib/referral";

const MAX_AGE = 60 * 60 * 24 * 90; // 90 Tage
const COOKIES = {
  utm_source: "gs_utm_source",
  utm_medium: "gs_utm_medium",
  utm_campaign: "gs_utm_campaign",
  gclid: "gs_gclid",
  referrer: "gs_referrer",
} as const;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

// First-Touch: nur setzen, wenn noch kein Wert existiert (überschreibt nie).
function setFirstTouch(name: string, value: string) {
  if (typeof document === "undefined" || !value) return;
  if (readCookie(name)) return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax`;
}

// Läuft global beim Seitenaufruf (im RefTracker). Liest URL-Parameter + Referrer.
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  const q = new URLSearchParams(window.location.search);

  setFirstTouch(COOKIES.utm_source, q.get("utm_source") ?? "");
  setFirstTouch(COOKIES.utm_medium, q.get("utm_medium") ?? "");
  setFirstTouch(COOKIES.utm_campaign, q.get("utm_campaign") ?? "");
  setFirstTouch(COOKIES.gclid, q.get("gclid") ?? "");

  // Referrer nur, wenn er von EXTERN kommt (nicht unsere eigene Domain) – sonst
  // würden interne Navigationen die echte Herkunft überschreiben.
  try {
    const ref = document.referrer;
    if (ref) {
      const host = new URL(ref).hostname;
      if (host && host !== window.location.hostname) {
        setFirstTouch(COOKIES.referrer, ref.slice(0, 300));
      }
    }
  } catch { /* referrer nicht lesbar – egal */ }
}

export type Attribution = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  gclid: string;
  referrer: string;
  ref: string;
};

// Beim Registrieren aufrufen: liefert die gemerkte Herkunft für die Metadaten.
export function getAttribution(): Attribution {
  return {
    utm_source: readCookie(COOKIES.utm_source) ?? "",
    utm_medium: readCookie(COOKIES.utm_medium) ?? "",
    utm_campaign: readCookie(COOKIES.utm_campaign) ?? "",
    gclid: readCookie(COOKIES.gclid) ?? "",
    referrer: readCookie(COOKIES.referrer) ?? "",
    ref: getRefCode() ?? "",
  };
}
