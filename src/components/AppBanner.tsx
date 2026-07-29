"use client";

import { useEffect, useState } from "react";
import { getVisibleBanners, type Banner } from "@/lib/banners";

// Zeigt vom Lehrer gesetzte Banner nach dem Login (global oder für genau diesen
// Schüler). Wegklickbar pro Banner (localStorage). Steht ganz oben im App-Layout.
const DISMISS_KEY = "gs_banner_dismissed_v1";

function toneStyle(tone: Banner["tone"]): React.CSSProperties {
  if (tone === "success") return { background: "var(--green-accent)", color: "#fff" };
  if (tone === "warning") return { background: "var(--gold-bright)", color: "#3b2116" };
  return { background: "var(--bordeaux-soft)", color: "var(--cream)" };
}

export default function AppBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    try { setDismissed(new Set(JSON.parse(localStorage.getItem(DISMISS_KEY) || "[]"))); } catch { /* egal */ }
    getVisibleBanners().then(setBanners).catch(() => {});
  }, []);

  function dismiss(id: string) {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem(DISMISS_KEY, JSON.stringify([...next])); } catch { /* egal */ }
      return next;
    });
  }

  const visible = banners.filter((b) => !dismissed.has(b.id));
  if (visible.length === 0) return null;

  return (
    <div>
      {visible.map((b) => (
        <div key={b.id} className="w-full px-4 py-2.5 text-sm flex items-center justify-center gap-3" style={toneStyle(b.tone)}>
          <span className="text-center">{b.message}</span>
          {b.ctaHref && b.ctaLabel && (
            <a href={b.ctaHref} className="underline underline-offset-2 font-semibold shrink-0">{b.ctaLabel}</a>
          )}
          <button onClick={() => dismiss(b.id)} className="ml-1 opacity-70 hover:opacity-100 shrink-0" aria-label="Dismiss">✕</button>
        </div>
      ))}
    </div>
  );
}
