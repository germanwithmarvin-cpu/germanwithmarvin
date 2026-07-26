"use client";

import { useEffect } from "react";

// Google-Ads-Tag (gtag.js). Lädt nur, wenn NEXT_PUBLIC_GOOGLE_ADS_ID gesetzt ist
// (Format: AW-XXXXXXXXX, aus Google Ads → Tools → Conversions). Feuert PageView/config.
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

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
    w.gtag("js", new Date());
    w.gtag("config", ADS_ID);
  }, []);
  return null;
}
