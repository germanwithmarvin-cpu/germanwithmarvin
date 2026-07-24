"use client";

import { useEffect, useState } from "react";

// Einklappbares News-Widget unten links. Klappt beim ersten Besuch auf, danach
// bleibt es als kleine „📣 News"-Pille sichtbar. Neue Meldungen einfach oben in
// NEWS ergänzen und SEEN_KEY hochzählen (dann klappt es bei allen erneut auf).
//
// So pflegt Marvin die Infos: NEWS-Array bearbeiten (neueste zuerst).

type NewsItem = { date: string; title: string; body: React.ReactNode };

const NEWS: NewsItem[] = [
  {
    date: "July 2026",
    title: "Welcome — the platform keeps growing 🌱",
    body: (
      <>
        German Simplified is still being polished — I&apos;m continuously adding new exercises and
        vocabulary. Got a request or a topic you&apos;d like to see next? I&apos;d genuinely love to hear it:{" "}
        <a href="mailto:germanwithmarvin@gmail.com" className="text-gold-bright underline underline-offset-2">
          germanwithmarvin@gmail.com
        </a>
        . — Marvin
      </>
    ),
  },
];

const SEEN_KEY = "gs_news_seen_v1"; // bei neuer Meldung hochzählen → klappt wieder auf

export default function NewsWidget() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN_KEY)) {
        setOpen(true);
        localStorage.setItem(SEEN_KEY, "1");
      }
    } catch { /* localStorage evtl. blockiert */ }
  }, []);

  if (NEWS.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-5 z-40 flex flex-col items-start gap-3">
      {open && (
        <div
          className="card w-[min(88vw,340px)] p-4"
          style={{ boxShadow: "0 18px 50px rgba(0,0,0,.45)" }}
          role="dialog"
          aria-label="News"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="font-bold text-cream flex items-center gap-1.5">📣 What&apos;s new</div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="shrink-0 text-cream-dim hover:text-cream text-lg leading-none -mt-1"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 space-y-4 max-h-[60vh] overflow-auto">
            {NEWS.map((n, i) => (
              <div key={i} className={i > 0 ? "pt-3 border-t border-gold/15" : ""}>
                <div className="text-[11px] uppercase tracking-wide text-cream-dim">{n.date}</div>
                <div className="font-semibold text-cream mt-0.5">{n.title}</div>
                <p className="text-sm text-cream-dim mt-1 leading-relaxed">{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close news" : "Open news"}
        className="rounded-full px-4 py-2 text-sm font-bold shadow-xl transition hover:scale-105 flex items-center gap-1.5"
        style={{
          background: "var(--surface)",
          color: "var(--bordeaux)",
          border: "1.5px solid color-mix(in srgb, var(--gold) 45%, transparent)",
          boxShadow: "0 10px 30px rgba(0,0,0,.35)",
        }}
      >
        {open ? "✕ Close" : "📣 News"}
      </button>
    </div>
  );
}
