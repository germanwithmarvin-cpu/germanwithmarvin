"use client";

import { useEffect } from "react";

// Meta- (Facebook/Instagram) Pixel. Lädt nur, wenn NEXT_PUBLIC_META_PIXEL_ID
// gesetzt ist (in Vercel → Settings → Environment Variables). Feuert PageView.
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function MetaPixel() {
  useEffect(() => {
    if (!PIXEL_ID) return;
    const w = window as unknown as { fbq?: (...a: unknown[]) => void };
    if (w.fbq) return; // schon geladen
    /* eslint-disable @typescript-eslint/no-explicit-any, prefer-spread, prefer-rest-params, @typescript-eslint/no-unused-expressions */
    (function (f: any, b: any, e: string, v: string) {
      if (f.fbq) return;
      const n: any = (f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      });
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
      const t = b.createElement(e); t.async = true; t.src = v;
      const s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable @typescript-eslint/no-explicit-any, prefer-spread, prefer-rest-params, @typescript-eslint/no-unused-expressions */
    w.fbq!("init", PIXEL_ID);
    w.fbq!("track", "PageView");
  }, []);
  return null;
}
