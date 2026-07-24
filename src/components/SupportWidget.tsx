"use client";

import { useState } from "react";
import { SITE } from "@/lib/config";

// Schwebender Support-Knopf unten rechts. Ohne externen Chat-Dienst: die
// Nachricht wird als vorbereitete E-Mail an den Support geöffnet (mailto).
// So braucht es kein Fremd-Skript und keine zusätzlichen Kosten – und die
// Anfrage landet direkt in Marvins Postfach.
export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  function send() {
    const subject = "Support – German Simplified";
    const body = msg.trim() || "Hi Marvin,\n\n";
    window.location.href = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className="card w-[min(88vw,340px)] p-4 shadow-2xl"
          style={{ boxShadow: "0 18px 50px rgba(0,0,0,.45)" }}
          role="dialog"
          aria-label="Support chat"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-bold text-cream">Need a hand? 💬</div>
              <p className="text-xs text-cream-dim mt-0.5">
                A question about a lesson, your access, or anything else? Write to us — Marvin replies personally.
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="shrink-0 text-cream-dim hover:text-cream text-lg leading-none -mt-1"
            >
              ✕
            </button>
          </div>

          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            rows={4}
            placeholder="Type your message…"
            className="mt-3 w-full rounded-xl bg-bordeaux-deep/60 border border-gold/20 p-3 text-sm text-cream placeholder:text-cream-dim/70 focus:outline-none focus:border-gold/50 resize-none"
          />

          <button onClick={send} className="btn-gold w-full py-2.5 mt-2 font-bold text-sm">
            Send message →
          </button>
          <p className="text-[11px] text-cream-dim mt-2 text-center">
            Opens your email app · or write to{" "}
            <a href={`mailto:${SITE.contactEmail}`} className="text-gold-bright underline underline-offset-2">
              {SITE.contactEmail}
            </a>
          </p>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close support" : "Open support chat"}
        className="w-14 h-14 rounded-full grid place-items-center text-2xl shadow-xl transition hover:scale-105"
        style={{
          background: "linear-gradient(160deg, var(--gold-bright), var(--gold))",
          color: "#3b2116",
          boxShadow: "0 10px 30px rgba(0,0,0,.4)",
        }}
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
