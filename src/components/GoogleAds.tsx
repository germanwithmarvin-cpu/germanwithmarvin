"use client";

import { useEffect } from "react";

// Google-Ads-Tag (gtag.js) mit Google Consent Mode v2. Feuert PageView/config.
// Konto-Tag von Marvin fest hinterlegt; per NEXT_PUBLIC_GOOGLE_ADS_ID überschreibbar.
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-18352653705";

// EWR + UK + Schweiz: hier verlangt das Gesetz vorherige Einwilligung → Cookies
// standardmäßig „denied" bis zur Zustimmung. Außerhalb läuft es normal (granted).
const CONSENT_REGIONS = [
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV",
  "LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","IS","LI","NO","GB","CH",
];

export default function GoogleAds() {
  useEffect(() => {
    if (!ADS_ID || document.getElementById("gtag-js")) return;
    const s = document.createElement("script");
    s.id = "gtag-js"; s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`;
    document.head.appendChild(s);
    const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void };
    w.dataLayer = w.dataLayer || [];
    // eslint-disable-next-line prefer-rest-params
    w.gtag = function () { w.dataLayer!.push(arguments); };
    // 1) Consent-Defaults ZUERST (vor config): weltweit erlaubt, in CONSENT_REGIONS gesperrt.
    w.gtag("consent", "default", {
      ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted", analytics_storage: "granted",
    });
    w.gtag("consent", "default", {
      ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied",
      region: CONSENT_REGIONS, wait_for_update: 500,
    });
    // 2) Tag laden/konfigurieren.
    w.gtag("js", new Date());
    w.gtag("config", ADS_ID);
    // 3) Frühere Entscheidung des Nutzers sofort anwenden (kein Warten aufs Banner).
    let stored: string | null = null;
    try { stored = localStorage.getItem("gs_consent_v1"); } catch { /* egal */ }
    if (stored === "granted" || stored === "denied") {
      w.gtag("consent", "update", {
        ad_storage: stored, ad_user_data: stored, ad_personalization: stored, analytics_storage: stored,
      });
    }
  }, []);
  return null;
}
